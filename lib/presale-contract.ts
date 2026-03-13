/* =========================================
   PRESALE CONTRACT CONFIG
========================================= */

export const NOVA_PRESALE_ADDRESS =
  "0xa2277B3A6997988E9890Df8dca5B1972176d02BB" as const;

/* BSC USDT */
export const BSC_USDT_ADDRESS =
  "0x55d398326f99059fF775485246999027B3197955" as const;

export const USDT_DECIMALS = 18; // BSC bridged USDT
export const NOVA_DECIMALS = 18;

export const PRESALE_PRICE_TEXT = "1 NOVA = 1.5 USDT";

/* =========================================
   PRESALE ABI
========================================= */

export const NOVA_PRESALE_ABI = [
  {
    name: "buyWithUSDT",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "usdtAmount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "previewNovaAmount",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "usdtAmount", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "presaleActive",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "minBuyUSDT",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "maxBuyUSDT",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalUSDRaised",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalNovaSold",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "remainingNovaForSale",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getUserInfo",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "spentUSDT", type: "uint256" },
      { name: "boughtNOVA", type: "uint256" },
      { name: "boughtBefore", type: "bool" },
    ],
  },
] as const;

/* =========================================
   USDT ABI
========================================= */

export const PRESALE_USDT_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
] as const;