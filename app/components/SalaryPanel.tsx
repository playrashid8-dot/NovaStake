"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { formatUnits } from "viem";

import {
  NOVADEFI_ADDRESS,
  NOVADEFI_ABI,
} from "@/lib/web3";

import { useTransactionStore } from "@/lib/useTransactionStore";

export default function SalaryPanel() {
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { openModal } = useTransactionStore();

  const [loading, setLoading] = useState(false);

  async function handleClaim() {
    try {
      setLoading(true);

      const hash = await writeContractAsync({
        address: NOVADEFI_ADDRESS,
        abi: NOVADEFI_ABI,
        functionName: "claimSalary",
      });

      openModal({
        status: "success",
        message: "Salary Claimed Successfully 💰",
        hash,
      });

    } catch (err: any) {
      openModal({
        status: "error",
        message: err?.shortMessage || "Claim Failed",
      });
    } finally {
      setLoading(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
        Connect wallet to claim salary
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl border border-white/10 space-y-5 shadow-xl">

      <h2 className="text-xl font-bold text-pink-400">
        Weekly Salary System
      </h2>

      <div className="text-sm text-gray-400">
        Claim your weekly rewards based on your team performance.
      </div>

      <button
        onClick={handleClaim}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? "Processing..." : "Claim Salary"}
      </button>
    </div>
  );
}