"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import StatsGrid from "../components/StatsGrid";
import DepositPanel from "../components/DepositPanel";
import WithdrawPanel from "../components/WithdrawPanel";
import TeamSection from "../components/TeamSection";
import StakingSection from "../components/StakingSection";
import SalaryPanel from "../components/SalaryPanel";

export default function DashboardContent() {
  const params = useSearchParams();
  const tab = params.get("tab");
  const { isConnected, address } = useAccount();

  // ✅ HYDRATION FIX START
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  // ✅ HYDRATION FIX END

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-gray-400">
        Please connect your wallet.
      </div>
    );
  }

  return (
    <div className="space-y-10 p-6 pb-24">
      
      <StatsGrid />
      <SalaryPanel />

      {!tab && (
        <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
          <h2 className="text-2xl font-bold mb-4">
            NovaDeFi Smart Control Panel 🚀
          </h2>
        </div>
      )}

      {tab === "deposit" && (
        <div className="grid md:grid-cols-2 gap-8">
          <DepositPanel />
          <WithdrawPanel />
        </div>
      )}

      {tab === "team" && <TeamSection />}
      {tab === "staking" && <StakingSection />}
    </div>
  );
}