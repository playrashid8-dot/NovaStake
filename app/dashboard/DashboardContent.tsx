"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import StakePanel from "@/app/components/StakePanel";
import RewardsPanel from "@/app/components/RewardsPanel";
import TeamSection from "@/app/components/TeamSection";
import StakingSection from "@/app/components/StakingSection";
import ReferralBox from "@/app/components/ReferralBox";
import SalaryPanel from "@/app/components/SalaryPanel";
import HomeOverviewSection from "@/app/components/HomeOverviewSection";
import PresalePanel from "@/app/components/PresalePanel";
import { useNovaUser } from "@/lib/hooks/useNovaUser";
import SwapPanel from "@/app/components/SwapPanel";

const ALLOWED_TABS = new Set([
  "home",
  "stake",
  "team",
  "staking",
  "rewards",
  "salary",
  "presale",
  "swap",
]);

function formatToken(
  value?: bigint | number | null,
  decimals = 18,
  max = 2,
  symbol = "NOVA"
) {
  if (value == null) return `0 ${symbol}`;

  const num =
    typeof value === "bigint"
      ? Number(value.toString()) / 10 ** decimals
      : Number(value);

  const safe = Number.isFinite(num) ? num : 0;

  return `${safe.toLocaleString(undefined, {
    maximumFractionDigits: max,
  })} ${symbol}`;
}

export default function DashboardContent() {
  const params = useSearchParams();
  const router = useRouter();
  const user = useNovaUser();

  const tab = useMemo(() => {
    const value = params.get("tab") || "home";
    return ALLOWED_TABS.has(value) ? value : "home";
  }, [params]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [tab]);

  return (
    <div className="mx-auto max-w-7xl px-3 pb-24 pt-4 md:px-4 md:pb-8">
      {tab === "home" && (
        <div className="space-y-6">
          <HomeOverviewSection
            activeStake={formatToken(user.activeStake)}
            rewardBalance={formatToken(user.rewardBalance)}
            teamVolume={formatToken(user.teamVolume)}
            directReferrals={user.directCount.toString()}
          />

          <div className="rounded-[26px] border border-white/10 bg-white/5 p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Quick Actions
                </h3>
                <p className="mt-1 text-sm text-white/55">
                  Open the most important sections instantly
                </p>
              </div>

              <div className="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-300">
                VIP
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <ActionMiniButton
                label="Stake Now"
                primary
                onClick={() => router.push("/dashboard?tab=stake")}
              />
              <ActionMiniButton
                label="Claim Rewards"
                onClick={() => router.push("/dashboard?tab=rewards")}
              />
              <ActionMiniButton
                label="My Staking"
                onClick={() => router.push("/dashboard?tab=staking")}
              />
              <ActionMiniButton
                label="Team"
                onClick={() => router.push("/dashboard?tab=team")}
              />
              <ActionMiniButton
                label="Salary"
                onClick={() => router.push("/dashboard?tab=salary")}
              />
              <ActionMiniButton
                label="Presale"
                onClick={() => router.push("/dashboard?tab=presale")}
              />
              <ActionMiniButton
                label="Swap"
                onClick={() => router.push("/dashboard?tab=swap")}
              />
          
            </div>
          </div>

          <ReferralBox />
        </div>
      )}

      {tab === "stake" && (
        <div className="space-y-6">
          <StakePanel />
        </div>
      )}

      {tab === "staking" && (
        <div className="space-y-6">
          <StakingSection />
        </div>
      )}

      {tab === "rewards" && (
        <div className="space-y-6">
          <RewardsPanel />
        </div>
      )}

      {tab === "team" && (
        <div className="space-y-6">
          <TeamSection />
        </div>
      )}

      {tab === "salary" && (
        <div className="space-y-6">
          <SalaryPanel />
        </div>
      )}

      {tab === "presale" && (
        <div className="space-y-6">
          <PresalePanel />
        </div>
      )}

      {tab === "swap" && (
        <div className="space-y-6">
          <SwapPanel />
        </div>
      )}

      
    </div>
  );
}

function ActionMiniButton({
  label,
  onClick,
  primary = false,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl px-4 py-3 text-sm font-semibold transition",
        primary
          ? "bg-yellow-400 text-black hover:bg-yellow-300"
          : "border border-white/10 bg-black/20 text-white hover:border-white/20 hover:bg-black/30",
      ].join(" ")}
    >
      {label}
    </button>
  );
}