"use client";

import { useState, useMemo } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { NOVADEFI_ADDRESS, NOVADEFI_ABI } from "@/lib/web3";

export default function WithdrawPanel() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= SAFE PARSED AMOUNT ================= */

  const parsedAmount = useMemo(() => {
    if (!amount || isNaN(Number(amount))) return 0n;
    return parseUnits(amount, 18);
  }, [amount]);

  /* ================= REQUEST WITHDRAW ================= */

  async function handleRequestWithdraw() {
    if (!address || parsedAmount <= 0n) return;

    setLoading(true);

    try {
      await writeContractAsync({
        address: NOVADEFI_ADDRESS,
        abi: NOVADEFI_ABI,
        functionName: "requestWithdraw",
        args: [parsedAmount],
      });

      alert("✅ Withdraw Requested");
      setAmount("");
    } catch (err) {
      console.error(err);
      alert("❌ Withdraw Request Failed");
    }

    setLoading(false);
  }

  /* ================= CLAIM WITHDRAW ================= */

  async function handleClaimWithdraw() {
    if (!address) return;

    setLoading(true);

    try {
      await writeContractAsync({
        address: NOVADEFI_ADDRESS,
        abi: NOVADEFI_ABI,
        functionName: "claimWithdraw",
      });

      alert("💰 Withdraw Claimed Successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Claim Failed");
    }

    setLoading(false);
  }

  /* ================= UI ================= */

  if (!isConnected) {
    return (
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
        Please connect your wallet.
      </div>
    );
  }

  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
      <h3 className="text-xl font-bold text-blue-400">
        Withdraw USDT
      </h3>

      <input
        type="number"
        placeholder="Enter Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-3 rounded-xl bg-black/40 border border-white/10"
      />

      <button
        onClick={handleRequestWithdraw}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-yellow-500 text-black font-semibold"
      >
        {loading ? "Processing..." : "Request Withdraw"}
      </button>

      <button
        onClick={handleClaimWithdraw}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-green-500 text-black font-semibold"
      >
        {loading ? "Processing..." : "Claim Withdraw"}
      </button>
    </div>
  );
}