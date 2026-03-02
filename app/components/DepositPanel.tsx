"use client";

import { useState, useMemo } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import {
  NOVADEFI_ADDRESS,
  NOVADEFI_ABI,
  USDT_ADDRESS,
  ERC20_ABI,
} from "@/lib/web3";

export default function DepositPanel() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [amount, setAmount] = useState("");
  const [referrer, setReferrer] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= SAFE PARSED AMOUNT ================= */

  const parsedAmount = useMemo(() => {
    if (!amount || isNaN(Number(amount))) return 0n;
    return parseUnits(amount, 18);
  }, [amount]);

  /* ================= READ ALLOWANCE ================= */

  const { data: allowance } = useReadContract({
    address: USDT_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, NOVADEFI_ADDRESS] : undefined,
    query: {
      enabled: !!address,
    },
  });

  /* ================= SAFE APPROVAL CHECK ================= */

  const currentAllowance = allowance ?? 0n;

  const needsApproval =
    parsedAmount > 0n && currentAllowance < parsedAmount;

  /* ================= HANDLE DEPOSIT ================= */

  async function handleDeposit() {
    if (!parsedAmount || parsedAmount <= 0n || !address) return;

    setLoading(true);

    try {
      /* 1️⃣ Approve if needed */
      if (needsApproval) {
        await writeContractAsync({
          address: USDT_ADDRESS,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [NOVADEFI_ADDRESS, parsedAmount],
        });
      }

      /* 2️⃣ Deposit */
      await writeContractAsync({
        address: NOVADEFI_ADDRESS,
        abi: NOVADEFI_ABI,
        functionName: "deposit",
        args: [
          parsedAmount,
          referrer || "0x0000000000000000000000000000000000000000",
        ],
      });

      alert("✅ Deposit Successful");
      setAmount("");
      setReferrer("");
    } catch (err) {
      console.error(err);
      alert("❌ Deposit Failed");
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
      <h3 className="text-xl font-bold text-green-400">
        Deposit USDT
      </h3>

      <input
        type="number"
        placeholder="Enter Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-3 rounded-xl bg-black/40 border border-white/10"
      />

      <input
        type="text"
        placeholder="Referrer (optional)"
        value={referrer}
        onChange={(e) => setReferrer(e.target.value)}
        className="w-full p-3 rounded-xl bg-black/40 border border-white/10"
      />

      <button
        onClick={handleDeposit}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-blue-500 text-black font-semibold"
      >
        {loading
          ? "Processing..."
          : needsApproval
          ? "Approve + Deposit"
          : "Deposit"}
      </button>
    </div>
  );
}