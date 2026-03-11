"use client";

import { useMemo, useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";

import {
  NOVASTAKE_ADDRESS,
  NOVASTAKE_ABI,
  SALARY_STAGE_META,
} from "@/lib/contract";
import { useTransactionStore } from "@/lib/useTransactionStore";
import { useToastStore } from "@/lib/useToastStore";
import { useNovaUser } from "@/lib/hooks/useNovaUser";
import { pushDashboardHistory } from "@/lib/dashboardHistory";

function cn(...a: (string | false | undefined)[]) {
  return a.filter(Boolean).join(" ");
}

function formatToken(value?: bigint | number | null, decimals = 18, max = 2) {
  if (value == null) return "0";
  const num =
    typeof value === "bigint" ? Number(value) / 10 ** decimals : Number(value);

  if (!Number.isFinite(num)) return "0";

  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: max,
  });
}

export default function SalaryPanel() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { openModal } = useTransactionStore();
  const openToast = useToastStore((s) => s.openToast);

  const user = useNovaUser();

  const [pendingHash, setPendingHash] = useState<`0x${string}` | undefined>();
  const [loading, setLoading] = useState(false);

  const { isLoading: txLoading, isSuccess: txSuccess, isError: txError } =
    useWaitForTransactionReceipt({
      hash: pendingHash,
    });

  const currentStage = Number(user.salaryStageClaimed ?? 0);

  const nextStage = useMemo(
    () => SALARY_STAGE_META.find((s) => s.stage === currentStage + 1),
    [currentStage]
  );

  async function claimSalary() {
    if (!address || loading || !user.canClaimSalary) return;

    try {
      setLoading(true);

      const hash = await writeContractAsync({
        address: NOVASTAKE_ADDRESS,
        abi: NOVASTAKE_ABI,
        functionName: "claimSalary",
      });

      setPendingHash(hash);

      openModal({
        status: "pending",
        message: "Claiming salary reward...",
        hash,
      });

      openToast("Salary transaction sent", "success");
    } catch (err: any) {
      openModal({
        status: "error",
        message: err?.shortMessage || err?.message || "Claim failed",
      });

      openToast(err?.shortMessage || err?.message || "Claim failed", "error");
      setLoading(false);
    }
  }

  useMemo(() => {
    async function handleSuccess() {
      if (!pendingHash || !txSuccess || !address) return;

      await user.refetchAll?.();

      pushDashboardHistory(address, {
        type: "salary",
        title: "Salary Claimed",
        subtitle: new Date().toLocaleString(),
        amount: `Stage ${currentStage + 1}`,
        amountClass: "text-pink-300",
        badge: "Salary",
        badgeClass: "bg-pink-500/15 text-pink-200",
        ts: Math.floor(Date.now() / 1000),
      });

      openModal({
        status: "success",
        message: "Salary claimed successfully ✅",
        hash: pendingHash,
      });

      openToast("Salary claimed ✅", "success");
      setLoading(false);
      setPendingHash(undefined);
    }

    handleSuccess();
  }, [
    txSuccess,
    pendingHash,
    address,
    currentStage,
    openModal,
    openToast,
    user,
  ]);

  useMemo(() => {
    if (!txError || !pendingHash) return;

    openModal({
      status: "error",
      message: "Salary transaction failed",
      hash: pendingHash,
    });

    openToast("Salary transaction failed", "error");
    setLoading(false);
    setPendingHash(undefined);
  }, [txError, pendingHash, openModal, openToast]);

  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80">
        Connect wallet to view salary rewards
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-xl font-extrabold text-pink-300">
          Salary Rewards
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MiniBox title="Direct" value={String(user.directCount ?? 0n)} />
          <MiniBox title="Team" value={String(user.teamCount ?? 0n)} />
          <MiniBox
            title="Volume"
            value={`${formatToken(user.teamVolume)} NOVA`}
          />
          <MiniBox
            title="Active Stake"
            value={`${formatToken(user.activePrincipal)} NOVA`}
          />
        </div>
      </div>

      {nextStage ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white/60">Next Stage</div>
              <div className="text-lg font-bold text-white">
                Stage {nextStage.stage}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-white/60">Reward</div>
              <div className="text-lg font-bold text-green-300">
                {nextStage.reward} NOVA
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm text-white/70">
            <div>
              Direct: {String(user.directCount ?? 0n)} / {nextStage.direct}
            </div>
            <div>
              Team: {String(user.teamCount ?? 0n)} / {nextStage.team}
            </div>
            <div>
              Volume: {formatToken(user.teamVolume)} / {nextStage.volume} NOVA
            </div>
          </div>

          <button
            type="button"
            onClick={claimSalary}
            disabled={!user.canClaimSalary || loading || txLoading}
            className={cn(
              "mt-4 w-full rounded-xl py-3 font-bold transition",
              user.canClaimSalary
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-95"
                : "cursor-not-allowed bg-white/10 text-white/50"
            )}
          >
            {loading || txLoading ? "Claiming..." : "Claim Salary"}
          </button>
        </div>
      ) : (
        <div className="rounded-3xl border border-green-500/20 bg-green-500/5 p-6 text-center">
          <div className="text-xl font-bold text-white">
            All Salary Stages Completed
          </div>
          <p className="mt-2 text-sm text-white/55">
            You have already claimed all available salary rewards.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/45">
        <div>
          • Salary unlock depends on direct, team, and team volume growth.
        </div>
        <div className="mt-1">• Salary reward goes to reward balance.</div>
        <div className="mt-1">• Reward unit is NOVA.</div>
      </div>
    </div>
  );
}

function MiniBox({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="text-xs text-white/45">{title}</div>
      <div className="mt-1 text-base font-bold text-white">{value}</div>
    </div>
  );
}