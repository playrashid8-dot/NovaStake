// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NovaDeFi is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable USDT;
    address public treasury;

    uint256 public constant MIN_DEPOSIT = 50 * 1e18;
    uint256 public constant LOCK_PERIOD = 6 days;
    uint256 public constant WITHDRAW_COOLDOWN = 1 days;
    uint256 public constant ADMIN_FEE = 5; // 5%

    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        uint256 dailyRate; // 100 = 1%
        bool claimed;
    }

    struct User {
        uint256 depositBalance;
        uint256 stakedBalance;
        uint256 rewardBalance;
        uint256 lastUpdate;
        uint256 depositTime;
        uint256 lastWithdrawTime;

        address referrer;
        uint8 level;

        uint256 directCount;
        uint256 teamCount;

        uint8 salaryStage;
        uint256 lastSalaryTeam;
    }

    mapping(address => User) public users;
    mapping(address => Stake[]) public userStakes;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount, uint256 fee);
    event Staked(address indexed user, uint256 amount, uint256 duration);
    event StakeClaimed(address indexed user, uint256 amount, uint256 fee);
    event SalaryClaimed(address indexed user, uint256 amount, uint8 stage);
    event LevelUp(address indexed user, uint8 level);

    constructor(address _usdt, address _treasury) Ownable(msg.sender) {
        USDT = IERC20(_usdt);
        treasury = _treasury;
    }

    // ==========================
    // DEPOSIT
    // ==========================

    function deposit(uint256 amount, address referrer) external nonReentrant {
        require(amount >= MIN_DEPOSIT, "Min 50 USDT");

        updateReward(msg.sender);

        USDT.safeTransferFrom(msg.sender, address(this), amount);

        uint256 fee = (amount * ADMIN_FEE) / 100;
        USDT.safeTransfer(treasury, fee);

        User storage user = users[msg.sender];

        if (user.depositTime == 0) {
            user.depositTime = block.timestamp;
            user.level = 1;

            if (referrer != address(0) && referrer != msg.sender) {
                user.referrer = referrer;
                users[referrer].directCount++;
                _updateTeam(referrer);
            }
        }

        user.depositBalance += amount;
        user.rewardBalance += (amount * 5) / 100; // 5% self bonus

        _checkLevelUpgrade(msg.sender);

        emit Deposited(msg.sender, amount);
    }

    // ==========================
    // ROI ENGINE
    // ==========================

    function updateReward(address userAddr) public {
        User storage user = users[userAddr];

        if (user.lastUpdate == 0) {
            user.lastUpdate = block.timestamp;
            return;
        }

        if (user.depositBalance == 0) {
            user.lastUpdate = block.timestamp;
            return;
        }

        uint256 timePassed = block.timestamp - user.lastUpdate;
        uint256 rate = _getDailyROI(user.level);

        uint256 reward = (user.depositBalance * rate * timePassed) / (10000 * 86400);

        user.rewardBalance += reward;

        _distributeReferral(userAddr, reward);

        user.lastUpdate = block.timestamp;
    }

    function _getDailyROI(uint8 level) internal pure returns (uint256) {
        if (level == 3) return 200; // 2%
        if (level == 2) return 150; // 1.5%
        return 100; // 1%
    }

    // ==========================
    // REFERRAL (FROM ROI)
    // ==========================

    function _distributeReferral(address userAddr, uint256 roi) internal {
        address up = users[userAddr].referrer;
        uint256[3] memory perc = [uint256(10), 6, 5];

        for (uint256 i = 0; i < 3; i++) {
            if (up == address(0)) break;

            if (users[up].depositBalance >= MIN_DEPOSIT) {
                users[up].rewardBalance += (roi * perc[i]) / 100;
            }

            up = users[up].referrer;
        }
    }

    // ==========================
    // WITHDRAW
    // ==========================

    function withdraw(uint256 amount) external nonReentrant {
        User storage user = users[msg.sender];

        updateReward(msg.sender);

        require(block.timestamp >= user.depositTime + LOCK_PERIOD, "Locked");
        require(block.timestamp >= user.lastWithdrawTime + WITHDRAW_COOLDOWN, "Cooldown");
        require(user.rewardBalance >= amount, "Low balance");

        user.rewardBalance -= amount;
        user.lastWithdrawTime = block.timestamp;

        uint256 fee = (amount * ADMIN_FEE) / 100;
        uint256 net = amount - fee;

        USDT.safeTransfer(treasury, fee);
        USDT.safeTransfer(msg.sender, net);

        emit Withdrawn(msg.sender, net, fee);
    }

    // ==========================
    // STAKE ENGINE (TRANSFER MODEL)
    // ==========================

    function createStake(uint256 amount, uint256 daysPeriod) external nonReentrant {
        User storage user = users[msg.sender];

        require(user.depositBalance >= amount, "Low deposit");

        updateReward(msg.sender);

        uint256 rate;
        if (daysPeriod == 30) rate = 170;
        else if (daysPeriod == 60) rate = 200;
        else if (daysPeriod == 90) rate = 220;
        else revert("Invalid plan");

        user.depositBalance -= amount;
        user.stakedBalance += amount;

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
        uint256 reward = (s.amount * s.dailyRate * duration) / 10000;
        uint256 total = s.amount + reward;

        uint256 fee = (total * ADMIN_FEE) / 100;
        uint256 net = total - fee;

        s.claimed = true;
        users[msg.sender].stakedBalance -= s.amount;

        USDT.safeTransfer(treasury, fee);
        USDT.safeTransfer(msg.sender, net);

        emit StakeClaimed(msg.sender, net, fee);
    }

    // ==========================
    // SALARY SYSTEM (INTERNAL CREDIT)
    // ==========================

    function claimSalary() external nonReentrant {
        User storage u = users[msg.sender];
        require(u.salaryStage < 3, "All claimed");

        uint256 reward;

        if (u.salaryStage == 0 && u.level >= 1 && u.directCount >= 5 && u.teamCount >= 10) {
            reward = 30 * 1e18;
            u.salaryStage = 1;
            u.lastSalaryTeam = u.teamCount;
        } 
        else if (u.salaryStage == 1 && u.level >= 2 && u.teamCount >= (u.lastSalaryTeam * 140) / 100) {
            reward = 60 * 1e18;
            u.salaryStage = 2;
            u.lastSalaryTeam = u.teamCount;
        } 
        else if (u.salaryStage == 2 && u.level >= 3 && u.teamCount >= (u.lastSalaryTeam * 150) / 100) {
            reward = 150 * 1e18;
            u.salaryStage = 3;
        } 
        else {
            revert("Not eligible");
        }

        u.rewardBalance += reward;

        emit SalaryClaimed(msg.sender, reward, u.salaryStage);
    }

    // ==========================
    // LEVEL & TEAM
    // ==========================

    function _updateTeam(address ref) internal {
        address up = ref;
        for (uint256 i = 0; i < 15; i++) {
            if (up == address(0)) break;
            users[up].teamCount++;
            up = users[up].referrer;
        }
    }

    function _checkLevelUpgrade(address userAddr) internal {
        User storage u = users[userAddr];
        uint8 old = u.level;

        if (u.depositBalance >= 3000e18 && u.directCount >= 25 && u.teamCount >= 100) {
            u.level = 3;
        }
        else if (u.depositBalance >= 500e18 && u.directCount >= 8 && u.teamCount >= 40) {
            u.level = 2;
        }

        if (u.level > old) {
            emit LevelUp(userAddr, u.level);
        }
    }

    // ==========================
    // ADMIN
    // ==========================

    function updateTreasury(address newWallet) external onlyOwner {
        treasury = newWallet;
    }
}