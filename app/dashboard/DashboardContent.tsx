"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowUpRight, Repeat } from "lucide-react";

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
  "swap",
]);

const SWAP_URL = "https://pancakeswap.finance/swap?chain=bsc";

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

            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
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

      {tab === "swap" && (
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(25,25,45,0.95),rgba(45,25,70,0.92),rgba(10,10,18,0.98))] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                  <Repeat size={14} />
                  Swap Center
                </div>

                <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
                  Buy, swap, and manage NOVA liquidity access
                </h2>

                <p className="mt-2 max-w-2xl text-sm text-white/60 md:text-base">
                  Use the swap page to buy NOVA from a supported DEX. Keep your
                  wallet connected on BNB Chain before opening the swap.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                Network: <span className="font-semibold text-white">BSC Mainnet</span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <SwapInfoCard
                title="Token"
                value="NOVA"
                hint="Main staking token"
              />
              <SwapInfoCard
                title="Chain"
                value="BNB Smart Chain"
                hint="Use correct network"
              />
              <SwapInfoCard
                title="Best Use"
                value="Buy / Swap / Add Position"
                hint="Open your DEX page"
              />
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-4 md:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-lg font-bold text-white">
                    Open Swap Page
                  </div>
                  <div className="mt-1 text-sm text-white/55">
                    Replace the link in this file with your final NOVA swap URL
                  </div>
                </div>

                <a
                  href={SWAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 font-bold text-black transition hover:opacity-95"
                >
                  Open Swap
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/45">
              <div>• Set your final swap URL after token liquidity is live.</div>
              <div className="mt-1">• Keep wallet on BNB Chain before opening DEX.</div>
              <div className="mt-1">• You can later replace this with embedded swap widget.</div>
            </div>
          </div>
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

function SwapInfoCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-wider text-white/45">{title}</div>
      <div className="mt-2 text-base font-bold text-white">{value}</div>
      <div className="mt-1 text-xs text-white/50">{hint}</div>
    </div>
  );
}