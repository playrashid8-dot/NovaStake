"use client";

/* =========================================
🔥 CONTRACT ADDRESSES (BSC MAINNET)
========================================= */

export const NOVASTAKE_ADDRESS =
  "0xeAf4E17648984d6edE0A4B1655EFeec0EC8F7B12" as const;

export const NOVA_TOKEN_ADDRESS =
  "0x58B96212cFE8DeC3e1DCc8A1016914c3d47493B7" as const;

export const TREASURY_ADDRESS =
  "0x55B9a936b9A8640eb2eC2C0c9b220b478C4b82ca" as const;

export const NOVA_DECIMALS = 18;
export const CLAIM_FEE_BPS = 500;

/* =========================================
📜 NOVASTAKE ABI
========================================= */

export const NOVASTAKE_ABI = [
  {
    inputs: [
      { internalType: "address", name: "token_", type: "address" },
      { internalType: "address", name: "treasury_", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "SafeERC20FailedOperation",
    type: "error",
  },

  /* ===== EVENTS ===== */

  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: true,
        internalType: "uint256",
        name: "stakeIndex",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "principal",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "unclaimedReward",
        type: "uint256",
      },
    ],
    name: "MaturedStakeMovedToBalance",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "fromUser",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "toUser",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "level",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "ReferralCredited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: true,
        internalType: "address",
        name: "referrer",
        type: "address",
      },
    ],
    name: "ReferrerBound",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "grossAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "feeAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "netAmount",
        type: "uint256",
      },
    ],
    name: "RewardBalanceClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: true,
        internalType: "uint256",
        name: "stakeIndex",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "RewardMovedToBalance",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: true,
        internalType: "uint256",
        name: "stageId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "reward",
        type: "uint256",
      },
    ],
    name: "SalaryCredited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: true,
        internalType: "uint256",
        name: "stakeIndex",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint8",
        name: "planId",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalReward",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "startTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
    ],
    name: "Staked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "fromUser",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "level",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "TreasuryReferralAccrued",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "treasury",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "TreasuryReferralClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "fromUser",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "level",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "UnqualifiedReferralSentToTreasury",
    type: "event",
  },

  /* ===== READ ===== */

  {
    inputs: [],
    name: "BPS",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PAYOUT_FEE_BPS",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PLAN_COUNT",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "REF_LEVELS",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "SALARY_STAGES",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "UNIT",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "canClaimSalary",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "contractTokenBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getAllPendingRewards",
    outputs: [{ internalType: "uint256", name: "totalPending", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getStakeCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "stakeIndex", type: "uint256" },
    ],
    name: "getStakeInfo",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "totalReward", type: "uint256" },
          { internalType: "uint256", name: "claimedReward", type: "uint256" },
          { internalType: "uint256", name: "startTime", type: "uint256" },
          { internalType: "uint256", name: "endTime", type: "uint256" },
          { internalType: "uint8", name: "planId", type: "uint8" },
          { internalType: "bool", name: "withdrawn", type: "bool" },
        ],
        internalType: "struct NovaStake.StakeInfo",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserStakes",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "totalReward", type: "uint256" },
          { internalType: "uint256", name: "claimedReward", type: "uint256" },
          { internalType: "uint256", name: "startTime", type: "uint256" },
          { internalType: "uint256", name: "endTime", type: "uint256" },
          { internalType: "uint8", name: "planId", type: "uint8" },
          { internalType: "bool", name: "withdrawn", type: "bool" },
        ],
        internalType: "struct NovaStake.StakeInfo[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserSummary",
    outputs: [
      {
        components: [
          { internalType: "address", name: "referrer", type: "address" },
          {
            internalType: "uint256",
            name: "activePrincipal",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalStakedVolume",
            type: "uint256",
          },
          { internalType: "uint256", name: "rewardBalance", type: "uint256" },
          { internalType: "uint256", name: "directCount", type: "uint256" },
          { internalType: "uint256", name: "teamCount", type: "uint256" },
          { internalType: "uint256", name: "teamVolume", type: "uint256" },
          {
            internalType: "uint256",
            name: "salaryStageClaimed",
            type: "uint256",
          },
          { internalType: "uint256", name: "totalStakes", type: "uint256" },
          {
            internalType: "uint256",
            name: "totalPendingRewards",
            type: "uint256",
          },
        ],
        internalType: "struct NovaStake.UserSummary",
        name: "summary",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minStake",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "stakeIndex", type: "uint256" },
    ],
    name: "nextClaimTime",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "stakeIndex", type: "uint256" },
    ],
    name: "pendingReward",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "planId", type: "uint256" }],
    name: "planMeta",
    outputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "uint256", name: "duration", type: "uint256" },
      { internalType: "uint256", name: "totalReturnBps", type: "uint256" },
      { internalType: "bool", name: "enabled", type: "bool" },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "rewardAmount", type: "uint256" },
    ],
    name: "previewReferralOnReward",
    outputs: [
      { internalType: "uint256[5]", name: "rewards", type: "uint256[5]" },
      {
        internalType: "uint256[5]",
        name: "treasuryRedirects",
        type: "uint256[5]",
      },
      { internalType: "uint256", name: "totalRewards", type: "uint256" },
      { internalType: "uint256", name: "totalToTreasury", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "level", type: "uint256" }],
    name: "referralConfig",
    outputs: [
      { internalType: "uint256", name: "rewardBps", type: "uint256" },
      { internalType: "uint256", name: "requiredStake", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "stageId", type: "uint256" }],
    name: "salaryStageMeta",
    outputs: [
      { internalType: "uint256", name: "requiredDirect", type: "uint256" },
      { internalType: "uint256", name: "requiredTeam", type: "uint256" },
      {
        internalType: "uint256",
        name: "requiredTeamVolume",
        type: "uint256",
      },
      { internalType: "uint256", name: "reward", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "stakingToken",
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokenDecimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalActivePrincipal",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalClaimedToWallet",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalMaturedPrincipalMoved",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalReferralCredited",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSalaryCredited",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalStakedVolume",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalTreasuryFeesCollected",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalUnqualifiedReferralSentToTreasury",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalUsers",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "treasuryReferralBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "treasuryWallet",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "users",
    outputs: [
      { internalType: "address", name: "referrer", type: "address" },
      { internalType: "bool", name: "registered", type: "bool" },
      {
        internalType: "uint256",
        name: "activePrincipal",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalStakedVolume",
        type: "uint256",
      },
      { internalType: "uint256", name: "rewardBalance", type: "uint256" },
      {
        internalType: "uint256",
        name: "totalClaimedFromBalance",
        type: "uint256",
      },
      { internalType: "uint256", name: "directCount", type: "uint256" },
      { internalType: "uint256", name: "teamCount", type: "uint256" },
      { internalType: "uint256", name: "teamVolume", type: "uint256" },
      {
        internalType: "uint8",
        name: "salaryStageClaimed",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  /* ===== WRITE ===== */

  {
    inputs: [],
    name: "claimAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "stakeIndex", type: "uint256" }],
    name: "claimReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimSalary",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimTreasuryReferralBalance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint8", name: "planId", type: "uint8" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "referrer", type: "address" },
    ],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "stakeIndex", type: "uint256" }],
    name: "withdrawStake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

/* =========================================
🪙 NOVA TOKEN ABI
========================================= */

export const NOVA_TOKEN_ABI = [
  {
    inputs: [
      { internalType: "address", name: "initialOwner", type: "address" },
      { internalType: "address", name: "initialReceiver", type: "address" },
      { internalType: "address", name: "treasury_", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },

  {
    anonymous: false,
    inputs: [],
    name: "TradingEnabled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isExcluded",
        type: "bool",
      },
    ],
    name: "ExcludedFromFeesUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "pair", type: "address" },
      {
        indexed: false,
        internalType: "bool",
        name: "isPair",
        type: "bool",
      },
    ],
    name: "PairUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "oldFeeBps",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "newFeeBps",
        type: "uint256",
      },
    ],
    name: "SellFeeUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oldWallet",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newWallet",
        type: "address",
      },
    ],
    name: "TreasuryWalletUpdated",
    type: "event",
  },

  {
    inputs: [],
    name: "MAX_SUPPLY",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "BPS",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "sellFeeBps",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "treasuryWallet",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tradingEnabled",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "isExcludedFromFees",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "automatedMarketMakerPairs",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [{ internalType: "address", name: "newTreasury", type: "address" }],
    name: "setTreasuryWallet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "newFeeBps", type: "uint256" }],
    name: "setSellFeeBps",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "bool", name: "excluded", type: "bool" },
    ],
    name: "setExcludedFromFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "pair", type: "address" },
      { internalType: "bool", name: "isPair", type: "bool" },
    ],
    name: "setAutomatedMarketMakerPair",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "enableTrading",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

