"use client";

import { useMemo, useState } from "react";
import { parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { ChevronDown, ChevronRight, Triangle } from "lucide-react";

import {
  NOVA_DECIMALS,
  NOVASTAKE_ABI,
  NOVASTAKE_ADDRESS,
  NOVA_TOKEN_ABI,
  NOVA_TOKEN_ADDRESS,
  PLAN_META,
} from "@/lib/contract";
import { useNovaUser } from "@/lib/hooks/useNovaUser";
import { useToastStore } from "@/lib/useToastStore";

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
  if (ts == null || ts === 0n) return "-";
  return new Date(Number(ts) * 1000).toLocaleDateString();
}

function getPlanSub(planId: number) {
  if (planId === 0) return "Daily ROI";
  if (planId === 1) return "45% total";
  if (planId === 2) return "160% total";
  if (planId === 3) return "400% total";
  if (planId === 4) return "900% total";
  return "-";
}

export default function StakePanel() {
  const { address, isConnected } = useAccount();
  const openToast = useToastStore((s) => s.openToast);

  const {
    stakes,
    walletTokenBalance,
    rewardBalance,
    refetchAll,
    isLoading,
  } = useNovaUser();

  const [selectedPlan, setSelectedPlan] = useState<number>(0);
  const [amount, setAmount] = useState("");
  const [referrer, setReferrer] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<"plans" | "mystaking">("plans");

  const { writeContractAsync, data: txHash } = useWriteContract();

  const { isLoading: txPending } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const parsedAmount = useMemo(() => {
    try {
      if (!amount.trim()) return 0n;
      return parseUnits(amount, NOVA_DECIMALS);
    } catch {
      return 0n;
    }
  }, [amount]);

  const allowanceRead = useReadContract({
    address: NOVA_TOKEN_ADDRESS,
    abi: NOVA_TOKEN_ABI,
    functionName: "allowance",
    args: address ? [address, NOVASTAKE_ADDRESS] : undefined,
    query: {
      enabled: Boolean(address),
      refetchInterval: 8000,
    },
  });

  const allowance = (allowanceRead.data as bigint | undefined) ?? 0n;
  const needsApproval = parsedAmount > 0n && allowance < parsedAmount;
  const busy = txPending;

  async function handleApprove() {
    try {
      if (parsedAmount <= 0n) {
        openToast("Please enter a valid NOVA amount first.", "error");
        return;
      }

      const hash = await writeContractAsync({
        address: NOVA_TOKEN_ADDRESS,
        abi: NOVA_TOKEN_ABI,
        functionName: "approve",
        args: [NOVASTAKE_ADDRESS, parsedAmount],
      });

      openToast(`Approve sent: ${hash.slice(0, 10)}...`, "success");
      await Promise.all([allowanceRead.refetch(), refetchAll()]);
    } catch (error: any) {
      openToast(error?.shortMessage || error?.message || "Approve failed", "error");
    }
  }

  async function handleStake(planId: number) {
    try {
      if (!isConnected || !address) {
        openToast("Please connect wallet first.", "error");
        return;
      }

      if (parsedAmount <= 0n) {
        openToast("Please enter a valid NOVA amount.", "error");
        return;
      }

      const finalReferrer =
        referrer.trim() && /^0x[a-fA-F0-9]{40}$/.test(referrer.trim())
          ? (referrer.trim() as `0x${string}`)
          : "0x0000000000000000000000000000000000000000";

      const hash = await writeContractAsync({
        address: NOVASTAKE_ADDRESS,
        abi: NOVASTAKE_ABI,
        functionName: "stake",
        args: [planId, parsedAmount, finalReferrer],
      });

      openToast(`Stake sent: ${hash.slice(0, 10)}...`, "success");
      setAmount("");
      setReferrer("");
      setSelectedPlan(planId);
      setActiveTab("mystaking");

      await Promise.all([allowanceRead.refetch(), refetchAll()]);
    } catch (error: any) {
      openToast(error?.shortMessage || error?.message || "Stake failed", "error");
    }
  }

  async function handleClaimReward(index: number) {
    try {
      const hash = await writeContractAsync({
        address: NOVASTAKE_ADDRESS,
        abi: NOVASTAKE_ABI,
        functionName: "claimReward",
        args: [BigInt(index)],
      });

      openToast(`Claim reward sent: ${hash.slice(0, 10)}...`, "success");
      await refetchAll();
    } catch (error: any) {
      openToast(
        error?.shortMessage || error?.message || "Claim reward failed",
        "error"
      );
    }
  }

  async function handleWithdrawStake(index: number) {
    try {
      const hash = await writeContractAsync({
        address: NOVASTAKE_ADDRESS,
        abi: NOVASTAKE_ABI,
        functionName: "withdrawStake",
        args: [BigInt(index)],
      });

      openToast(`Withdraw sent: ${hash.slice(0, 10)}...`, "success");
      await refetchAll();
    } catch (error: any) {
      openToast(
        error?.shortMessage || error?.message || "Withdraw stake failed",
        "error"
      );
    }
  }

  const sortedStakes = useMemo(() => {
    return [...(stakes ?? [])].sort((a, b) => Number(b.startTime) - Number(a.startTime));
  }, [stakes]);

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-[#5f421f] bg-[linear-gradient(180deg,rgba(23,18,17,0.96),rgba(10,10,14,0.98))] p-4 shadow-[0_0_60px_rgba(255,170,20,0.06)] md:p-6">
        <div className="flex gap-8 border-b border-[#4a3620] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("plans")}
            className={cn(
              "relative pb-2 text-xl font-semibold transition",
              activeTab === "plans" ? "text-white" : "text-white/60"
            )}
          >
            Staking Plans
            {activeTab === "plans" && (
              <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#ffcf45] via-[#ffb400] to-[#ffea9f]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("mystaking")}
            className={cn(
              "relative pb-2 text-xl font-semibold transition",
              activeTab === "mystaking" ? "text-white" : "text-white/60"
            )}
          >
            My Staking
            {activeTab === "mystaking" && (
              <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#ffcf45] via-[#ffb400] to-[#ffea9f]" />
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowGuide((p) => !p)}
          className="mt-5 flex items-center gap-2 text-left text-lg text-white/75"
        >
          How does staking work?
          {showGuide ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>

        {showGuide && (
          <div className="mt-3 rounded-2xl border border-[#49361e] bg-black/30 p-4 text-sm text-white/65">
            1. Enter NOVA amount. <br />
            2. Approve token once. <br />
            3. Select a staking plan and press Stake. <br />
            4. Claim daily rewards or withdraw after maturity.
          </div>
        )}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-white/70">
              Stake Amount (NOVA)
            </label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10"
              className="w-full rounded-2xl border border-[#5a4121] bg-black/25 px-4 py-3 text-white outline-none placeholder:text-white/25"
            />
            <div className="mt-2 text-xs text-white/45">
              Wallet Balance: {formatToken(walletTokenBalance)} NOVA
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">
              Referrer Address (optional)
            </label>
            <input
              value={referrer}
              onChange={(e) => setReferrer(e.target.value)}
              placeholder="0x..."
              className="w-full rounded-2xl border border-[#5a4121] bg-black/25 px-4 py-3 text-white outline-none placeholder:text-white/25"
            />
            <div className="mt-2 text-xs text-white/45">
              Reward Balance: {formatToken(rewardBalance)} NOVA
            </div>
          </div>
        </div>

        {needsApproval && (
          <div className="mt-4">
            <button
              type="button"
              onClick={handleApprove}
              disabled={busy}
              className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
            >
              {busy ? "Processing..." : "Approve NOVA"}
            </button>
          </div>
        )}

        {activeTab === "plans" ? (
          <div className="mt-6 space-y-4">
            {PLAN_META.map((plan) => {
              const selected = selectedPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "group relative overflow-hidden rounded-[28px] border p-5 transition-all md:p-6",
                    selected
                      ? "border-[#d39b2b] bg-[radial-gradient(circle_at_right_center,rgba(255,180,0,0.18),transparent_35%),linear-gradient(180deg,rgba(23,18,17,0.96),rgba(10,10,14,0.98))] shadow-[0_0_30px_rgba(255,184,28,0.10)]"
                      : "border-[#5a4121] bg-[radial-gradient(circle_at_right_center,rgba(255,180,0,0.10),transparent_30%),linear-gradient(180deg,rgba(23,18,17,0.96),rgba(10,10,14,0.98))]"
                  )}
                >
                  <div className="absolute inset-0 bg-[url('/gold-noise.png')] opacity-[0.05] mix-blend-screen" />

                  <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffcf45] to-[#c88300] text-black shadow-[0_0_18px_rgba(255,200,60,0.18)]">
                        <Triangle size={24} fill="currentColor" />
                      </div>

                      <div>
                        <div className="text-[38px] font-semibold leading-none text-white">
                          {plan.name}
                        </div>
                        <div className="mt-3 text-[15px] text-white/60">
                          {plan.id === 0 ? "Daily ROI" : "APR"}
                          <span className="ml-2 text-[#ffcf45]">
                            {plan.id === 0 ? "Daily ROI" : getPlanSub(plan.id)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-4 md:items-end">
                      <div className="text-2xl font-semibold text-white">
                        <span className="mr-2 text-white/35">NOVA</span>
                        {formatToken(walletTokenBalance, 18, 0)}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlan(plan.id);
                          handleStake(plan.id);
                        }}
                        disabled={busy || parsedAmount <= 0n || needsApproval}
                        className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ffd54a] via-[#ffbe0b] to-[#f0a500] px-8 py-3 text-xl font-semibold text-black shadow-[0_0_18px_rgba(255,194,23,0.18)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busy && selectedPlan === plan.id ? "Processing..." : "Stake"}
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {isLoading ? (
              <div className="rounded-2xl border border-[#5a4121] bg-black/20 p-5 text-center text-white/60">
                Loading...
              </div>
            ) : sortedStakes.length === 0 ? (
              <div className="rounded-2xl border border-[#5a4121] bg-black/20 p-5 text-center text-white/60">
                No stakes found yet.
              </div>
            ) : (
              sortedStakes.map((stake, idx) => (
                <div
                  key={`${stake.index}-${String(stake.startTime ?? 0n)}-${idx}`}
                  className="rounded-3xl border border-[#5a4121] bg-[linear-gradient(180deg,rgba(23,18,17,0.94),rgba(10,10,14,0.98))] p-5"
                >
                  <div className="grid gap-4 md:grid-cols-6">
                    <Info label="Plan" value={stake.planName} />
                    <Info label="Amount" value={`${formatToken(stake.amount)} NOVA`} />
                    <Info
                      label="Pending Reward"
                      value={`${formatToken(stake.pendingReward)} NOVA`}
                      valueClass="text-[#ffcf45]"
                    />
                    <Info label="Start" value={formatDate(stake.startTime)} />
                    <Info label="End" value={formatDate(stake.endTime)} />
                    <Info
                      label="Status"
                      value={
                        stake.withdrawn
                          ? "Done"
                          : stake.matured
                          ? "Matured"
                          : "Active"
                      }
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleClaimReward(stake.index)}
                      disabled={busy || stake.withdrawn || stake.pendingReward <= 0n}
                      className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-40"
                    >
                      Claim Reward
                    </button>

                    <button
                      type="button"
                      onClick={() => handleWithdrawStake(stake.index)}
                      disabled={busy || stake.withdrawn || !stake.matured}
                      className="rounded-full bg-gradient-to-r from-[#ffd54a] via-[#ffbe0b] to-[#f0a500] px-5 py-2.5 text-sm font-semibold text-black transition disabled:opacity-40"
                    >
                      Withdraw Stake
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function Info({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="text-xs text-white/45">{label}</div>
      <div className={cn("mt-1 text-sm font-semibold text-white", valueClass)}>
        {value}
      </div>
    </div>
  );
}