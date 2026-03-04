"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";

import DepositPanel from "../components/DepositPanel";
import WithdrawPanel from "../components/WithdrawPanel";
import TeamSection from "../components/TeamSection";
import StakingSection from "../components/StakingSection";
import StatsGrid from "../components/StatsGrid";
import SalaryPanel from "../components/SalaryPanel";

const PremiumHeader = dynamic(
() => import("../components/PremiumHeader"),
{ ssr: false }
);

export default function DashboardContent() {

const { isConnected } = useAccount();
const params = useSearchParams();
const router = useRouter();

const tab = params.get("tab") || "home";

const [mounted, setMounted] = useState(false);

useEffect(() => {
setMounted(true);
}, []);

if (!mounted) return null;

if (!isConnected) {
return (
<div className="flex items-center justify-center h-[70vh] text-gray-400">
Connect wallet to access NovaDeFi
</div>
);
}

return (
<div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pb-40">

  {/* HERO HEADER */}

  <div className="px-5 pt-6">
    <PremiumHeader />
  </div>

  {/* QUICK ACTIONS */}

  <div className="grid grid-cols-4 gap-3 px-5 mt-6">

    <QuickAction
      label="Deposit"
      tab="deposit"
      color="from-green-400 to-emerald-600"
    />

    <QuickAction
      label="Withdraw"
      tab="withdraw"
      color="from-blue-400 to-cyan-600"
    />

    <QuickAction
      label="Team"
      tab="team"
      color="from-purple-400 to-purple-600"
    />

    <QuickAction
      label="Stake"
      tab="staking"
      color="from-yellow-400 to-orange-500"
    />

  </div>

  {/* STATS */}

  <div className="mt-10 px-5">
    <StatsGrid />
  </div>

  {/* SALARY */}

  <div className="mt-8 px-5">
    <SalaryPanel />
  </div>

  {/* MAIN CONTENT */}

  {tab === "deposit" && (

    <div className="mt-10 px-5 space-y-6">

      <GlassCard>
        <DepositPanel />
      </GlassCard>

    </div>

  )}

  {tab === "withdraw" && (

    <div className="mt-10 px-5 space-y-6">

      <GlassCard>
        <WithdrawPanel />
      </GlassCard>

    </div>

  )}

  {tab === "team" && (

    <div className="mt-10 px-5">

      <GlassCard>
        <TeamSection />
      </GlassCard>

    </div>

  )}

  {tab === "staking" && (

    <div className="mt-10 px-5">

      <GlassCard>
        <StakingSection />
      </GlassCard>

    </div>

  )}

  {/* MOBILE BOTTOM NAV */}

  <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 px-6 py-3 flex justify-between">

    <NavButton
      label="Home"
      tab="home"
      active={tab === "home"}
    />

    <NavButton
      label="Deposit"
      tab="deposit"
      active={tab === "deposit"}
    />

    <NavButton
      label="Withdraw"
      tab="withdraw"
      active={tab === "withdraw"}
    />

    <NavButton
      label="Team"
      tab="team"
      active={tab === "team"}
    />

    <NavButton
      label="Stake"
      tab="staking"
      active={tab === "staking"}
    />

  </div>

</div>

);
}

/* ================= GLASS CARD ================= */

function GlassCard({ children }: any) {

return (

<div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl p-4">

  {children}

</div>

);

}

/* ================= QUICK ACTION ================= */

function QuickAction({
label,
tab,
color,
}: {
label: string;
tab: string;
color: string;
}) {

return (

<a
  href={`/dashboard?tab=${tab}`}
  className={`rounded-2xl p-3 text-center text-xs font-bold text-white bg-gradient-to-r ${color} shadow-xl hover:scale-105 transition`}
>
  {label}
</a>

);

}

/* ================= MOBILE NAV BUTTON ================= */

function NavButton({
label,
tab,
active,
}: {
label: string;
tab: string;
active: boolean;
}) {

return (

<a
  href={`/dashboard?tab=${tab}`}
  className={`text-xs font-semibold ${
    active
      ? "text-green-400"
      : "text-gray-400"
  }`}
>
  {label}
</a>

);

}