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

import {
  NOVADEFI_ADDRESS,
  NOVADEFI_ABI,
} from "@/lib/web3";

import { useTransactionStore } from "@/lib/useTransactionStore";

type UserTuple = readonly [bigint, bigint, bigint];

export default function WithdrawPanel() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { openModal } = useTransactionStore();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  /* ================= USER DATA ================= */

  const { data: userData, refetch } =
    useReadContract({
      address: NOVADEFI_ADDRESS,
      abi: NOVADEFI_ABI,
      functionName: "users",
      args: address ? [address] : undefined,
      query: { enabled: !!address },
    });

  const user = userData as UserTuple | undefined;

  const available = user?.[0] ?? 0n;
  const pendingAmount = user?.[1] ?? 0n;
  const withdrawTime = user?.[2]
    ? Number(user[2])
    : 0;

  /* ================= HISTORY ================= */

  const { data: historyData } =
    useReadContract({
      address: NOVADEFI_ADDRESS,
      abi: NOVADEFI_ABI,
      functionName: "getWithdrawHistory",
      args: address ? [address] : undefined,
      query: { enabled: !!address },
    });

  const history =
    historyData as
      | readonly [
          bigint[],
          bigint[],
          number[]
        ]
      | undefined;

  /* ================= TIMER ================= */

  useEffect(() => {
    const interval = setInterval(
      () => setNow(Date.now()),
      1000
    );
    return () => clearInterval(interval);
  }, []);

  const remaining = Math.max(
    withdrawTime * 1000 - now,
    0
  );

  const canClaim =
    remaining === 0 && pendingAmount > 0n;

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

  const disableRequest =
    !parsedAmount ||
    parsedAmount > available ||
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

      await waitForTransactionReceipt(config, {
        hash,
      });

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
        message:
          err?.shortMessage || "Request Failed",
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

      await waitForTransactionReceipt(config, {
        hash,
      });

      openModal({
        status: "success",
        message: "Withdraw Claimed 🎉",
        hash,
      });

      await refetch();

    } catch (err: any) {
      openModal({
        status: "error",
        message:
          err?.shortMessage || "Claim Failed",
      });
    } finally {
      setLoading(false);
    }
  }

  /* ================= STATUS BADGE ================= */

  const statusBadge = (status: number) => {
    if (status === 0)
      return (
        <span className="text-yellow-400">
          Pending
        </span>
      );
    if (status === 1)
      return (
        <span className="text-blue-400">
          Approved
        </span>
      );
    return (
      <span className="text-green-400">
        Paid
      </span>
    );
  };

  /* ================= UI ================= */

  if (!isConnected)
    return (
      <div className="p-6 bg-white/5 rounded-2xl text-center">
        Connect wallet
      </div>
    );

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900/80 to-black/80 rounded-2xl border border-white/10 space-y-6">

      <h2 className="text-xl font-bold text-blue-400">
        Withdraw System
      </h2>

      <div className="text-sm text-gray-400">
        Available:{" "}
        {formatUnits(available, 18)} USDT
      </div>

      {/* Request Section */}

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
              formatUnits(available, 18)
            )
          }
          className="px-4 bg-gray-700 rounded-xl"
        >
          MAX
        </button>
      </div>

      <button
        onClick={handleRequest}
        disabled={disableRequest}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-500 text-black font-semibold disabled:opacity-50"
      >
        {loading
          ? "Processing..."
          : "Request Withdraw"}
      </button>

      {/* Pending Section */}

      {pendingAmount > 0n && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl space-y-2">
          <div className="flex justify-between">
            <span>Pending</span>
            <span>
              {formatUnits(
                pendingAmount,
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

      {/* History Table */}

      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          Withdraw History
        </h3>

        {!history && (
          <div className="text-gray-500 text-sm">
            No history
          </div>
        )}

        {history && (
          <div className="space-y-2">
            {history[0].map(
              (amt, index) => (
                <div
                  key={index}
                  className="flex justify-between p-3 bg-white/5 rounded-xl text-sm"
                >
                  <span>
                    {formatUnits(
                      amt,
                      18
                    )}{" "}
                    USDT
                  </span>
                  {statusBadge(
                    history[2][index]
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>

    </div>
  );
}