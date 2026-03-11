"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Clock3, Lock } from "lucide-react";

import { NOVASTAKE_ADDRESS, NOVASTAKE_ABI, getPlanMeta } from "@/lib/contract";
import { useTransactionStore } from "@/lib/useTransactionStore";
import { useToastStore } from "@/lib/useToastStore";
import { useNovaUser } from "@/lib/hooks/useNovaUser";
import { pushDashboardHistory } from "@/lib/dashboardHistory";

function cn(...a: (string | false | undefined)[]) {
  return a.filter(Boolean).join(" ");
}

function formatToken(value?: bigint | null, decimals = 18, max = 2) {
  if (value == null) return "0";
  const num = Number(value) / 10 ** decimals;
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
  if (!endTime) return "-";

  const left = Number(endTime) * 1000 - Date.now();
  if (left <= 0) return "Matured";

  const sec = Math.floor(left / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);

  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
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

  const { openModal } = useTransactionStore();
  const openToast = useToastStore((s) => s.openToast);

  const user = useNovaUser();

  const [loading, setLoading] = useState<string | null>(null);
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
    let active = 0;
    let matured = 0;
    let withdrawn = 0;

    for (const s of sorted) {
      if (s.withdrawn) withdrawn++;
      else if (s.matured) matured++;
      else active++;
    }

    return { active, matured, withdrawn };
  }, [sorted]);

  async function claimReward(stake: (typeof sorted)[number]) {
    if (!address || txPending) return;

    try {
      setLoading(`reward-${stake.index}`);

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

      openModal({
        status: "pending",
        message: "Claiming reward...",
        hash,
      });
    } catch (e: any) {
      openModal({
        status: "error",
        message: e?.shortMessage || e?.message || "Claim reward failed",
      });

      openToast(e?.shortMessage || e?.message || "Claim reward failed", "error");
      setLoading(null);
      setPendingHash(undefined);
      setPendingAction(null);
      setPendingStake(null);
    }
  }

  async function withdrawStake(stake: (typeof sorted)[number]) {
    if (!address || txPending) return;

    try {
      setLoading(`withdraw-${stake.index}`);

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

      openModal({
        status: "pending",
        message: "Withdrawing matured stake...",
        hash,
      });
    } catch (e: any) {
      openModal({
        status: "error",
        message: e?.shortMessage || e?.message || "Withdraw failed",
      });

      openToast(e?.shortMessage || e?.message || "Withdraw failed", "error");
      setLoading(null);
      setPendingHash(undefined);
      setPendingAction(null);
      setPendingStake(null);
    }
  }

  useEffect(() => {
    async function handleSuccess() {
      if (!txSuccess || !pendingHash || !address || !pendingAction || !pendingStake) {
        return;
      }

      await user.refetchAll?.();

      if (pendingAction === "reward") {
        pushDashboardHistory(address, {
          type: "reward",
          title: "Reward Claimed",
          subtitle: new Date().toLocaleString(),
          amount: `+${formatToken(pendingStake.pendingReward)} NOVA`,
          amountClass: "text-green-400",
          badge: "Reward",
          badgeClass: "bg-green-500/15 text-green-300",
          ts: Math.floor(Date.now() / 1000),
        });

        openModal({
          status: "success",
          message: "Reward claimed successfully ✅",
          hash: pendingHash,
        });

        openToast("Reward claimed ✅", "success");
      }

      if (pendingAction === "withdraw") {
        pushDashboardHistory(address, {
          type: "stake-claim",
          title: "Stake Withdrawn",
          subtitle: new Date().toLocaleString(),
          amount: `+${formatToken(pendingStake.amount)} NOVA`,
          amountClass: "text-blue-400",
          badge: "Withdraw",
          badgeClass: "bg-blue-500/15 text-blue-300",
          ts: Math.floor(Date.now() / 1000),
        });

        openModal({
          status: "success",
          message: "Stake withdrawn successfully ✅",
          hash: pendingHash,
        });

        openToast("Stake withdrawn ✅", "success");
      }

      setLoading(null);
      setPendingHash(undefined);
      setPendingAction(null);
      setPendingStake(null);
    }

    handleSuccess();
  }, [txSuccess, pendingHash, pendingAction, pendingStake, address, user, openModal, openToast]);

  useEffect(() => {
    if (!txError || !pendingHash) return;

    openModal({
      status: "error",
      message:
        pendingAction === "withdraw"
          ? "Withdraw transaction failed"
          : "Reward transaction failed",
      hash: pendingHash,
    });

    openToast(
      pendingAction === "withdraw"
        ? "Withdraw transaction failed"
        : "Reward transaction failed",
      "error"
    );

    setLoading(null);
    setPendingHash(undefined);
    setPendingAction(null);
    setPendingStake(null);
  }, [txError, pendingHash, pendingAction, openModal, openToast]);

  if (!isConnected) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <Lock className="mx-auto text-yellow-300" size={26} />
        <div className="mt-4 text-lg font-bold text-white">
          Connect wallet to view staking
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-yellow-300">My Stakes</h2>
            <p className="text-sm text-white/60">
              Simple view of all your staking positions
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/60">
            <Clock3 size={14} />
            Auto sync
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Summary title="Active" value={summary.active} color="text-yellow-300" />
        <Summary title="Matured" value={summary.matured} color="text-green-300" />
        <Summary title="Done" value={summary.withdrawn} color="text-blue-300" />
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-white/60">
          No stakes found.
        </div>
      ) : (
        sorted.map((stake) => {
          const plan = getPlanMeta(stake.planId);
          const rewardLoading = loading === `reward-${stake.index}`;
          const withdrawLoading = loading === `withdraw-${stake.index}`;

          return (
            <div
              key={`${stake.index}-${stake.startTime?.toString?.() ?? stake.index}`}
              className="rounded-2xl border border-white/10 bg-black/30 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-white">{plan.name}</div>
                  <div className="text-xs text-white/60">
                    {plan.roi} • {plan.durationDays} days
                  </div>
                </div>

                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
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

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Info label="Stake Amount" value={`${formatToken(stake.amount)} NOVA`} />
                <Info
                  label="Pending Reward"
                  value={`${formatToken(stake.pendingReward)} NOVA`}
                  color="text-green-400"
                />
                <Info label="End Time" value={formatDate(stake.endTime)} />
                <Info
                  label="Time Left"
                  value={stake.withdrawn ? "Completed" : getTimeLeft(stake.endTime)}
                  color="text-yellow-300"
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => claimReward(stake)}
                  disabled={stake.withdrawn || stake.pendingReward <= 0n || rewardLoading || txPending}
                  className={cn(
                    "rounded-xl py-3 text-sm font-bold transition",
                    stake.withdrawn || stake.pendingReward <= 0n
                      ? "cursor-not-allowed bg-white/10 text-white/40"
                      : "bg-green-500 text-black"
                  )}
                >
                  {rewardLoading || (txPending && pendingAction === "reward")
                    ? "Processing..."
                    : "Claim Reward"}
                </button>

                <button
                  type="button"
                  onClick={() => withdrawStake(stake)}
                  disabled={stake.withdrawn || !stake.matured || withdrawLoading || txPending}
                  className={cn(
                    "rounded-xl py-3 text-sm font-bold transition",
                    stake.withdrawn || !stake.matured
                      ? "cursor-not-allowed bg-white/10 text-white/40"
                      : "bg-yellow-400 text-black"
                  )}
                >
                  {withdrawLoading || (txPending && pendingAction === "withdraw")
                    ? "Processing..."
                    : "Withdraw Stake"}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function Summary({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
      <div className="text-xs text-white/50">{title}</div>
      <div className={cn("mt-2 text-xl font-bold", color)}>{value}</div>
    </div>
  );
}

function Info({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs text-white/50">{label}</div>
      <div className={cn("mt-1 text-sm font-semibold", color || "text-white")}>
        {value}
      </div>
    </div>
  );
}