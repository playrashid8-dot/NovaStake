"use client";

import { useState, useEffect, useMemo } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { parseUnits, formatUnits } from "viem";
import { config } from "@/lib/wallet";
import { NOVADEFI_ADDRESS, NOVADEFI_ABI } from "@/lib/web3";
import { useTransactionStore } from "@/lib/useTransactionStore";

const COOLDOWN_SECONDS = 96 * 60 * 60;

export default function WithdrawPanel() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { openModal } = useTransactionStore();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  /* ================= USER STRUCT ================= */

  const { data: userData, refetch } = useReadContract({
    address: NOVADEFI_ADDRESS,
    abi: NOVADEFI_ABI,
    functionName: "users",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const depositBalance = userData ? (userData as any)[0] : 0n;
  const rewardBalance = userData ? (userData as any)[1] : 0n;
  const lastWithdrawRequest = userData ? Number((userData as any)[3]) : 0;
  const pendingWithdraw = userData ? (userData as any)[4] : 0n;
  const level = userData ? Number((userData as any)[7]) : 0;

  const totalAvailable = depositBalance + rewardBalance;

  /* ================= MONTHLY LIMIT ================= */

  const getMonthlyLimit = () => {
    if (level === 3) return 5000n * 10n ** 18n;
    if (level === 2) return 2000n * 10n ** 18n;
    return 500n * 10n ** 18n;
  };

  const monthlyLimit = getMonthlyLimit();

  /* ================= TIMER ================= */

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const unlockTime = lastWithdrawRequest + COOLDOWN_SECONDS;
  const remaining =
    pendingWithdraw > 0n
      ? Math.max(unlockTime * 1000 - now, 0)
      : 0;

  const canClaim =
    pendingWithdraw > 0n && remaining === 0;

  const formatTime = () => {
    if (remaining <= 0) return "Ready";

    const total = Math.floor(remaining / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    return `${h}h ${m}m ${s}s`;
  };

  /* ================= PARSE ================= */

  const parsedAmount = useMemo(() => {
    if (!amount || Number(amount) <= 0)
      return undefined;
    try {
      return parseUnits(amount, 18);
    } catch {
      return undefined;
    }
  }, [amount]);

  const adminFee =
    parsedAmount ? (parsedAmount * 8n) / 100n : 0n;

  const userReceive =
    parsedAmount ? parsedAmount - adminFee : 0n;

  const disableRequest =
    !parsedAmount ||
    parsedAmount > totalAvailable ||
    pendingWithdraw > 0n ||
    loading;

  /* ================= REQUEST ================= */

  async function handleRequest() {
    if (disableRequest) return;

    try {
      setLoading(true);

      const hash = await writeContractAsync({
        address: NOVADEFI_ADDRESS,
        abi: NOVADEFI_ABI,
        functionName: "requestWithdraw",
        args: [parsedAmount!],
      });

      await waitForTransactionReceipt(config, { hash });

      openModal({
        status: "success",
        message: "Withdraw Requested",
        hash,
      });

      setAmount("");
      await refetch();
    } catch (err: any) {
      openModal({
        status: "error",
        message: err?.shortMessage || "Request Failed",
      });
    } finally {
      setLoading(false);
    }
  }

  /* ================= CLAIM ================= */

  async function handleClaim() {
    try {
      setLoading(true);

      const hash = await writeContractAsync({
        address: NOVADEFI_ADDRESS,
        abi: NOVADEFI_ABI,
        functionName: "claimWithdraw",
      });

      await waitForTransactionReceipt(config, { hash });

      openModal({
        status: "success",
        message: "Withdraw Claimed 🎉",
        hash,
      });

      await refetch();
    } catch (err: any) {
      openModal({
        status: "error",
        message: err?.shortMessage || "Claim Failed",
      });
    } finally {
      setLoading(false);
    }
  }

  if (!isConnected)
    return (
      <div className="p-6 bg-white/5 rounded-2xl text-center">
        Connect wallet
      </div>
    );

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900/80 to-black/80 rounded-2xl border border-white/10 space-y-6 shadow-xl">

      <h2 className="text-xl font-bold text-blue-400">
        Withdraw System
      </h2>

      <div className="space-y-1 text-sm text-gray-400">
        <div>
          Deposit Balance: {formatUnits(depositBalance, 18)} USDT
        </div>
        <div>
          Reward Balance: {formatUnits(rewardBalance, 18)} USDT
        </div>
        <div className="text-white">
          Total Available:{" "}
          {formatUnits(totalAvailable, 18)} USDT
        </div>
        <div>
          Monthly Limit:{" "}
          {formatUnits(monthlyLimit, 18)} USDT
        </div>
      </div>

      {/* INPUT */}

      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
          className="flex-1 p-3 rounded-xl bg-black/50 border border-white/10"
        />
        <button
          onClick={() =>
            setAmount(
              formatUnits(totalAvailable, 18)
            )
          }
          className="px-4 bg-gray-700 rounded-xl"
        >
          MAX
        </button>
      </div>

      {parsedAmount && (
        <div className="text-xs text-gray-400 space-y-1">
          <div>
            Admin Fee (8%):{" "}
            {formatUnits(adminFee, 18)} USDT
          </div>
          <div className="text-green-400">
            You Receive:{" "}
            {formatUnits(userReceive, 18)} USDT
          </div>
        </div>
      )}

      <button
        onClick={handleRequest}
        disabled={disableRequest}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-500 text-black font-semibold disabled:opacity-50"
      >
        {loading
          ? "Processing..."
          : pendingWithdraw > 0n
          ? "Pending Exists"
          : "Request Withdraw"}
      </button>

      {/* PENDING SECTION */}

      {pendingWithdraw > 0n && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl space-y-2">
          <div className="flex justify-between text-sm">
            <span>Pending:</span>
            <span>
              {formatUnits(
                pendingWithdraw,
                18
              )}{" "}
              USDT
            </span>
          </div>

          <div className="text-xs text-gray-400">
            Claim in: {formatTime()}
          </div>

          <button
            onClick={handleClaim}
            disabled={!canClaim || loading}
            className="w-full py-2 bg-green-500 text-black rounded-xl disabled:opacity-50"
          >
            Claim Withdraw
          </button>
        </div>
      )}
    </div>
  );
}