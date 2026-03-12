/* =========================================
   CONTRACT ADDRESSES (BSC MAINNET)
========================================= */

export const NOVASTAKE_ADDRESS =
  "0xeAf4E17648984d6edE0A4B1655EFeec0EC8F7B12" as const;

export const NOVA_TOKEN_ADDRESS =
  "0x58B96212cFE8DeC3e1DCc8A1016914c3d47493B7" as const;

export const TREASURY_ADDRESS =
  "0x55B9a936b9A8640eb2eC2C0c9b220b478C4b82ca" as const;

export const NOVA_DECIMALS = 18;
export const CLAIM_FEE_BPS = 500;

export const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000";

/* =========================================
   PLAN META (FRONTEND)
========================================= */

export const PLAN_META = [
  { id: 0, name: "Starter", durationDays: 7, roi: "7%", totalReturnBps: 700 },
  { id: 1, name: "Boost", durationDays: 30, roi: "45%", totalReturnBps: 4500 },
  { id: 2, name: "Pro", durationDays: 90, roi: "160%", totalReturnBps: 16000 },
  { id: 3, name: "VIP", durationDays: 180, roi: "400%", totalReturnBps: 40000 },
  { id: 4, name: "Elite", durationDays: 360, roi: "900%", totalReturnBps: 90000 },
] as const;

export type PlanMetaItem = (typeof PLAN_META)[number];

export function getPlanMeta(planId: number) {
  return PLAN_META.find((p) => p.id === Number(planId)) || PLAN_META[0];
}

/* =========================================
   NOVASTAKE ABI (FULL)
========================================= */

export const NOVASTAKE_ABI = [

  /* ========= WRITE FUNCTIONS ========= */

  {
    name: "stake",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "planId", type: "uint8" },
      { name: "amount", type: "uint256" },
      { name: "referrer", type: "address" }
    ],
    outputs: []
  },

  {
    name: "claimReward",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "stakeIndex", type: "uint256" }],
    outputs: []
  },

  {
    name: "withdrawStake",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "stakeIndex", type: "uint256" }],
    outputs: []
  },

  {
    name: "claimAll",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },

  {
    name: "claimSalary",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },

  {
    name: "claimTreasuryReferralBalance",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },

  /* ========= READ FUNCTIONS ========= */

  {
    name: "getUserSummary",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      {
        components: [
          { name: "referrer", type: "address" },
          { name: "activePrincipal", type: "uint256" },
          { name: "totalStakedVolume", type: "uint256" },
          { name: "rewardBalance", type: "uint256" },
          { name: "directCount", type: "uint256" },
          { name: "teamCount", type: "uint256" },
          { name: "teamVolume", type: "uint256" },
          { name: "salaryStageClaimed", type: "uint256" },
          { name: "totalStakes", type: "uint256" },
          { name: "totalPendingRewards", type: "uint256" }
        ],
        type: "tuple"
      }
    ]
  },

  {
    name: "getUserStakes",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      {
        components: [
          { name: "amount", type: "uint256" },
          { name: "totalReward", type: "uint256" },
          { name: "claimedReward", type: "uint256" },
          { name: "startTime", type: "uint256" },
          { name: "endTime", type: "uint256" },
          { name: "planId", type: "uint8" },
          { name: "withdrawn", type: "bool" }
        ],
        type: "tuple[]"
      }
    ]
  },

  {
    name: "pendingReward",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "stakeIndex", type: "uint256" }
    ],
    outputs: [{ type: "uint256" }]
  },

  {
    name: "nextClaimTime",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "stakeIndex", type: "uint256" }
    ],
    outputs: [{ type: "uint256" }]
  },

  {
    name: "canClaimSalary",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "bool" }]
  },

  {
    name: "contractTokenBalance",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },

  {
    name: "totalUsers",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },

  {
    name: "totalStakedVolume",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },

  {
    name: "totalClaimedToWallet",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },

  {
    name: "totalSalaryCredited",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  }

] as const;

/* =========================================
   NOVA TOKEN ABI (FULL ERC20)
========================================= */

export const NOVA_TOKEN_ABI = [

  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }]
  },

  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }]
  },

  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }]
  },

  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }]
  },

  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    outputs: [{ type: "uint256" }]
  },

  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ type: "bool" }]
  },

  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ type: "bool" }]
  }

] as const;

/* =========================================
   TYPES
========================================= */

export type StakeInfo = {
  amount: bigint;
  totalReward: bigint;
  claimedReward: bigint;
  startTime: bigint;
  endTime: bigint;
  planId: number;
  withdrawn: boolean;
};

export type UserSummary = {
  referrer: string;
  activePrincipal: bigint;
  totalStakedVolume: bigint;
  rewardBalance: bigint;
  directCount: bigint;
  teamCount: bigint;
  teamVolume: bigint;
  salaryStageClaimed: number;
  totalStakes: number;
  totalPendingRewards: bigint;
};