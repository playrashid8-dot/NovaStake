"use client";

import { ethers } from "ethers";

/* ================================
   🔥 MAINNET CONFIG
================================ */

export const NOVADEFI_ADDRESS =
  "0x106f19755ca64bF2B6b96BF5A7c78667dC2bf45E";

export const USDT_ADDRESS =
  "0x55d398326f99059fF775485246999027B3197955";

export const BSC_CHAIN_ID = "0x38"; // 56

/* ================================
   📜 UPDATED CONTRACT ABI
================================ */

export const NOVADEFI_ABI = [
  {
    "inputs":[{"internalType":"address","name":"_usdt","type":"address"}],
    "stateMutability":"nonpayable",
    "type":"constructor"
  },
  {
    "inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"referrer","type":"address"}],
    "name":"deposit",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  },
  {
    "inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],
    "name":"requestWithdraw",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  },
  {
    "inputs":[],
    "name":"claimWithdraw",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  },
  {
    "inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"daysPeriod","type":"uint256"}],
    "name":"createStake",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  },
  {
    "inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],
    "name":"claimStake",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  },
  {
    "inputs":[],
    "name":"claimSalary",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  },
  {
    "inputs":[{"internalType":"address","name":"","type":"address"}],
    "name":"users",
    "outputs":[
      {"internalType":"uint256","name":"depositBalance","type":"uint256"},
      {"internalType":"uint256","name":"rewardBalance","type":"uint256"},
      {"internalType":"uint256","name":"lastROIUpdate","type":"uint256"},
      {"internalType":"uint256","name":"lastWithdrawRequest","type":"uint256"},
      {"internalType":"uint256","name":"pendingWithdraw","type":"uint256"},
      {"internalType":"uint256","name":"monthlyWithdrawn","type":"uint256"},
      {"internalType":"uint256","name":"monthStart","type":"uint256"},
      {"internalType":"uint8","name":"level","type":"uint8"},
      {"internalType":"address","name":"referrer","type":"address"},
      {"internalType":"uint256","name":"directCount","type":"uint256"},
      {"internalType":"uint256","name":"teamCount","type":"uint256"},
      {"internalType":"uint8","name":"salaryStage","type":"uint8"}
    ],
    "stateMutability":"view",
    "type":"function"
  }
];

/* ================================
   💵 USDT ERC20 ABI
================================ */

export const ERC20_ABI = [
  "function approve(address spender,uint256 amount) returns(bool)",
  "function allowance(address owner,address spender) view returns(uint256)",
  "function balanceOf(address account) view returns(uint256)"
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
   🔄 ENSURE BSC MAINNET
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

/* ================================
   💰 HELPER (18 DECIMAL SAFE)
================================ */

export function toWei(amount: string) {
  return ethers.utils.parseUnits(amount, 18);
}

export function fromWei(amount: any) {
  return ethers.utils.formatUnits(amount, 18);
}