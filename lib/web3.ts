"use client";

import { ethers } from "ethers";

/* ================================
   🔥 MAINNET CONFIG
================================ */

export const NOVADEFI_ADDRESS =
  "0xc3cEf0D35da2eB4Ed4aFbd5181b56B96Cda610A1";

export const USDT_ADDRESS =
  "0x55d398326f99059fF775485246999027B3197955"; // BEP20 USDT

export const BSC_CHAIN_ID = "0x38"; // 56

/* ================================
   📜 NovaDeFi ABI (FULL)
================================ */

export const NOVADEFI_ABI = [
  {
    inputs: [{ internalType: "address", name: "_treasury", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "uint256", name: "salaryAmt", type: "uint256" }],
    name: "claimSalary",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_amount", type: "uint256" },
      { internalType: "address", name: "_referrer", type: "address" },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getPendingRewards",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  { inputs: [], name: "owner", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalInvested", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "treasury", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
  {
    inputs: [
      { internalType: "address", name: "_user", type: "address" },
      { internalType: "uint8", name: "_lv", type: "uint8" },
    ],
    name: "updateLevel",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { inputs: [], name: "usdt", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "users",
    outputs: [
      { internalType: "uint256", name: "depositAmt", type: "uint256" },
      { internalType: "uint256", name: "rewardBalance", type: "uint256" },
      { internalType: "uint256", name: "lastUpdate", type: "uint256" },
      { internalType: "uint256", name: "totalWithdrawn", type: "uint256" },
      { internalType: "uint256", name: "monthlyWithdrawn", type: "uint256" },
      { internalType: "uint256", name: "lastMonthReset", type: "uint256" },
      { internalType: "address", name: "referrer", type: "address" },
      { internalType: "uint8", name: "level", type: "uint8" },
      { internalType: "uint256", name: "teamCountL3", type: "uint256" },
      { internalType: "uint256", name: "lastSalaryTeamSnapshot", type: "uint256" },
      { internalType: "uint256", name: "depositTime", type: "uint256" },
      { internalType: "bool", name: "exists", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

/* ================================
   💵 USDT ERC20 ABI
================================ */

export const ERC20_ABI = [
  "function approve(address spender,uint256 amount) external returns (bool)",
  "function allowance(address owner,address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
];

/* ================================
   🌐 PROVIDER
================================ */

export async function getProvider() {
  if (!(window as any).ethereum) {
    throw new Error("MetaMask not found");
  }
  return new ethers.providers.Web3Provider((window as any).ethereum);
}

/* ================================
   🔐 SIGNER
================================ */

export async function getSigner() {
  const provider = await getProvider();
  return provider.getSigner();
}

/* ================================
   🪙 CONTRACT INSTANCES
================================ */

export async function getUSDTContract() {
  const signer = await getSigner();
  return new ethers.Contract(USDT_ADDRESS, ERC20_ABI, signer);
}

export async function getNovaDefiContract() {
  const signer = await getSigner();
  return new ethers.Contract(NOVADEFI_ADDRESS, NOVADEFI_ABI, signer);
}

/* ================================
   🔄 ENSURE MAINNET
================================ */

export async function ensureMainnet() {
  const provider = await getProvider();
  const network = await provider.getNetwork();

  if (network.chainId !== 56) {
    await (window as any).ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BSC_CHAIN_ID }],
    });
  }
}