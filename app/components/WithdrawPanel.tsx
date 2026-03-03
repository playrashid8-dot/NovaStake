"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import {
  NOVADEFI_ADDRESS,
  NOVADEFI_ABI,
} from "@/lib/web3";

export default function WithdrawPanel() {
  const { address, isConnected } = useAccount();

  const [amount, setAmount] = useState("");
  const [cooldown, setCooldown] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  /* ================= USER DATA ================= */

  const { data: userData } = useReadContract({
    address: NOVADEFI_ADDRESS as `0x${string}`,
    abi: NOVADEFI_ABI,
    functionName: "users",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const user = Array.isArray(userData) ? userData : null;

  /* ================= COOLDOWN LOGIC ================= */

  useEffect(() => {
    if (!user) return;

    const lastWithdraw =
      typeof user[3] === "bigint" ? Number(user[3]) : 0;

    const cooldownSeconds = 96 * 60 * 60;
    const now = Math.floor(Date.now() / 1000);
    const remaining = lastWithdraw + cooldownSeconds - now;

    setCooldown(remaining > 0 ? remaining : 0);
  }, [user]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev: number) =>
        prev > 0 ? prev - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  function formatTime(seconds: number) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
  }

  /* ================= WRITE FUNCTION ================= */

  const { writeContractAsync } = useWriteContract();

  async function handleWithdraw() {
    if (!amount || Number(amount) <= 0) return;

    try {
      setLoading(true);

      const parsedAmount = parseUnits(amount, 18);

      await writeContractAsync({
        address: NOVADEFI_ADDRESS as `0x${string}`,
        abi: NOVADEFI_ABI,
        functionName: "requestWithdraw",
        args: [parsedAmount],
      });

      alert("Withdraw request submitted ✅");
      setAmount("");

    } catch (err) {
      console.error(err);
      alert("Withdraw failed ❌");
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */

  if (!isConnected) {
    return (
      <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
        Please connect wallet
      </div>
    );
  }

  return (
    <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 space-y-4">

      <h2 className="text-xl font-bold text-red-400">
        Withdraw Request
      </h2>

      {/* Cooldown */}
      <div className="text-sm text-gray-400">
        {cooldown > 0 ? (
          <span className="text-yellow-400">
            Cooldown: {formatTime(cooldown)}
          </span>
        ) : (
          <span className="text-green-400">
            Withdrawal Available
          </span>
        )}
      </div>

      {/* Input */}
      <input
        type="number"
        placeholder="Enter amount in USDT"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
      />

      {/* Button */}
      <button
        onClick={handleWithdraw}
        disabled={loading || cooldown > 0}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? "Processing..." : "Request Withdraw"}
      </button>
    </div>
  );
}