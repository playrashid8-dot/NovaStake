export const NOVA_TREASURY_SWAP_ADDRESS =
  "0xe3361C1392EaD930b581fF54972d5B73cD50F1bd" as const;

export const BSC_USDT_ADDRESS =
  "0x55d398326f99059fF775485246999027B3197955" as const;

export const NOVA_TOKEN_ADDRESS =
  "0x58B96212cFE8DeC3e1DCc8A1016914c3d47493B7" as const;

export const USDT_DECIMALS = 18;
export const NOVA_DECIMALS = 18;

export const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
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
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export const NOVA_TREASURY_SWAP_ABI = [
  {
    name: "buy",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "usdtAmount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "sell",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "novaAmount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "previewBuy",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "usdtAmount", type: "uint256" }],
    outputs: [{ name: "novaOut", type: "uint256" }],
  },
  {
    name: "previewSell",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "novaAmount", type: "uint256" }],
    outputs: [{ name: "usdtOut", type: "uint256" }],
  },
  {
    name: "getBuyPriceE18",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getSellPriceE18",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "minBuyUSDT",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "minSellNOVA",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "swapActive",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "usdtReserve",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "novaReserve",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;