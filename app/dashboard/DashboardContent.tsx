"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

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
  const tab = params.get("tab");

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
    <div className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pb-32">

      {/* 🔥 HERO SECTION */}
      <div className="px-5 pt-6">
        <PremiumHeader />
      </div>

      {/* ⚡ QUICK ACTIONS */}
      <div className="grid grid-cols-4 gap-3 px-5 mt-6">
        <QuickAction label="Deposit" tab="deposit" color="from-green-400 to-emerald-600" />
        <QuickAction label="Withdraw" tab="deposit" color="from-blue-400 to-cyan-600" />
        <QuickAction label="Team" tab="team" color="from-purple-400 to-purple-600" />
        <QuickAction label="Stake" tab="staking" color="from-yellow-400 to-orange-500" />
      </div>

      {/* 📊 STATS */}
      <div className="mt-10 px-5">
        <StatsGrid />
      </div>

      {/* 💰 SALARY */}
      <div className="mt-8 px-5">
        <SalaryPanel />
      </div>

      {/* 🔄 DYNAMIC CONTENT */}
      {tab === "deposit" && (
        <div className="mt-10 px-5 space-y-6">
          <DepositPanel />
          <WithdrawPanel />
        </div>
      )}

      {tab === "team" && (
        <div className="mt-10 px-5">
          <TeamSection />
        </div>
      )}

      {tab === "staking" && (
        <div className="mt-10 px-5">
          <StakingSection />
        </div>
      )}

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