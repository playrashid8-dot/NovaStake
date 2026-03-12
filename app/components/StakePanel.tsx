"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { Coins } from "lucide-react";

import {
  NOVASTAKE_ABI,
  NOVASTAKE_ADDRESS,
  NOVA_TOKEN_ABI,
  NOVA_TOKEN_ADDRESS,
  PLAN_META,
} from "@/lib/contract";
import { useNovaUser } from "@/lib/hooks/useNovaUser";
import { useToastStore } from "@/lib/useToastStore";

type PlanItem = {
  id: number;
  name: string;
  days: number;
  roi: string;
  totalReturnBps: number;
};

const TOKEN_DECIMALS = 18;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const FALLBACK_PLANS: PlanItem[] = [
  { id: 0, name: "Starter", days: 7, roi: "7%", totalReturnBps: 700 },
  { id: 1, name: "Boost", days: 30, roi: "45%", totalReturnBps: 4500 },
  { id: 2, name: "Pro", days: 90, roi: "160%", totalReturnBps: 16000 },
  { id: 3, name: "VIP", days: 180, roi: "400%", totalReturnBps: 40000 },
  { id: 4, name: "Elite", days: 360, roi: "900%", totalReturnBps: 90000 },
];

function formatToken(value: bigint | undefined, max = 4) {
  if (value == null) return "0";
  const raw = formatUnits(value, TOKEN_DECIMALS);
  const [whole, frac = ""] = raw.split(".");
  if (!frac) return whole;
  const trimmed = frac.slice(0, max).replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
}

function getPlans(): PlanItem[] {
  if (Array.isArray(PLAN_META) && PLAN_META.length > 0) {
    return PLAN_META.map((item: any, index: number) => ({
      id: Number(item.id ?? index),
      name: String(item.name ?? `Plan ${index + 1}`),
      days: Number(item.days ?? item.durationDays ?? 0),
      roi: String(item.roi ?? `${Number(item.totalReturnBps ?? 0) / 100}%`),
      totalReturnBps: Number(item.totalReturnBps ?? 0),
    }));
  }

  return FALLBACK_PLANS;
}

function getReferrerFromUrl(ref: string | null, selfAddress?: string) {
  if (!ref) return ZERO_ADDRESS as `0x${string}`;
  if (!/^0x[a-fA-F0-9]{40}$/.test(ref)) return ZERO_ADDRESS as `0x${string}`;
  if (selfAddress && ref.toLowerCase() === selfAddress.toLowerCase()) {
    return ZERO_ADDRESS as `0x${string}`;
  }
  return ref as `0x${string}`;
}

