"use client";

import { createPublicClient, createWalletClient, http, custom } from "viem";
import { bsc } from "viem/chains";

/* =========================================
🌐 RPC
========================================= */

export const BSC_RPC = "https://bsc-dataseed.binance.org";

/* =========================================
📡 PUBLIC CLIENT
(read-only blockchain calls)
========================================= */

export const publicClient = createPublicClient({
  chain: bsc,
  transport: http(BSC_RPC),
});

/* =========================================
👛 WALLET CLIENT
(for transactions)
========================================= */

export function getWalletClient() {
  if (typeof window === "undefined" || !window.ethereum) return null;

  return createWalletClient({
    chain: bsc,
    transport: custom(window.ethereum),
  });
}

/* =========================================
🧠 CHAIN INFO
========================================= */

export const CHAIN_ID = bsc.id;
export const CHAIN_NAME = bsc.name;

/* =========================================
🔗 BLOCK EXPLORER
========================================= */

export const BSC_SCAN = "https://bscscan.com";

/* =========================================
🪙 TOKEN DECIMALS
========================================= */

export const TOKEN_DECIMALS = 18;

/* =========================================
🧩 HELPERS
========================================= */

export function formatUnits(value: bigint, decimals = 18) {
  const divisor = BigInt(10) ** BigInt(decimals);
  return Number(value) / Number(divisor);
}

export function parseUnits(value: string, decimals = 18) {
  const multiplier = BigInt(10) ** BigInt(decimals);
  return BigInt(Math.floor(Number(value) * Number(multiplier)));
}