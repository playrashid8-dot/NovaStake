// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    NovaStake - ownerless / immutable-config version

    Core model:
    - external fixed-supply NOVA token
    - daily reward accrues in full 24h cycles
    - rewards, referral income, salary rewards, matured principal => rewardBalance
    - claimAll() transfers rewardBalance to wallet with 5% fee to treasury
    - 5-level referral
    - 4 salary stages
    - directCount != teamCount
    - teamCount excludes directs
    - teamVolume excludes directs
    - unqualified referral rewards accrue into treasuryReferralBalance
*/

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NovaStake is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // =========================================================
    // CONSTANTS
    // =========================================================

    uint256 public constant BPS = 10_000;
    uint256 public constant PAYOUT_FEE_BPS = 500; // 5%
    uint256 public constant REF_LEVELS = 5;
    uint256 public constant SALARY_STAGES = 4;
    uint256 public constant PLAN_COUNT = 5;

    // =========================================================
    // IMMUTABLES
    // =========================================================

    IERC20 public immutable stakingToken;
    address public immutable treasuryWallet;
    uint8 public immutable tokenDecimals;
    uint256 public immutable UNIT;
    uint256 public immutable minStake;

    // =========================================================
    // STATS
    // =========================================================

    uint256 public totalUsers;
    uint256 public totalStakedVolume;
    uint256 public totalActivePrincipal;
    uint256 public totalClaimedToWallet;
    uint256 public totalReferralCredited;
    uint256 public totalSalaryCredited;
    uint256 public totalMaturedPrincipalMoved;
    uint256 public totalTreasuryFeesCollected;
    uint256 public totalUnqualifiedReferralSentToTreasury;

    // NEW: internal treasury accrual for unqualified referral rewards
    uint256 public treasuryReferralBalance;

    // =========================================================
    // STRUCTS
    // =========================================================

    struct StakeInfo {
        uint256 amount;
        uint256 totalReward;
        uint256 claimedReward;
        uint256 startTime;
        uint256 endTime;
        uint8 planId;
        bool withdrawn;
    }

    struct UserInfo {
        address referrer;
        bool registered;

        uint256 activePrincipal;
        uint256 totalStakedVolume;

        uint256 rewardBalance;
        uint256 totalClaimedFromBalance;

        uint256 directCount;
        uint256 teamCount;
        uint256 teamVolume;

        uint8 salaryStageClaimed;
    }

    struct UserSummary {
        address referrer;
        uint256 activePrincipal;
        uint256 totalStakedVolume;
        uint256 rewardBalance;
        uint256 directCount;
        uint256 teamCount;
        uint256 teamVolume;
        uint256 salaryStageClaimed;
        uint256 totalStakes;
        uint256 totalPendingRewards;
    }

    // =========================================================
    // STORAGE
    // =========================================================

    mapping(address => UserInfo) public users;
    mapping(address => StakeInfo[]) private _stakes;

    // =========================================================
    // EVENTS
    // =========================================================

    event ReferrerBound(address indexed user, address indexed referrer);

    event Staked(
        address indexed user,
        uint256 indexed stakeIndex,
        uint8 indexed planId,
        uint256 amount,
        uint256 totalReward,
        uint256 startTime,
        uint256 endTime
    );

    event RewardMovedToBalance(
        address indexed user,
        uint256 indexed stakeIndex,
        uint256 amount
    );

    event MaturedStakeMovedToBalance(
        address indexed user,
        uint256 indexed stakeIndex,
        uint256 principal,
        uint256 unclaimedReward
    );

    event ReferralCredited(
        address indexed fromUser,
        address indexed toUser,
        uint256 indexed level,
        uint256 amount
    );

    event UnqualifiedReferralSentToTreasury(
        address indexed fromUser,
        uint256 indexed level,
        uint256 amount
    );

    event TreasuryReferralAccrued(
        address indexed fromUser,
        uint256 indexed level,
        uint256 amount
    );

    event TreasuryReferralClaimed(
        address indexed treasury,
        uint256 amount
    );

    event SalaryCredited(
        address indexed user,
        uint256 indexed stageId,
        uint256 reward
    );

    event RewardBalanceClaimed(
        address indexed user,
        uint256 grossAmount,
        uint256 feeAmount,
        uint256 netAmount
    );

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    constructor(address token_, address treasury_) {
        require(token_ != address(0), "TOKEN_ZERO");
        require(treasury_ != address(0), "TREASURY_ZERO");

        stakingToken = IERC20(token_);
        treasuryWallet = treasury_;

        uint8 d = IERC20Metadata(token_).decimals();
        require(d <= 18, "UNSUPPORTED_DECIMALS");

        tokenDecimals = d;
        UNIT = 10 ** d;
        minStake = 10 * UNIT;
    }

    // =========================================================
    // PLAN CONFIG (IMMUTABLE VIA PURE/VIEW FUNCTIONS)
    // =========================================================

    function planMeta(uint256 planId)
        public
        pure
        returns (
            string memory name,
            uint256 duration,
            uint256 totalReturnBps,
            bool enabled
        )
    {
        if (planId == 0) return ("7 Days", 7 days, 700, true);
        if (planId == 1) return ("30 Days", 30 days, 4500, true);
        if (planId == 2) return ("90 Days", 90 days, 16000, true);
        if (planId == 3) return ("180 Days", 180 days, 40000, true);
        if (planId == 4) return ("360 Days", 360 days, 90000, true);
        revert("INVALID_PLAN");
    }

    function referralConfig(uint256 level)
        public
        view
        returns (uint256 rewardBps, uint256 requiredStake)
    {
        if (level == 0) return (1000, 50 * UNIT);
        if (level == 1) return (600, 100 * UNIT);
        if (level == 2) return (500, 300 * UNIT);
        if (level == 3) return (300, 500 * UNIT);
        if (level == 4) return (300, 1000 * UNIT);
        revert("INVALID_LEVEL");
    }

    function salaryStageMeta(uint256 stageId)
        public
        view
        returns (
            uint256 requiredDirect,
            uint256 requiredTeam,
            uint256 requiredTeamVolume,
            uint256 reward
        )
    {
        if (stageId == 1) return (8, 25, 3000 * UNIT, 50 * UNIT);
        if (stageId == 2) return (15, 50, 7000 * UNIT, 150 * UNIT);
        if (stageId == 3) return (25, 100, 20000 * UNIT, 350 * UNIT);
        if (stageId == 4) return (50, 300, 50000 * UNIT, 1000 * UNIT);
        revert("INVALID_STAGE");
    }

    // =========================================================
    // USER ACTIONS
    // =========================================================

    function stake(uint8 planId, uint256 amount, address referrer) external nonReentrant {
        (, uint256 duration, uint256 totalReturnBps, bool enabled) = planMeta(planId);

        require(enabled, "PLAN_DISABLED");
        require(amount >= minStake, "BELOW_MIN_STAKE");

        uint256 beforeBal = stakingToken.balanceOf(address(this));
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        uint256 afterBal = stakingToken.balanceOf(address(this));
        require(afterBal - beforeBal == amount, "FEE_ON_TRANSFER_NOT_ALLOWED");

        _bindReferrer(msg.sender, referrer);

        UserInfo storage u = users[msg.sender];
        if (!u.registered) {
            u.registered = true;
            unchecked {
                totalUsers += 1;
            }
        }

        uint256 totalReward = (amount * totalReturnBps) / BPS;

        u.activePrincipal += amount;
        u.totalStakedVolume += amount;

        totalStakedVolume += amount;
        totalActivePrincipal += amount;

        _stakes[msg.sender].push(
            StakeInfo({
                amount: amount,
                totalReward: totalReward,
                claimedReward: 0,
                startTime: block.timestamp,
                endTime: block.timestamp + duration,
                planId: planId,
                withdrawn: false
            })
        );

        _addNetworkVolume(msg.sender, amount);

        emit Staked(
            msg.sender,
            _stakes[msg.sender].length - 1,
            planId,
            amount,
            totalReward,
            block.timestamp,
            block.timestamp + duration
        );
    }

    function claimReward(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < _stakes[msg.sender].length, "INVALID_STAKE");

        StakeInfo storage s = _stakes[msg.sender][stakeIndex];
        require(!s.withdrawn, "STAKE_WITHDRAWN");

        uint256 claimable = pendingReward(msg.sender, stakeIndex);
        require(claimable > 0, "NO_REWARD");

        s.claimedReward += claimable;
        users[msg.sender].rewardBalance += claimable;

        _creditReferral(msg.sender, claimable);

        emit RewardMovedToBalance(msg.sender, stakeIndex, claimable);
    }

    function withdrawStake(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < _stakes[msg.sender].length, "INVALID_STAKE");

        StakeInfo storage s = _stakes[msg.sender][stakeIndex];
        require(!s.withdrawn, "ALREADY_WITHDRAWN");
        require(block.timestamp >= s.endTime, "NOT_MATURED");

        uint256 unclaimed = pendingReward(msg.sender, stakeIndex);

        if (unclaimed > 0) {
            s.claimedReward += unclaimed;
            users[msg.sender].rewardBalance += unclaimed;
            _creditReferral(msg.sender, unclaimed);
            emit RewardMovedToBalance(msg.sender, stakeIndex, unclaimed);
        }

        s.withdrawn = true;

        UserInfo storage u = users[msg.sender];
        u.activePrincipal -= s.amount;
        totalActivePrincipal -= s.amount;

        u.rewardBalance += s.amount;
        totalMaturedPrincipalMoved += s.amount;

        emit MaturedStakeMovedToBalance(msg.sender, stakeIndex, s.amount, unclaimed);
    }

    function claimSalary() external nonReentrant {
        UserInfo storage u = users[msg.sender];

        uint256 nextStage = uint256(u.salaryStageClaimed) + 1;
        require(nextStage <= SALARY_STAGES, "NO_NEXT_STAGE");

        (
            uint256 requiredDirect,
            uint256 requiredTeam,
            uint256 requiredTeamVolume,
            uint256 reward
        ) = salaryStageMeta(nextStage);

        require(u.activePrincipal >= minStake, "NO_ACTIVE_STAKE");
        require(u.directCount >= requiredDirect, "DIRECT_NOT_MET");
        require(u.teamCount >= requiredTeam, "TEAM_NOT_MET");
        require(u.teamVolume >= requiredTeamVolume, "TEAM_VOLUME_NOT_MET");

        u.salaryStageClaimed = uint8(nextStage);
        u.rewardBalance += reward;
        totalSalaryCredited += reward;

        emit SalaryCredited(msg.sender, nextStage, reward);
    }

    function claimAll() external nonReentrant {
        UserInfo storage u = users[msg.sender];
        uint256 amount = u.rewardBalance;
        require(amount > 0, "NO_BALANCE");

        u.rewardBalance = 0;
        u.totalClaimedFromBalance += amount;

        uint256 fee = (amount * PAYOUT_FEE_BPS) / BPS;
        uint256 net = amount - fee;

        if (fee > 0) {
            stakingToken.safeTransfer(treasuryWallet, fee);
            totalTreasuryFeesCollected += fee;
        }

        stakingToken.safeTransfer(msg.sender, net);
        totalClaimedToWallet += net;

        emit RewardBalanceClaimed(msg.sender, amount, fee, net);
    }

    /// @notice Treasury wallet claims internally accrued unqualified referral rewards
    function claimTreasuryReferralBalance() external nonReentrant {
        require(msg.sender == treasuryWallet, "NOT_TREASURY");

        uint256 amount = treasuryReferralBalance;
        require(amount > 0, "NO_TREASURY_BALANCE");

        treasuryReferralBalance = 0;

        stakingToken.safeTransfer(treasuryWallet, amount);

        emit TreasuryReferralClaimed(treasuryWallet, amount);
    }

    // =========================================================
    // VIEWS
    // =========================================================

    function getStakeCount(address user) external view returns (uint256) {
        return _stakes[user].length;
    }

    function getUserStakes(address user) external view returns (StakeInfo[] memory) {
        return _stakes[user];
    }

    function getStakeInfo(address user, uint256 stakeIndex) external view returns (StakeInfo memory) {
        require(stakeIndex < _stakes[user].length, "INVALID_STAKE");
        return _stakes[user][stakeIndex];
    }

    function nextClaimTime(address user, uint256 stakeIndex) public view returns (uint256) {
        require(stakeIndex < _stakes[user].length, "INVALID_STAKE");

        StakeInfo memory s = _stakes[user][stakeIndex];
        if (s.withdrawn) return 0;

        (, uint256 duration,,) = planMeta(s.planId);
        uint256 totalDays = duration / 1 days;
        if (totalDays == 0 || s.totalReward == 0) return 0;

        uint256 claimedDays = (s.claimedReward * totalDays) / s.totalReward;
        uint256 nextTime = s.startTime + ((claimedDays + 1) * 1 days);

        return nextTime > s.endTime ? s.endTime : nextTime;
    }

    function pendingReward(address user, uint256 stakeIndex) public view returns (uint256) {
        require(stakeIndex < _stakes[user].length, "INVALID_STAKE");

        StakeInfo memory s = _stakes[user][stakeIndex];
        if (s.withdrawn) return 0;

        (, uint256 duration,,) = planMeta(s.planId);

        uint256 effectiveTime = block.timestamp;
        if (effectiveTime > s.endTime) {
            effectiveTime = s.endTime;
        }

        if (effectiveTime < s.startTime + 1 days) {
            return 0;
        }

        uint256 elapsedDays = (effectiveTime - s.startTime) / 1 days;
        uint256 totalDays = duration / 1 days;

        if (elapsedDays == 0 || totalDays == 0) return 0;
        if (elapsedDays > totalDays) elapsedDays = totalDays;

        uint256 accrued = (s.totalReward * elapsedDays) / totalDays;
        if (accrued <= s.claimedReward) return 0;

        return accrued - s.claimedReward;
    }

    function getAllPendingRewards(address user) public view returns (uint256 totalPending) {
        uint256 count = _stakes[user].length;
        for (uint256 i = 0; i < count; ) {
            totalPending += pendingReward(user, i);
            unchecked {
                ++i;
            }
        }
    }

    function canClaimSalary(address user) public view returns (bool) {
        UserInfo memory u = users[user];
        uint256 nextStage = uint256(u.salaryStageClaimed) + 1;
        if (nextStage > SALARY_STAGES) return false;

        (uint256 requiredDirect, uint256 requiredTeam, uint256 requiredTeamVolume, ) = salaryStageMeta(nextStage);

        return (
            u.activePrincipal >= minStake &&
            u.directCount >= requiredDirect &&
            u.teamCount >= requiredTeam &&
            u.teamVolume >= requiredTeamVolume
        );
    }

    function previewReferralOnReward(address user, uint256 rewardAmount)
        external
        view
        returns (
            uint256[REF_LEVELS] memory rewards,
            uint256[REF_LEVELS] memory treasuryRedirects,
            uint256 totalRewards,
            uint256 totalToTreasury
        )
    {
        address current = users[user].referrer;

        for (uint256 i = 0; i < REF_LEVELS; ) {
            if (current == address(0)) break;

            (uint256 rewardBps, uint256 requiredStake) = referralConfig(i);
            uint256 amount = (rewardAmount * rewardBps) / BPS;

            if (amount > 0) {
                if (users[current].activePrincipal >= requiredStake) {
                    rewards[i] = amount;
                    totalRewards += amount;
                } else {
                    treasuryRedirects[i] = amount;
                    totalToTreasury += amount;
                }
            }

            current = users[current].referrer;
            unchecked {
                ++i;
            }
        }
    }

    function getUserSummary(address user) external view returns (UserSummary memory summary) {
        UserInfo memory u = users[user];
        summary.referrer = u.referrer;
        summary.activePrincipal = u.activePrincipal;
        summary.totalStakedVolume = u.totalStakedVolume;
        summary.rewardBalance = u.rewardBalance;
        summary.directCount = u.directCount;
        summary.teamCount = u.teamCount;
        summary.teamVolume = u.teamVolume;
        summary.salaryStageClaimed = u.salaryStageClaimed;
        summary.totalStakes = _stakes[user].length;
        summary.totalPendingRewards = getAllPendingRewards(user);
    }

    function contractTokenBalance() external view returns (uint256) {
        return stakingToken.balanceOf(address(this));
    }

    // =========================================================
    // INTERNALS
    // =========================================================

    function _bindReferrer(address user, address referrer) internal {
        if (users[user].referrer != address(0)) return;
        if (referrer == address(0) || referrer == user) return;

        require(users[referrer].totalStakedVolume > 0, "INVALID_REFERRER");

        users[user].referrer = referrer;
        emit ReferrerBound(user, referrer);

        address current = referrer;
        uint256 level = 1;

        while (current != address(0)) {
            if (level == 1) {
                users[current].directCount += 1;
            } else {
                users[current].teamCount += 1;
            }

            current = users[current].referrer;
            unchecked {
                ++level;
            }
        }
    }

    function _addNetworkVolume(address user, uint256 amount) internal {
        address current = users[user].referrer;
        uint256 level = 1;

        while (current != address(0)) {
            if (level >= 2) {
                users[current].teamVolume += amount;
            }

            current = users[current].referrer;
            unchecked {
                ++level;
            }
        }
    }

    function _creditReferral(address fromUser, uint256 rewardAmount) internal {
        address current = users[fromUser].referrer;

        for (uint256 i = 0; i < REF_LEVELS; ) {
            if (current == address(0)) break;

            (uint256 rewardBps, uint256 requiredStake) = referralConfig(i);
            uint256 amount = (rewardAmount * rewardBps) / BPS;

            if (amount > 0) {
                if (users[current].activePrincipal >= requiredStake) {
                    users[current].rewardBalance += amount;
                    totalReferralCredited += amount;
                    emit ReferralCredited(fromUser, current, i + 1, amount);
                } else {
                    treasuryReferralBalance += amount;
                    totalUnqualifiedReferralSentToTreasury += amount;
                    emit UnqualifiedReferralSentToTreasury(fromUser, i + 1, amount);
                    emit TreasuryReferralAccrued(fromUser, i + 1, amount);
                }
            }

            current = users[current].referrer;
            unchecked {
                ++i;
            }
        }
    }
}