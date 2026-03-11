"use client";

import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import {
  NOVASTAKE_ABI,
  NOVASTAKE_ADDRESS,
  SALARY_STAGE_META,
} from "@/lib/contract";
import { useNovaUser } from "@/lib/hooks/useNovaUser";
import { useToastStore } from "@/lib/useToastStore";

function formatToken(value?: bigint | null, decimals = 18, max = 4) {
  if (value == null) return "0";
  const num = Number(value) / 10 ** decimals;
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: max,
  });
}

export default function RewardsPanel() {
  const openToast = useToastStore((s) => s.openToast);
  const { writeContractAsync, data: txHash } = useWriteContract();

  const { isLoading: txPending } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const {
    rewardBalance,
    totalPendingRewards,
    maturedPrincipal,
    canClaimSalary,
    salaryStageClaimed,
    directCount,
    teamCount,
    teamVolume,
    contractTokenBalance,
    treasuryReferralBalance,
    refetchAll,
  } = useNovaUser();

  const nextSalaryStage = SALARY_STAGE_META.find(
    (stage) => stage.stage === salaryStageClaimed + 1
  );

  async function handleClaimAll() {
    try {
      const hash = await writeContractAsync({
        address: NOVASTAKE_ADDRESS,
        abi: NOVASTAKE_ABI,
        functionName: "claimAll",
      });

      openToast(`Claim All sent: ${hash.slice(0, 10)}...`, "success");
      await refetchAll();
    } catch (error: any) {
      openToast(
        error?.shortMessage || error?.message || "Claim all failed",
        "error"
      );
    }
  }

  async function handleClaimSalary() {
    try {
      const hash = await writeContractAsync({
        address: NOVASTAKE_ADDRESS,
        abi: NOVASTAKE_ABI,
        functionName: "claimSalary",
      });

      openToast(`Salary claim sent: ${hash.slice(0, 10)}...`, "success");
      await refetchAll();
    } catch (error: any) {
      openToast(
        error?.shortMessage || error?.message || "Claim salary failed",
        "error"
      );
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white">Rewards Panel</h2>
        <p className="mt-1 text-sm text-white/60">
          Your staking rewards, claimable balance, salary status, and treasury
          stats.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm text-white/50">Reward Balance</div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {formatToken(rewardBalance)} NOVA
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm text-white/50">Pending Rewards</div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {formatToken(totalPendingRewards)} NOVA
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm text-white/50">Matured Principal</div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {formatToken(maturedPrincipal)} NOVA
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm text-white/50">Contract Reward Pool</div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {formatToken(contractTokenBalance)} NOVA
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm text-white/50">Direct Count</div>
          <div className="mt-2 text-xl font-semibold text-white">
            {directCount.toString()}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm text-white/50">Team Count</div>
          <div className="mt-2 text-xl font-semibold text-white">
            {teamCount.toString()}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm text-white/50">Team Volume</div>
          <div className="mt-2 text-xl font-semibold text-white">
            {formatToken(teamVolume)} NOVA
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm text-white/50">Treasury Referral Balance</div>
          <div className="mt-2 text-xl font-semibold text-white">
            {formatToken(treasuryReferralBalance)} NOVA
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="mb-3 text-lg font-semibold text-white">
          Salary Progress
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <div className="text-xs text-white/50">Current Stage Claimed</div>
            <div className="mt-1 text-base font-medium text-white">
              S{salaryStageClaimed}
            </div>
          </div>

          <div>
            <div className="text-xs text-white/50">Next Stage</div>
            <div className="mt-1 text-base font-medium text-white">
              {nextSalaryStage ? `S${nextSalaryStage.stage}` : "Completed"}
            </div>
          </div>

          <div>
            <div className="text-xs text-white/50">Claimable</div>
            <div className="mt-1 text-base font-medium text-white">
              {canClaimSalary ? "Yes" : "No"}
            </div>
          </div>

          <div>
            <div className="text-xs text-white/50">Next Reward</div>
            <div className="mt-1 text-base font-medium text-white">
              {nextSalaryStage ? `${nextSalaryStage.reward} NOVA` : "-"}
            </div>
          </div>
        </div>

        {nextSalaryStage && (
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-xs text-white/50">Required Direct</div>
              <div className="mt-1 text-sm text-white">
                {directCount.toString()} / {nextSalaryStage.direct}
              </div>
            </div>

            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-xs text-white/50">Required Team</div>
              <div className="mt-1 text-sm text-white">
                {teamCount.toString()} / {nextSalaryStage.team}
              </div>
            </div>

            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-xs text-white/50">Required Volume</div>
              <div className="mt-1 text-sm text-white">
                {formatToken(teamVolume)} / {nextSalaryStage.volume}
              </div>
            </div>

            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-xs text-white/50">Stage Reward</div>
              <div className="mt-1 text-sm text-white">
                {nextSalaryStage.reward} NOVA
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleClaimAll}
          disabled={txPending || rewardBalance <= 0n}
          className="rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          Claim All
        </button>

        <button
          type="button"
          onClick={handleClaimSalary}
          disabled={txPending || !canClaimSalary}
          className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Claim Salary
        </button>
      </div>

      <div className="mt-4 text-sm text-white/50">
        Claim All transfers your NOVA reward balance to wallet with{" "}
        <span className="text-white">5% treasury fee</span>.
      </div>
    </section>
  );
}