/* =========================================
🧩 PLAN IDS
========================================= */

export const PLAN_IDS = {
  DAYS_7: 0,
  DAYS_30: 1,
  DAYS_90: 2,
  DAYS_180: 3,
  DAYS_360: 4,
} as const;

/* =========================================
📋 PLAN META
========================================= */

export const PLAN_META = [
  { id: 0, name: "7 Days", roi: "1% daily", durationDays: 7 },
  { id: 1, name: "30 Days", roi: "45% total", durationDays: 30 },
  { id: 2, name: "90 Days", roi: "160% total", durationDays: 90 },
  { id: 3, name: "180 Days", roi: "400% total", durationDays: 180 },
  { id: 4, name: "360 Days", roi: "900% total", durationDays: 360 },
] as const;

/* =========================================
💼 REFERRAL LEVELS
========================================= */

export const REFERRAL_LEVELS = [
  { level: 1, reward: "10%", requiredStake: 50 },
  { level: 2, reward: "6%", requiredStake: 100 },
  { level: 3, reward: "5%", requiredStake: 300 },
  { level: 4, reward: "3%", requiredStake: 500 },
  { level: 5, reward: "3%", requiredStake: 1000 },
] as const;

/* =========================================
🏆 SALARY STAGES
========================================= */

export const SALARY_STAGE_META = [
  { stage: 1, direct: 8, team: 25, volume: 3000, reward: 50 },
  { stage: 2, direct: 15, team: 50, volume: 7000, reward: 150 },
  { stage: 3, direct: 25, team: 100, volume: 20000, reward: 350 },
  { stage: 4, direct: 50, team: 300, volume: 50000, reward: 1000 },
] as const;

/* =========================================
🧠 HELPERS
========================================= */

export function getPlanMeta(planId: number) {
  return PLAN_META.find((p) => p.id === planId) ?? PLAN_META[0];
}