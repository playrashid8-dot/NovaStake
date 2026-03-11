// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    NOVAToken - practical final version for NovaStake

    Features:
    - Fixed supply: 1,000,000,000 NOVA
    - Buy fee: 0%
    - Sell fee: 5%
    - Sell fee goes to treasury wallet
    - Trading enable switch
    - AMM pair support (PancakeSwap pair)
    - Fee exclusion support
    - Temporary owner controls for setup/testing
    - Ownership can be renounced after final launch
*/

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NOVAToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 ether;
    uint256 public constant BPS = 10_000;
    uint256 public constant MAX_SELL_FEE_BPS = 1000; // max 10%

    uint256 public sellFeeBps = 500; // 5%
    address public treasuryWallet;
    bool public tradingEnabled;

    mapping(address => bool) public isExcludedFromFees;
    mapping(address => bool) public automatedMarketMakerPairs;

    event TreasuryWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event SellFeeUpdated(uint256 oldFeeBps, uint256 newFeeBps);
    event TradingEnabled();
    event ExcludedFromFeesUpdated(address indexed account, bool isExcluded);
    event PairUpdated(address indexed pair, bool isPair);
    event ForeignTokenRescued(address indexed token, address indexed to, uint256 amount);

    constructor(
        address initialOwner,
        address initialReceiver,
        address treasury_
    ) ERC20("NovaStake", "NOVA") Ownable(initialOwner) {
        require(initialOwner != address(0), "OWNER_ZERO");
        require(initialReceiver != address(0), "RECEIVER_ZERO");
        require(treasury_ != address(0), "TREASURY_ZERO");

        treasuryWallet = treasury_;

        _mint(initialReceiver, MAX_SUPPLY);

        isExcludedFromFees[initialOwner] = true;
        isExcludedFromFees[initialReceiver] = true;
        isExcludedFromFees[treasury_] = true;
        isExcludedFromFees[address(this)] = true;
    }

    // =========================================================
    // OWNER FUNCTIONS
    // =========================================================

    function setTreasuryWallet(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "TREASURY_ZERO");

        address old = treasuryWallet;
        treasuryWallet = newTreasury;

        isExcludedFromFees[newTreasury] = true;

        emit TreasuryWalletUpdated(old, newTreasury);
    }

    function setSellFeeBps(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= MAX_SELL_FEE_BPS, "FEE_TOO_HIGH");

        uint256 old = sellFeeBps;
        sellFeeBps = newFeeBps;

        emit SellFeeUpdated(old, newFeeBps);
    }

    function setExcludedFromFees(address account, bool excluded) external onlyOwner {
        isExcludedFromFees[account] = excluded;
        emit ExcludedFromFeesUpdated(account, excluded);
    }

    function setAutomatedMarketMakerPair(address pair, bool isPair) external onlyOwner {
        require(pair != address(0), "PAIR_ZERO");
        automatedMarketMakerPairs[pair] = isPair;
        emit PairUpdated(pair, isPair);
    }

    function enableTrading() external onlyOwner {
        require(!tradingEnabled, "TRADING_ALREADY_ENABLED");
        tradingEnabled = true;
        emit TradingEnabled();
    }

    /// @notice Rescue non-NOVA tokens sent by mistake
    function rescueForeignToken(address token, address to, uint256 amount) external onlyOwner {
        require(token != address(this), "CANNOT_RESCUE_SELF");
        require(to != address(0), "TO_ZERO");

        IERC20(token).transfer(to, amount);
        emit ForeignTokenRescued(token, to, amount);
    }

    // =========================================================
    // INTERNAL TOKEN LOGIC
    // =========================================================

    function _update(address from, address to, uint256 value) internal override {
        // Mint / burn path
        if (from == address(0) || to == address(0)) {
            super._update(from, to, value);
            return;
        }

        // Before trading is enabled, only fee-exempt wallets can transfer
        if (!tradingEnabled) {
            require(
                isExcludedFromFees[from] || isExcludedFromFees[to],
                "TRADING_NOT_ENABLED"
            );
        }

        uint256 fee = 0;

        // Sell transaction only
        // If tokens are going to AMM pair, apply sell fee
        if (
            automatedMarketMakerPairs[to] &&
            !isExcludedFromFees[from] &&
            !isExcludedFromFees[to] &&
            sellFeeBps > 0
        ) {
            fee = (value * sellFeeBps) / BPS;
        }

        if (fee > 0) {
            super._update(from, treasuryWallet, fee);
            value -= fee;
        }

        super._update(from, to, value);
    }
}