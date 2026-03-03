"use client";

import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import {
  NOVADEFI_ADDRESS,
  NOVADEFI_ABI,
  USDT_ADDRESS,
  ERC20_ABI,
} from "@/lib/web3";

export default function DepositPanel() {
  const { address, isConnected } = useAccount();

  const [amount, setAmount] = useState("");
  const [referrer, setReferrer] = useState("");
  const [loading, setLoading] = useState(false);

  const parsedAmount =
    amount && Number(amount) > 0
      ? parseUnits(amount, 18)
      : 0n;

  /* ================= MIN DEPOSIT ================= */

  const { data: minDepositData } = useReadContract({
    address: NOVADEFI_ADDRESS as `0x${string}`,
    abi: NOVADEFI_ABI,
    functionName: "MIN_DEPOSIT",
  });

  const minDeposit =
    typeof minDepositData === "bigint"
      ? minDepositData
      : 0n;

  /* ================= ALLOWANCE ================= */

  const { data: allowanceData } = useReadContract({
    address: USDT_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, NOVADEFI_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  const currentAllowance =
    typeof allowanceData === "bigint"
      ? allowanceData
      : 0n;

  const needsApproval =
    parsedAmount > 0n &&
    currentAllowance < parsedAmount;

  /* ================= WRITE ================= */

  const { writeContractAsync } = useWriteContract();

  async function handleApprove() {
    try {
      setLoading(true);

      await writeContractAsync({
        address: USDT_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [NOVADEFI_ADDRESS, parsedAmount],
      });

      alert("Approval successful ✅");

    } catch (err) {
      console.error(err);
      alert("Approval failed ❌");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeposit() {
    if (parsedAmount < minDeposit) {
      alert(
        `Minimum deposit is ${formatUnits(
          minDeposit,
          18
        )} USDT`
      );
      return;
    }

    try {
      setLoading(true);

      await writeContractAsync({
        address: NOVADEFI_ADDRESS as `0x${string}`,
        abi: NOVADEFI_ABI,
        functionName: "deposit",
        args: [
          parsedAmount,
          referrer || "0x0000000000000000000000000000000000000000",
        ],
      });

      alert("Deposit successful 🚀");
      setAmount("");
      setReferrer("");

    } catch (err) {
      console.error(err);
      alert("Deposit failed ❌");
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

      <h2 className="text-xl font-bold text-green-400">
        Deposit USDT
      </h2>

      {/* Amount */}
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
      />

      {/* Referrer */}
      <input
        type="text"
        placeholder="Referrer address (optional)"
        value={referrer}
        onChange={(e) => setReferrer(e.target.value)}
        className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
      />

      {/* Buttons */}
      {needsApproval ? (
        <button
          onClick={handleApprove}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-yellow-500 text-black font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Approving..." : "Approve USDT"}
        </button>
      ) : (
        <button
          onClick={handleDeposit}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-black font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Processing..." : "Deposit"}
        </button>
      )}
    </div>
  );
}