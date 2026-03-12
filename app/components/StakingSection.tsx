"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  Clock3,
  Lock,
  Coins,
  Wallet,
  CalendarDays,
  BadgeCheck,
} from "lucide-react";

import {
  NOVASTAKE_ADDRESS,
  NOVASTAKE_ABI,
  getPlanMeta,
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

function formatDate(ts?: bigint | null) {
  if (!ts || ts === 0n) return "-";
  return new Date(Number(ts) * 1000).toLocaleString();
}

function getTimeLeft(endTime?: bigint | null) {
  if (!endTime || endTime === 0n) return "-";

  const left = Number(endTime) * 1000 - Date.now();
  if (left <= 0) return "Matured";

  const totalSeconds = Math.floor(left / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

type PendingAction = "reward" | "withdraw" | null;

type PendingStake = {
  index: number;
  amount: bigint;
  pendingReward: bigint;
};

export default function StakingSection() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { openToast } = useToastStore();
  const user = useNovaUser();

  const handledHashRef = useRef<string | null>(null);

  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [pendingHash, setPendingHash] = useState<`0x${string}` | undefined>();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [pendingStake, setPendingStake] = useState<PendingStake | null>(null);

  const { isLoading: txPending, isSuccess: txSuccess, isError: txError } =
    useWaitForTransactionReceipt({
      hash: pendingHash,
    });

  const stakes = user.stakes ?? [];

  const sorted = useMemo(() => {
    return [...stakes].sort((a, b) => Number(b.startTime) - Number(a.startTime));
  }, [stakes]);

  const summary = useMemo(() => {
    let matured = 0;
    let withdrawn = 0;
    let totalPendingReward = 0n;

    for (const s of sorted) {
      totalPendingReward += s.pendingReward ?? 0n;

      if (s.withdrawn) withdrawn++;
      else if (s.matured) matured++;
    }

    return {
      active: sorted.filter((s) => !s.withdrawn).length,
      matured,
      withdrawn,
      totalPendingReward,
      totalActiveAmount: user.activePrincipal ?? 0n,
    };
  }, [sorted, user.activePrincipal]);

  async function claimReward(stake: (typeof sorted)[number]) {
    if (!address || txPending) return;

    try {
      setLoadingKey(`reward-${stake.index}`);

      const hash = await writeContractAsync({
        address: NOVASTAKE_ADDRESS,
        abi: NOVASTAKE_ABI,
        functionName: "claimReward",
        args: [BigInt(stake.index)],
      });

      setPendingHash(hash);
      setPendingAction("reward");
      setPendingStake({
        index: stake.index,
        amount: stake.amount,
        pendingReward: stake.pendingReward,
      });

      openToast("Reward claim transaction submitted.", "info");
    } catch (error: any) {
      openToast(
        error?.shortMessage || error?.message || "Claim reward failed",
        "error"
      );
      setLoadingKey(null);
      setPendingHash(undefined);
      setPendingAction(null);
      setPendingStake(null);
    }
  }

  async function withdrawStake(stake: (typeof sorted)[number]) {
    if (!address || txPending) return;

    try {
      setLoadingKey(`withdraw-${stake.index}`);

      const hash = await writeContractAsync({
        address: NOVASTAKE_ADDRESS,
        abi: NOVASTAKE_ABI,
        functionName: "withdrawStake",
        args: [BigInt(stake.index)],
      });

      setPendingHash(hash);
      setPendingAction("withdraw");
      setPendingStake({
        index: stake.index,
        amount: stake.amount,
        pendingReward: stake.pendingReward,
      });

      openToast("Withdraw transaction submitted.", "info");
    } catch (error: any) {
      openToast(
        error?.shortMessage || error?.message || "Withdraw failed",
        "error"
      );
      setLoadingKey(null);
      setPendingHash(undefined);
      setPendingAction(null);
      setPendingStake(null);
    }
  }

  useEffect(() => {
    async function handleSuccess() {
      if (!pendingHash || !txSuccess || !pendingAction || !pendingStake) return;
      if (handledHashRef.current === pendingHash) return;

      handledHashRef.current = pendingHash;

      await user.refetchAll?.();

      if (pendingAction === "reward") {
        openToast("Reward claimed successfully ✅", "success");
      }

      if (pendingAction === "withdraw") {
        openToast("Stake withdrawn successfully ✅", "success");
      }

      setLoadingKey(null);
      setPendingHash(undefined);
      setPendingAction(null);
      setPendingStake(null);
    }

    handleSuccess();
  }, [txSuccess, pendingHash, pendingAction, pendingStake, user, openToast]);

  useEffect(() => {
    if (!txError) return;

    openToast(
      pendingAction === "withdraw"
        ? "Withdraw transaction failed"
        : "Reward transaction failed",
      "error"
    );

    setLoadingKey(null);
    setPendingHash(undefined);
    setPendingAction(null);
    setPendingStake(null);
  }, [txError, pendingAction, openToast]);

  if (!isConnected) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <Lock className="mx-auto text-yellow-300" size={28} />
        <h2 className="mt-4 text-lg font-bold text-white">
          Connect wallet to view your stakes
        </h2>
        <p className="mt-2 text-sm text-white/60">
          Your active stakes, reward income, and maturity details will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-yellow-300 md:text-2xl">
              My Stakes
            </h2>
            <p className="text-sm text-white/60">
              Track active stake, daily reward income, and withdraw matured stakes
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/60">
            <Clock3 size={14} />
            Auto sync enabled
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard
          title="Active Stakes"
          value={String(summary.active)}
          color="text-yellow-300"
        />
        <SummaryCard
          title="Matured"
          value={String(summary.matured)}
          color="text-green-300"
        />
        <SummaryCard
          title="Pending Reward"
          value={`${formatToken(summary.totalPendingReward)} NOVA`}
          color="text-cyan-300"
        />
        <SummaryCard
          title="Active Amount"
          value={`${formatToken(summary.totalActiveAmount)} NOVA`}
          color="text-white"
        />
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/60">
          No stakes found.
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((stake) => {
            const plan = getPlanMeta(stake.planId);
            const rewardLoading = loadingKey === `reward-${stake.index}`;
            const withdrawLoading = loadingKey === `withdraw-${stake.index}`;

            return (
              <div
                key={`${stake.index}-${stake.startTime?.toString?.() ?? stake.index}`}
                className="rounded-2xl border border-white/10 bg-black/30 p-4 md:p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>

                      <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-xs font-semibold text-yellow-300">
                        {plan.roi}
                      </span>

                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                        {plan.durationDays} days
                      </span>
                    </div>

                    <div className="mt-2 text-sm text-white/60">
                      Stake #{stake.index}
                    </div>
                  </div>

                  <span
                    className={cn(
                      "w-fit rounded-full px-3 py-1 text-xs font-semibold",
                      stake.withdrawn
                        ? "bg-white/10 text-white/70"
                        : stake.matured
                        ? "bg-green-500/15 text-green-300"
                        : "bg-yellow-500/15 text-yellow-300"
                    )}
                  >
                    {stake.withdrawn ? "DONE" : stake.matured ? "MATURED" : "ACTIVE"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <InfoBox
                    label="Stake Amount"
                    value={`${formatToken(stake.amount)} NOVA`}
                    icon={<Coins size={15} />}
                  />
                  <InfoBox
                    label="Pending Reward"
                    value={`${formatToken(stake.pendingReward)} NOVA`}
                    color="text-green-400"
                    icon={<Wallet size={15} />}
                  />
                  <InfoBox
                    label="Start Time"
                    value={formatDate(stake.startTime)}
                    icon={<CalendarDays size={15} />}
                  />
                  <InfoBox
                    label="End Time"
                    value={formatDate(stake.endTime)}
                    icon={<CalendarDays size={15} />}
                  />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <InfoBox
                    label="Claimed Reward"
                    value={`${formatToken(stake.claimedReward)} NOVA`}
                  />
                  <InfoBox
                    label="Total Reward"
                    value={`${formatToken(stake.totalReward)} NOVA`}
                  />
                  <InfoBox
                    label="Time Left"
                    value={stake.withdrawn ? "Completed" : getTimeLeft(stake.endTime)}
                    color="text-yellow-300"
                  />
                  <InfoBox
                    label="Status"
                    value={
                      stake.withdrawn
                        ? "Completed"
                        : stake.matured
                        ? "Ready to Withdraw"
                        : "Running"
                    }
                    icon={<BadgeCheck size={15} />}
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => claimReward(stake)}
                    disabled={
                      stake.withdrawn ||
                      stake.pendingReward <= 0n ||
                      rewardLoading ||
                      txPending
                    }
                    className={cn(
                      "rounded-xl py-3 text-sm font-bold transition",
                      stake.withdrawn || stake.pendingReward <= 0n
                        ? "cursor-not-allowed bg-white/10 text-white/40"
                        : "bg-green-500 text-black hover:bg-green-400"
                    )}
                  >
                    {rewardLoading || (txPending && pendingAction === "reward")
                      ? "Processing..."
                      : "Claim Reward"}
                  </button>

                  <button
                    type="button"
                    onClick={() => withdrawStake(stake)}
                    disabled={
                      stake.withdrawn ||
                      !stake.matured ||
                      withdrawLoading ||
                      txPending
                    }
                    className={cn(
                      "rounded-xl py-3 text-sm font-bold transition",
                      stake.withdrawn || !stake.matured
                        ? "cursor-not-allowed bg-white/10 text-white/40"
                        : "bg-yellow-400 text-black hover:bg-yellow-300"
                    )}
                  >
                    {withdrawLoading || (txPending && pendingAction === "withdraw")
                      ? "Processing..."
                      : "Withdraw Stake"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
      <div className="text-xs text-white/50">{title}</div>
      <div className={cn("mt-2 text-lg font-bold md:text-xl", color)}>
        {value}
      </div>
    </div>
  );
}

function InfoBox({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-2 text-xs text-white/50">
        {icon ? icon : null}
        <span>{label}</span>
      </div>
      <div className={cn("mt-1 break-words text-sm font-semibold", color || "text-white")}>
        {value}
      </div>
    </div>
  );
}