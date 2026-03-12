"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Wallet, Gift, TrendingUp, ShieldCheck } from "lucide-react";

import {
  NOVASTAKE_ADDRESS,
  NOVASTAKE_ABI,
  CLAIM_FEE_BPS,
} from "@/lib/contract";
import { useToastStore } from "@/lib/useToastStore";
import { useNovaUser } from "@/lib/hooks/useNovaUser";

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function formatToken(value?: bigint | null, decimals = 18, max = 2) {
  if (value == null) return "0";

  const num = Number(value.toString()) / 10 ** decimals;
  if (!Number.isFinite(num)) return "0";

  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: max,
  });
}

export default function RewardsPanel() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { openToast } = useToastStore();
  const user = useNovaUser();

  const handledHashRef = useRef<string | null>(null);

  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [loading, setLoading] = useState(false);

  const { isLoading: txLoading, isSuccess, isError } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  const pendingRewards = user.totalPendingRewards ?? 0n;
  const claimableBalance = user.rewardBalance ?? 0n;

  const claimFee = useMemo(() => {
    return (claimableBalance * BigInt(CLAIM_FEE_BPS)) / 10000n;
  }, [claimableBalance]);

  const youReceive = useMemo(() => {
    if (claimableBalance <= 0n) return 0n;
    return claimableBalance - claimFee;
  }, [claimableBalance, claimFee]);

  async function claimAllRewards() {
    if (!address || loading || txLoading || claimableBalance <= 0n) return;

    try {
      setLoading(true);

      const hash = await writeContractAsync({
        address: NOVASTAKE_ADDRESS,
        abi: NOVASTAKE_ABI,
        functionName: "claimAll",
      });

      setTxHash(hash);
      openToast("Claim transaction submitted", "info");
    } catch (e: any) {
      openToast(e?.shortMessage || e?.message || "Claim failed", "error");
      setLoading(false);
      setTxHash(undefined);
    }
  }

  useEffect(() => {
    if (!txHash || !isSuccess) return;
    if (handledHashRef.current === txHash) return;

    handledHashRef.current = txHash;

    openToast("Rewards claimed successfully ✅", "success");
    setLoading(false);
    setTxHash(undefined);
    user.refetchAll?.();
  }, [isSuccess, txHash, openToast, user]);

  useEffect(() => {
    if (!txHash || !isError) return;

    openToast("Transaction failed", "error");
    setLoading(false);
    setTxHash(undefined);
  }, [isError, txHash, openToast]);

  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="text-white/70">Connect wallet to view rewards</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-yellow-400/15 p-2">
          <Gift size={18} className="text-yellow-400" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">Rewards</h2>
          <p className="text-sm text-white/55">
            Track pending income and claim your NOVA rewards
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatBox
          title="Daily Pending"
          value={`${formatToken(pendingRewards)} NOVA`}
          icon={<TrendingUp size={15} />}
          valueClass="text-green-400"
        />

        <StatBox
          title="Claimable"
          value={`${formatToken(claimableBalance)} NOVA`}
          icon={<Wallet size={15} />}
          valueClass="text-yellow-300"
        />

        <StatBox
          title="Claim Fee"
          value={`${formatToken(claimFee)} NOVA`}
          icon={<ShieldCheck size={15} />}
          valueClass="text-red-300"
        />

        <StatBox
          title="You Receive"
          value={`${formatToken(youReceive)} NOVA`}
          icon={<Gift size={15} />}
          valueClass="text-cyan-300"
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">
              Reward Summary
            </div>
            <div className="mt-1 text-xs text-white/50">
              Pending rewards come from active stakes. Claimable balance includes
              rewards already moved to wallet balance.
            </div>
          </div>

          <div className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-300">
            Fee {CLAIM_FEE_BPS / 100}%
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm text-white/70">
          <div className="flex items-center justify-between">
            <span>Pending stake rewards</span>
            <span className="font-semibold text-green-400">
              {formatToken(pendingRewards)} NOVA
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Claimable wallet balance</span>
            <span className="font-semibold text-yellow-300">
              {formatToken(claimableBalance)} NOVA
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Estimated fee</span>
            <span className="font-semibold text-red-300">
              -{formatToken(claimFee)} NOVA
            </span>
          </div>

          <div className="h-px bg-white/10" />

          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">Net receive</span>
            <span className="text-base font-bold text-cyan-300">
              {formatToken(youReceive)} NOVA
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={claimAllRewards}
        disabled={loading || txLoading || claimableBalance <= 0n}
        className={cn(
          "w-full rounded-2xl py-3 font-bold transition",
          loading || txLoading || claimableBalance <= 0n
            ? "cursor-not-allowed bg-white/10 text-white/40"
            : "bg-yellow-400 text-black hover:bg-yellow-300"
        )}
      >
        {loading || txLoading ? "Processing..." : "Claim All Rewards"}
      </button>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/45">
        <div>• Pending rewards are still accruing from your active stakes.</div>
        <div className="mt-1">
          • Only claimable balance is transferred when you click claim.
        </div>
        <div className="mt-1">
          • Claim transaction applies a {CLAIM_FEE_BPS / 100}% fee.
        </div>
      </div>
    </div>
  );
}

function StatBox({
  title,
  value,
  icon,
  valueClass,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="flex items-center gap-2 text-xs text-white/50">
        {icon}
        <span>{title}</span>
      </div>
      <div className={cn("mt-2 text-base font-bold", valueClass || "text-white")}>
        {value}
      </div>
    </div>
  );
}