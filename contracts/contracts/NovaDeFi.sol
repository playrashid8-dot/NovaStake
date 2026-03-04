// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NovaDeFi is Ownable, ReentrancyGuard {
using SafeERC20 for IERC20;

IERC20 public immutable USDT;  
address public treasury;  

uint256 public constant MIN_DEPOSIT = 50 * 1e18;  
uint256 public constant MIN_WITHDRAW = 50 * 1e18;  
uint256 public constant WITHDRAW_COOLDOWN = 96 hours;  
uint256 public constant ADMIN_FEE = 8;  
uint256 public constant MONTH = 30 days;  

/* ================= EVENTS ================= */  

event Deposited(address indexed user, uint256 amount);  
event WithdrawRequested(address indexed user, uint256 amount);  
event Withdrawn(address indexed user, uint256 amount, uint256 fee);  
event Staked(address indexed user, uint256 amount, uint256 daysPeriod);  
event StakeClaimed(address indexed user, uint256 total);  
event SalaryClaimed(address indexed user, uint256 amount, uint8 stage);  
event StakeBonus(address indexed user, uint256 amount, uint256 plan);  

/* ================= STRUCTS ================= */  

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
    uint8 levelBonusStage;  
    uint256 withdrawFromDeposit;  
    uint256 withdrawFromReward;  

    bool stake7BonusClaimed;  
    bool stake15BonusClaimed;  
    bool stake30BonusClaimed;  
    bool stake60BonusClaimed;  
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

constructor(address _usdt, address _treasury) Ownable(msg.sender) {  
    USDT = IERC20(_usdt);  
    treasury = _treasury;  
}  

function setTreasury(address _new) external onlyOwner {  
    treasury = _new;  
}  

/* ================= TIME ================= */  

function _currentHour() internal view returns (uint256) {  
return block.timestamp / 1 hours;

}

/* ================= DEPOSIT ================= */  

function deposit(uint256 amount, address referrer) external nonReentrant {  
require(amount >= MIN_DEPOSIT, "Min 50");  

User storage user = users[msg.sender];  

if (user.depositBalance == 0) {  
    if (referrer != address(0)) {  
        require(referrer != msg.sender, "Self referral");  
        require(users[referrer].depositBalance > 0, "Invalid referrer");  

        user.referrer = referrer;  
        users[referrer].directCount++;  
        _propagateTeam(referrer);  
    }  
}  

// Update ROI before changing balance  
_updateROI(msg.sender);  

USDT.safeTransferFrom(msg.sender, address(this), amount);  

// Add deposit ONCE  
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
if (level == 3) return 200;  // 2%
if (level == 2) return 150;  // 1.5%
return 100;                  // 1%
}

