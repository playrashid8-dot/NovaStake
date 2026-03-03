"use client";

import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useState } from "react";
import { NOVADEFI_ADDRESS, NOVADEFI_ABI } from "@/lib/web3";

const salaryStages = [
  { stage: 0, label: "5 Direct + 15 Team", reward: 30 },
  { stage: 1, label: "10 Direct + 35 Team", reward: 80 },
  { stage: 2, label: "25 Direct + 100 Team", reward: 250 },
  { stage: 3, label: "45 Direct + 150 Team", reward: 400 },
];

export default function SalaryPanel() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);

  const { data: userData } = useReadContract({
    address: NOVADEFI_ADDRESS as `0x${string}`,
    abi: NOVADEFI_ABI,
    functionName: "users",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const user = Array.isArray(userData) ? userData : null;

  const currentStage =
    user && typeof user[11] === "number" ? user[11] : 0;

  const nextStage = salaryStages[currentStage] ?? null;

  const { writeContractAsync } = useWriteContract();

  async function handleClaim() {
    try {
      setLoading(true);

      await writeContractAsync({
        address: NOVADEFI_ADDRESS as `0x${string}`,
        abi: NOVADEFI_ABI,
        functionName: "claimSalary",
      });

      alert("Salary claimed successfully 🎉");
    } catch (err) {
      console.error(err);
      alert("Claim failed ❌");
    } finally {
      setLoading(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
        Please connect wallet
      </div>
    );
  }

  return (
    <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 space-y-4">
      <h2 className="text-xl font-bold text-purple-400">
        Weekly Salary System
      </h2>

      <div className="text-sm text-gray-400">
        Current Stage: {currentStage}
      </div>

      {nextStage ? (
        <div className="p-4 bg-black/40 rounded-lg border border-white/10 space-y-2">
          <div className="text-gray-400">{nextStage.label}</div>
          <div className="text-green-400 font-bold text-lg">
            Reward: {nextStage.reward} USDT
          </div>

          <button
            onClick={handleClaim}
            disabled={loading}
            className="w-full py-3 mt-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Claim Salary"}
          </button>
        </div>
      ) : (
        <div className="text-green-400 font-semibold">
          🎉 All salary stages completed
        </div>
      )}
    </div>
  );
}