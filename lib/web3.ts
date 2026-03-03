"use client";

/* =========================================
   🔥 CONTRACT ADDRESSES (BSC MAINNET)
========================================= */

export const NOVADEFI_ADDRESS =
  "0xbaDB8E296f5f6d2F646A4260FdE044937F0042B8";

export const USDT_ADDRESS =
  "0x55d398326f99059fF775485246999027B3197955";

/* =========================================
   📜 NOVADEFI ABI (UPDATED V3)
========================================= */

export const NOVADEFI_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_usdt", type: "address" },
      { internalType: "address", name: "_treasury", type: "address" }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },

  {
    name: "deposit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "referrer", type: "address" }
    ],
    outputs: []
  },

  {
    name: "requestWithdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: []
  },

  {
    name: "claimWithdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },

  {
    name: "createStake",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "daysPeriod", type: "uint256" }
    ],
    outputs: []
  },

  {
    name: "claimStake",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: []
  },

  {
    name: "users",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "depositBalance", type: "uint256" },
      { name: "rewardBalance", type: "uint256" },
      { name: "lastROIUpdate", type: "uint256" },
      { name: "lastWithdrawRequest", type: "uint256" },
      { name: "pendingWithdraw", type: "uint256" },
      { name: "monthlyWithdrawn", type: "uint256" },
      { name: "monthStart", type: "uint256" },
      { name: "level", type: "uint8" },
      { name: "referrer", type: "address" },
      { name: "directCount", type: "uint256" },
      { name: "teamCount", type: "uint256" }
    ]
  },

  {
    name: "ADMIN_FEE",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },

  {
    name: "MIN_DEPOSIT",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },

  {
    name: "WITHDRAW_COOLDOWN",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
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