function _updateROI(address userAddr) internal {
User storage user = users[userAddr];
uint256 currentHour = _currentHour();

if (user.lastROIUpdate == 0) {  
    user.lastROIUpdate = currentHour;  
    return;  
}  

if (currentHour > user.lastROIUpdate) {  
    uint256 hoursPassed = currentHour - user.lastROIUpdate;  

    // 🔥 Deposit + Reward (Stake excluded automatically)  
    uint256 totalBalance = user.depositBalance + user.rewardBalance;

// ROI only on 80% balance
totalBalance = (totalBalance * 80) / 100;

// ❌ Pending withdraw pe ROI nahi milega  
    if (user.pendingWithdraw > 0) {  
if (totalBalance > user.pendingWithdraw) {  
    totalBalance -= user.pendingWithdraw;  
} else {  
    totalBalance = 0;  
}

}

if (totalBalance > 0) {  

        // ✅ Accurate hourly ROI  
        uint256 reward =  
            (totalBalance *  
                _getDailyROI(user.level) *  
                hoursPassed) / (10000 * 24);  

        user.rewardBalance += reward;  
    }  

    user.lastROIUpdate = currentHour;  
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

/* ================= LEVEL + BONUS ================= */  

function _updateLevel(address userAddr) internal {  
    User storage u = users[userAddr];  
    uint8 prev = u.level;  
    uint8 newLevel = prev;  

    if (u.directCount >= 45 && u.teamCount >= 150) newLevel = 3;  
    else if (u.directCount >= 25 && u.teamCount >= 100) newLevel = 2;  
    else if (u.depositBalance >= MIN_DEPOSIT) newLevel = 1;  

    if (newLevel > prev) {  
        u.level = newLevel;  

        if (newLevel == 1 && u.levelBonusStage < 1) {  
            u.rewardBalance += 5 * 1e18;  
            u.levelBonusStage = 1;  
        }  
        else if (newLevel == 2 && u.levelBonusStage < 2) {  
            u.rewardBalance += 20 * 1e18;  
            u.levelBonusStage = 2;  
        }  
        else if (newLevel == 3 && u.levelBonusStage < 3) {  
            u.rewardBalance += 50 * 1e18;  
            u.levelBonusStage = 3;  
        }  
    }  
}  

/* ================= SALARY ================= */  

function claimSalary() external nonReentrant {  
    User storage u = users[msg.sender];  
    require(u.depositBalance > 0, "No deposit");  

    uint256 reward;  
    uint8 stage;  

    if (u.salaryStage == 0 && u.directCount >= 5 && u.teamCount >= 15) {  
        reward = 30 * 1e18;  
        stage = 1;  
    }  
    else if (u.salaryStage == 1 && u.directCount >= 10 && u.teamCount >= 35) {  
        reward = 80 * 1e18;  
        stage = 2;  
    }  
    else if (u.salaryStage == 2 && u.directCount >= 25 && u.teamCount >= 100) {  
        reward = 250 * 1e18;  
        stage = 3;  
    }  
    else if (u.salaryStage == 3 && u.directCount >= 45 && u.teamCount >= 150) {  
        reward = 500 * 1e18;  
        stage = 4;  
    }  
    else {  
        revert("Not eligible");  
    }  

    u.salaryStage = stage;  
    u.rewardBalance += reward;  

    emit SalaryClaimed(msg.sender, reward, stage);  
}  

/* ================= STAKING + ENTRY BONUS ================= */  

function createStake(uint256 amount, uint256 daysPeriod) external nonReentrant {  
    User storage user = users[msg.sender];  
    require(user.depositBalance >= amount, "Low balance");  

    _updateROI(msg.sender);  

    uint256 rate;  
    uint256 minAmount;  

    if (daysPeriod == 7) { rate = 130; minAmount = 100 * 1e18; }  
    else if (daysPeriod == 15) { rate = 150; minAmount = 300 * 1e18; }  
    else if (daysPeriod == 30) { rate = 180; minAmount = 500 * 1e18; }  
    else if (daysPeriod == 60) { rate = 220; minAmount = 1000 * 1e18; }  
    else revert("Invalid plan");  

    require(amount >= minAmount, "Below minimum");  

    user.depositBalance -= amount;  

    userStakes[msg.sender].push(  
        Stake(amount, block.timestamp, block.timestamp + (daysPeriod * 1 days), rate, false)  
    );  

    uint256 bonus;  

    if (daysPeriod == 7 && !user.stake7BonusClaimed) {  
        bonus = 5 * 1e18;  
        user.stake7BonusClaimed = true;  
    }  
    else if (daysPeriod == 15 && !user.stake15BonusClaimed) {  
        bonus = 15 * 1e18;  
        user.stake15BonusClaimed = true;  
    }  
    else if (daysPeriod == 30 && !user.stake30BonusClaimed) {  
        bonus = 30 * 1e18;  
        user.stake30BonusClaimed = true;  
    }  
    else if (daysPeriod == 60 && !user.stake60BonusClaimed) {  
        bonus = 100 * 1e18;  
        user.stake60BonusClaimed = true;  
    }  

    if (bonus > 0) {  
        user.rewardBalance += bonus;  
        emit StakeBonus(msg.sender, bonus, daysPeriod);  
    }  

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

/* ================= WITHDRAW ================= */

function _getMonthlyLimit(uint8 level) internal pure returns (uint256) {
if (level == 3) return 5000 * 1e18;
if (level == 2) return 2000 * 1e18;
return 500 * 1e18;
}

function requestWithdraw(uint256 amount) external nonReentrant {
User storage user = users[msg.sender];

_updateROI(msg.sender);  

require(amount > 0, "Invalid amount");  
require(amount >= MIN_WITHDRAW, "Minimum 50 USDT required");  
require(user.pendingWithdraw == 0, "Pending exists");  

// Reset monthly window if expired  
if (block.timestamp >= user.monthStart + MONTH) {  
    user.monthStart = block.timestamp;  
    user.monthlyWithdrawn = 0;  
}  

uint256 totalBalance = user.depositBalance + user.rewardBalance;  
require(totalBalance >= amount, "Insufficient");  

uint256 limit = _getMonthlyLimit(user.level);  
require(  
    user.monthlyWithdrawn + amount <= limit,  
    "Monthly limit exceeded"  
);  

// 🔥 Deduct properly and track source  
if (user.rewardBalance >= amount) {  
    user.rewardBalance -= amount;  

    user.withdrawFromReward = amount;  
    user.withdrawFromDeposit = 0;  
} else {  
    uint256 remaining = amount - user.rewardBalance;  

    user.withdrawFromReward = user.rewardBalance;  
    user.withdrawFromDeposit = remaining;  

    user.rewardBalance = 0;  
    user.depositBalance -= remaining;  
}  

user.pendingWithdraw = amount;  
user.lastWithdrawRequest = block.timestamp;  

emit WithdrawRequested(msg.sender, amount);

}

function cancelWithdraw() external nonReentrant {
User storage user = users[msg.sender];

require(user.pendingWithdraw > 0, "No pending");  
require(  
    block.timestamp < user.lastWithdrawRequest + WITHDRAW_COOLDOWN,  
    "Cancel time passed"  
);  

// Restore correctly  
if (user.withdrawFromReward > 0) {  
    user.rewardBalance += user.withdrawFromReward;  
}  

if (user.withdrawFromDeposit > 0) {  
    user.depositBalance += user.withdrawFromDeposit;  
}  

user.withdrawFromReward = 0;  
user.withdrawFromDeposit = 0;  
user.pendingWithdraw = 0;  

emit WithdrawRequested(msg.sender, 0);

}

function claimWithdraw() external nonReentrant {
User storage user = users[msg.sender];

require(user.pendingWithdraw > 0, "No request");  
require(  
    block.timestamp >= user.lastWithdrawRequest + WITHDRAW_COOLDOWN,  
    "Wait 96h"  
);  

uint256 amount = user.pendingWithdraw;  

user.pendingWithdraw = 0;  
user.monthlyWithdrawn += amount;  

// Reset tracking  
user.withdrawFromReward = 0;  
user.withdrawFromDeposit = 0;  

uint256 fee = (amount * ADMIN_FEE) / 100;  
uint256 net = amount - fee;  

USDT.safeTransfer(treasury, fee);  
USDT.safeTransfer(msg.sender, net);  

emit Withdrawn(msg.sender, net, fee);

}
}