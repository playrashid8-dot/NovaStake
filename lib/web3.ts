"use client";

import { ethers } from "ethers";

/* ================================
   🔥 MAINNET CONFIG
================================ */

export const NOVADEFI_ADDRESS =
  "0x9e2d260C301357883B5dAc9a68b23aC4f05fe6EA";

export const USDT_ADDRESS =
  "0x55d398326f99059fF775485246999027B3197955";

export const BSC_CHAIN_ID = "0x38"; // 56

/* ================================
   📜 UPDATED CONTRACT ABI
================================ */

export const NOVADEFI_ABI = [
  "function deposit(uint256 amount,address referrer)",
  "function withdraw(uint256 amount)",
  "function claimSalary()",
  "function createStake(uint256 amount,uint256 daysPeriod)",
  "function claimStake(uint256 index)",
  "function updateReward(address userAddr)",
  "function updateTreasury(address newWallet)",
  "function treasury() view returns(address)",
  "function owner() view returns(address)",
  "function MIN_DEPOSIT() view returns(uint256)",
  "function LOCK_PERIOD() view returns(uint256)",
  "function WITHDRAW_COOLDOWN() view returns(uint256)",
  "function ADMIN_FEE() view returns(uint256)",
  "function users(address) view returns(uint256 depositBalance,uint256 stakedBalance,uint256 rewardBalance,uint256 lastUpdate,uint256 depositTime,uint256 lastWithdrawTime,address referrer,uint8 level,uint256 directCount,uint256 teamCount,uint8 salaryStage,uint256 lastSalaryTeam)",
  "function userStakes(address,uint256) view returns(uint256 amount,uint256 startTime,uint256 endTime,uint256 dailyRate,bool claimed)"
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