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
import { useNovaUser } from "@/lib/hooks/useNovaUser";

const ALLOWED_TABS = new Set([
  "home",
  "stake",
  "team",
  "staking",
  "rewards",
  "salary",
]);

function formatToken(value?: bigint | number | null, decimals = 18, max = 2) {
  if (value == null) return `0 NOVA`;

  const num =
    typeof value === "bigint" ? Number(value) / 10 ** decimals : Number(value);

  const safe = Number.isFinite(num) ? num : 0;

  return `${safe.toLocaleString(undefined, {
    maximumFractionDigits: max,
  })} NOVA`;
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
    <div className="mx-auto max-w-6xl px-3 pb-24 pt-4 md:px-4 md:pb-6">
      {tab === "home" && (
        <div className="space-y-6">
          <HomeOverviewSection
            activeStake={formatToken(user.activeStake)}
            rewardBalance={formatToken(user.rewardBalance)}
            teamVolume={formatToken(user.teamVolume)}
            directReferrals={user.directCount.toString()}
            onStakeNow={() => router.push("/dashboard?tab=stake")}
            onClaimRewards={() => router.push("/dashboard?tab=rewards")}
            onViewMyStaking={() => router.push("/dashboard?tab=staking")}
            onViewTeam={() => router.push("/dashboard?tab=team")}
            onViewSalary={() => router.push("/dashboard?tab=salary")}
          />

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
    </div>
  );
}