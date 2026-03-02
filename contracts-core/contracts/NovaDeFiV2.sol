// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NovaDeFiV2 is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable USDT;

    uint256 public constant MIN_DEPOSIT = 50 * 1e18;
    uint256 public constant WITHDRAW_COOLDOWN = 96 hours;
    uint256 public constant ADMIN_FEE = 8;

    uint256 public constant MONTH = 30 days;

    event Deposited(address indexed user, uint256 amount);
    event WithdrawRequested(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount, uint256 fee);
    event Staked(address indexed user, uint256 amount, uint256 daysPeriod);
    event StakeClaimed(address indexed user, uint256 total);
    event SalaryClaimed(address indexed user, uint256 amount);

    struct User {
        uint256 depositBalance;
        uint256 rewardBalance;
        uint256 lastROIUpdate;

        uint256 lastWithdrawRequest;
        uint256 pendingWithdraw;

        uint256 monthlyWithdrawn;
        uint256 monthStart;

        uint8 level;
        address referrer;
        uint256 directCount;
        uint256 teamCount;

        uint8 salaryStage;
    }

    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        uint256 dailyRate;
        bool claimed;
    }

    mapping(address => User) public users;
    mapping(address => Stake[]) public userStakes;

    constructor(address _usdt) Ownable(msg.sender) {
    USDT = IERC20(_usdt);
}

    /* ================= DEPOSIT ================= */

    function deposit(uint256 amount, address referrer) external nonReentrant {
        require(amount >= MIN_DEPOSIT, "Min 50 USDT");

        USDT.safeTransferFrom(msg.sender, address(this), amount);

        User storage user = users[msg.sender];

        if (user.referrer == address(0) && referrer != msg.sender && referrer != address(0)) {
            user.referrer = referrer;
            users[referrer].directCount++;
            _propagateTeam(referrer);
        }

        _updateROI(msg.sender);

        user.depositBalance += amount;

        if (user.monthStart == 0) {
            user.monthStart = block.timestamp;
        }

        _distributeTeamIncome(msg.sender, amount);
        _updateLevel(msg.sender);

        emit Deposited(msg.sender, amount);
    }

    /* ================= ROI ================= */

    function _getDailyROI(uint8 level) internal pure returns (uint256) {
        if (level == 3) return 200;
        if (level == 2) return 150;
        return 100;
    }

    function _updateROI(address userAddr) internal {
        User storage user = users[userAddr];

        if (user.lastROIUpdate == 0) {
            user.lastROIUpdate = block.timestamp;
            return;
        }

        uint256 timePassed = block.timestamp - user.lastROIUpdate;

        if (timePassed >= 1 days && user.depositBalance > 0) {
            uint256 daysPassed = timePassed / 1 days;
            uint256 dailyRate = _getDailyROI(user.level);

            uint256 reward = (user.depositBalance * dailyRate * daysPassed) / 10000;

            user.rewardBalance += reward;
            user.lastROIUpdate += daysPassed * 1 days;
        }
    }

    /* ================= TEAM ================= */

    function _distributeTeamIncome(address userAddr, uint256 amount) internal {
        address up = users[userAddr].referrer;
        uint256[3] memory percents = [uint256(10), 6, 5];

        for (uint256 i = 0; i < 3; i++) {
            if (up == address(0)) break;
            users[up].rewardBalance += (amount * percents[i]) / 100;
            up = users[up].referrer;
        }
    }

    function _propagateTeam(address referrer) internal {
        address up = referrer;
        for (uint256 i = 0; i < 3; i++) {
            if (up == address(0)) break;
            users[up].teamCount++;
            up = users[up].referrer;
        }
    }

    /* ================= LEVEL ================= */

    function _updateLevel(address userAddr) internal {
        User storage u = users[userAddr];

        if (u.directCount >= 45 && u.teamCount >= 150) u.level = 3;
        else if (u.directCount >= 25 && u.teamCount >= 100) u.level = 2;
        else if (u.depositBalance >= MIN_DEPOSIT) u.level = 1;
    }

    function _getMonthlyLimit(uint8 level) internal pure returns (uint256) {
        if (level == 3) return 5000 * 1e18;
        if (level == 2) return 2000 * 1e18;
        return 500 * 1e18;
    }

    /* ================= STAKING ================= */

    function createStake(uint256 amount, uint256 daysPeriod) external nonReentrant {
        User storage user = users[msg.sender];
        require(user.depositBalance >= amount, "Low balance");

        _updateROI(msg.sender);

        uint256 rate;

        if (daysPeriod == 7) rate = 130;
        else if (daysPeriod == 15) rate = 150;
        else if (daysPeriod == 30) rate = 180;
        else if (daysPeriod == 60) rate = 220;
        else revert("Invalid plan");

        user.depositBalance -= amount;

        userStakes[msg.sender].push(
            Stake({
                amount: amount,
                startTime: block.timestamp,
                endTime: block.timestamp + (daysPeriod * 1 days),
                dailyRate: rate,
                claimed: false
            })
        );

        emit Staked(msg.sender, amount, daysPeriod);
    }

    function claimStake(uint256 index) external nonReentrant {
        Stake storage s = userStakes[msg.sender][index];
        require(!s.claimed, "Claimed");
        require(block.timestamp >= s.endTime, "Not matured");

        uint256 duration = (s.endTime - s.startTime) / 1 days;
        uint256 profit = (s.amount * s.dailyRate * duration) / 10000;

        uint256 total = s.amount + profit;
        s.claimed = true;

        users[msg.sender].rewardBalance += total;

        emit StakeClaimed(msg.sender, total);
    }

    /* ================= SALARY ================= */

    function claimSalary() external nonReentrant {
        User storage u = users[msg.sender];
        uint256 reward;

        if (u.salaryStage == 0 && u.directCount >= 5 && u.teamCount >= 15) {
            reward = 30e18;
            u.salaryStage = 1;
        } else if (u.salaryStage == 1 && u.directCount >= 10 && u.teamCount >= 35) {
            reward = 80e18;
            u.salaryStage = 2;
        } else if (u.salaryStage == 2 && u.directCount >= 25 && u.teamCount >= 100) {
            reward = 250e18;
            u.salaryStage = 3;
        } else if (u.salaryStage == 3 && u.directCount >= 45 && u.teamCount >= 150) {
            reward = 400e18;
            u.salaryStage = 4;
        } else {
            revert("Not eligible");
        }

        u.rewardBalance += reward;
        emit SalaryClaimed(msg.sender, reward);
    }

    /* ================= WITHDRAW ================= */

    function requestWithdraw(uint256 amount) external {
        User storage user = users[msg.sender];

        _updateROI(msg.sender);

        require(user.rewardBalance >= amount, "Insufficient");
        require(user.pendingWithdraw == 0, "Pending exists");

        user.pendingWithdraw = amount;
        user.lastWithdrawRequest = block.timestamp;

        emit WithdrawRequested(msg.sender, amount);
    }

    function claimWithdraw() external nonReentrant {
        User storage user = users[msg.sender];

        require(user.pendingWithdraw > 0, "No request");
        require(block.timestamp >= user.lastWithdrawRequest + WITHDRAW_COOLDOWN, "Wait 96h");

        if (block.timestamp >= user.monthStart + MONTH) {
            user.monthStart = block.timestamp;
            user.monthlyWithdrawn = 0;
        }

        uint256 limit = _getMonthlyLimit(user.level);
        require(user.monthlyWithdrawn + user.pendingWithdraw <= limit, "Monthly limit");

        uint256 amount = user.pendingWithdraw;
        user.pendingWithdraw = 0;

        user.rewardBalance -= amount;
        user.monthlyWithdrawn += amount;

        uint256 fee = (amount * ADMIN_FEE) / 100;
        uint256 net = amount - fee;

        USDT.safeTransfer(owner(), fee);
        USDT.safeTransfer(msg.sender, net);

        emit Withdrawn(msg.sender, net, fee);
    }
}