export default function StakePanel() {
  const plans = useMemo(() => getPlans(), []);
  const { address, isConnected } = useAccount();
  const searchParams = useSearchParams();
  const user = useNovaUser();
  const { openToast } = useToastStore();

  const handledHashRef = useRef<string | null>(null);

  const [selectedPlan, setSelectedPlan] = useState<number>(plans[0]?.id ?? 0);
  const [amount, setAmount] = useState("");
  const [referrer, setReferrer] = useState<`0x${string}`>(
    ZERO_ADDRESS as `0x${string}`
  );

  const {
    data: txHash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  useEffect(() => {
    const urlRef = searchParams.get("ref");
    setReferrer(getReferrerFromUrl(urlRef, address));
  }, [searchParams, address]);

  useEffect(() => {
    if (writeError) {
      openToast(writeError.message || "Transaction failed.", "error");
    }
  }, [writeError, openToast]);

  useEffect(() => {
    if (!txHash || !isConfirmed) return;
    if (handledHashRef.current === txHash) return;

    handledHashRef.current = txHash;

    setAmount("");
    user.refetchAll?.();
    openToast("Transaction confirmed successfully.", "success");
  }, [isConfirmed, txHash, openToast, user]);

  const selected = useMemo(
    () => plans.find((p) => p.id === selectedPlan) ?? plans[0],
    [plans, selectedPlan]
  );

  const parsedAmount = useMemo(() => {
    try {
      if (!amount || Number(amount) <= 0) return 0n;
      return parseUnits(amount, TOKEN_DECIMALS);
    } catch {
      return 0n;
    }
  }, [amount]);

  const walletBalance = user.walletTokenBalance ?? 0n;
  const allowance = user.allowance ?? 0n;

  const minimumStake = 10n * 10n ** BigInt(TOKEN_DECIMALS);
  const belowMin = parsedAmount > 0n && parsedAmount < minimumStake;
  const canApprove = parsedAmount > 0n && allowance < parsedAmount;
  const canStake = parsedAmount > 0n && allowance >= parsedAmount;
  const isBusy = isWritePending || isConfirming;

  const expectedReward = useMemo(() => {
    if (!selected || parsedAmount <= 0n) return "0";
    const reward = (parsedAmount * BigInt(selected.totalReturnBps)) / 10000n;
    return formatToken(reward);
  }, [selected, parsedAmount]);

  const totalReturn = useMemo(() => {
    if (!selected || parsedAmount <= 0n) return "0";
    const reward = (parsedAmount * BigInt(selected.totalReturnBps)) / 10000n;
    return formatToken(parsedAmount + reward);
  }, [selected, parsedAmount]);

  function handleMax() {
    setAmount(formatToken(walletBalance, 6));
  }

  function approveToken() {
    if (!isConnected || !address) {
      openToast("Please connect your wallet first.", "error");
      return;
    }

    if (parsedAmount <= 0n) {
      openToast("Enter a valid NOVA amount.", "error");
      return;
    }

    if (belowMin) {
      openToast("Minimum stake is 10 NOVA.", "error");
      return;
    }

    writeContract({
      address: NOVA_TOKEN_ADDRESS,
      abi: NOVA_TOKEN_ABI,
      functionName: "approve",
      args: [NOVASTAKE_ADDRESS, parsedAmount],
    });

    openToast("Please confirm the approval transaction in your wallet.", "info");
  }

  function stakeNow() {
    if (!isConnected || !address) {
      openToast("Please connect your wallet first.", "error");
      return;
    }

    if (parsedAmount <= 0n) {
      openToast("Enter a valid NOVA amount.", "error");
      return;
    }

    if (belowMin) {
      openToast("Minimum stake is 10 NOVA.", "error");
      return;
    }

    if (walletBalance < parsedAmount) {
      openToast(
        "Your wallet balance is lower than the entered amount.",
        "error"
      );
      return;
    }

    writeContract({
      address: NOVASTAKE_ADDRESS,
      abi: NOVASTAKE_ABI,
      functionName: "stake",
      args: [selected.id, parsedAmount, referrer],
    });

    openToast("Please confirm the staking transaction in your wallet.", "info");
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-xl backdrop-blur md:p-6">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              Stake NOVA
            </h2>
            <p className="mt-2 text-sm text-zinc-400 md:text-base">
              Simple and secure staking. Choose a plan, approve your NOVA, then
              stake.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => {
              const active = selectedPlan === plan.id;

              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-amber-400 bg-amber-400/10"
                      : "border-white/10 bg-black/20 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-bold text-white">
                        {plan.name}
                      </div>
                      <div className="text-sm text-zinc-400">
                        {plan.days} Days
                      </div>
                    </div>

                    {active ? (
                      <div className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-black">
                        Selected
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-xs uppercase tracking-wider text-zinc-500">
                      ROI
                    </div>
                    <div className="mt-1 text-lg font-semibold text-amber-300">
                      {plan.roi}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-xl backdrop-blur md:p-6">
          <div className="mb-5">
            <div className="text-sm uppercase tracking-wider text-zinc-500">
              Selected Plan
            </div>
            <h3 className="mt-1 text-2xl font-bold text-white">
              {selected.name}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-wider text-zinc-500">
                Duration
              </div>
              <div className="mt-1 text-lg font-semibold text-white">
                {selected.days} Days
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-wider text-zinc-500">
                Total ROI
              </div>
              <div className="mt-1 text-lg font-semibold text-amber-300">
                {selected.roi}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Stake Amount
            </label>

            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 p-3">
              <Coins className="text-amber-400" size={18} />
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="Enter NOVA amount"
                className="w-full bg-transparent text-white outline-none placeholder:text-zinc-500"
              />
              <button
                type="button"
                onClick={handleMax}
                className="rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-white"
              >
                Max
              </button>
            </div>

            <div className="mt-2 text-sm text-zinc-400">
              Balance: {formatToken(walletBalance)} NOVA
            </div>

            {belowMin ? (
              <div className="mt-2 text-sm text-red-400">
                Minimum stake is 10 NOVA.
              </div>
            ) : null}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-wider text-zinc-500">
                Expected Reward
              </div>
              <div className="mt-1 text-lg font-semibold text-amber-300">
                {expectedReward} NOVA
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-wider text-zinc-500">
                Total Return
              </div>
              <div className="mt-1 text-lg font-semibold text-white">
                {totalReturn} NOVA
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {canApprove ? (
              <button
                type="button"
                onClick={approveToken}
                disabled={isBusy}
                className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-bold text-black transition disabled:opacity-60"
              >
                {isBusy ? "Processing..." : "Approve NOVA"}
              </button>
            ) : (
              <button
                type="button"
                onClick={stakeNow}
                disabled={isBusy || !canStake || belowMin}
                className="w-full rounded-2xl bg-amber-400 px-4 py-3 font-bold text-black transition disabled:opacity-60"
              >
                {isBusy ? "Processing..." : "Stake Now"}
              </button>
            )}

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-300">
              <div className="mb-2 font-semibold text-white">How it works</div>
              <ul className="space-y-1">
                <li>• Choose your staking plan</li>
                <li>• Enter NOVA amount</li>
                <li>• Approve NOVA first</li>
                <li>• Then click stake</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}