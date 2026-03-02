"use client";

/* =========================================
   🔥 CONTRACT ADDRESSES (BSC MAINNET)
========================================= */

export const NOVADEFI_ADDRESS =
  "0x106f19755ca64bF2B6b96BF5A7c78667dC2bf45E";

export const USDT_ADDRESS =
  "0x55d398326f99059fF775485246999027B3197955";

/* =========================================
   📜 NOVADEFI ABI (FULL ABI)
========================================= */

export const NOVADEFI_ABI = [
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "users",
    outputs: [
      { internalType: "uint256", name: "depositBalance", type: "uint256" },
      { internalType: "uint256", name: "rewardBalance", type: "uint256" },
      { internalType: "uint256", name: "lastROIUpdate", type: "uint256" },
      { internalType: "uint256", name: "lastWithdrawRequest", type: "uint256" },
      { internalType: "uint256", name: "pendingWithdraw", type: "uint256" },
      { internalType: "uint256", name: "monthlyWithdrawn", type: "uint256" },
      { internalType: "uint256", name: "monthStart", type: "uint256" },
      { internalType: "uint8", name: "level", type: "uint8" },
      { internalType: "address", name: "referrer", type: "address" },
      { internalType: "uint256", name: "directCount", type: "uint256" },
      { internalType: "uint256", name: "teamCount", type: "uint256" },
      { internalType: "uint8", name: "salaryStage", type: "uint8" }
    ],
    stateMutability: "view",
    type: "function"
  },

  {
    inputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "referrer", type: "address" }
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },

  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "requestWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },

  {
    inputs: [],
    name: "claimWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },

  {
    inputs: [],
    name: "claimSalary",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },

  {
    inputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "daysPeriod", type: "uint256" }
    ],
    name: "createStake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

/* =========================================
   💵 ERC20 ABI (USDT)
========================================= */

export const ERC20_ABI = [
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
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }]
  }
];