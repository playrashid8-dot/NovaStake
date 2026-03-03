"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import StatsGrid from "../components/StatsGrid";
import DepositPanel from "../components/DepositPanel";
import WithdrawPanel from "../components/WithdrawPanel";
import TeamSection from "../components/TeamSection";
import StakingSection from "../components/StakingSection";
import SalaryPanel from "../components/SalaryPanel";

export default function DashboardContent() {
  const params = useSearchParams();
  const router = useRouter();
  const tab = params.get("tab");

  const { isConnected } = useAccount();

  /* ================= WALLET CHECK ================= */

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-gray-400 text-lg">
        Please connect your wallet to access dashboard.
      </div>
    );
  }

  /* ================= TAB HANDLER ================= */

  const changeTab = (value: string) => {
    router.push(`/dashboard?tab=${value}`);
  };

  const activeTabStyle =
    "px-4 py-2 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-500 text-black font-semibold";

  const normalTabStyle =
    "px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition text-gray-300";

  /* ================= UI ================= */

  return (
    <div className="space-y-10 p-6 pb-24 max-w-7xl mx-auto">

      {/* TOP STATS */}
      <StatsGrid />

      {/* SALARY PANEL */}
      <SalaryPanel />

      {/* TAB NAVIGATION */}
      <div className="flex flex-wrap gap-3 justify-center md:justify-start">

        <button
          onClick={() => changeTab("deposit")}
          className={tab === "deposit" ? activeTabStyle : normalTabStyle}
        >
          Deposit / Withdraw
        </button>

        <button
          onClick={() => changeTab("staking")}
          className={tab === "staking" ? activeTabStyle : normalTabStyle}
        >
          Staking
        </button>

        <button
          onClick={() => changeTab("team")}
          className={tab === "team" ? activeTabStyle : normalTabStyle}
        >
          Team
        </button>

      </div>

      {/* DEFAULT WELCOME PANEL */}
      {!tab && (
        <div className="bg-gradient-to-br from-gray-900/70 to-black/70 p-10 rounded-3xl border border-white/10 shadow-xl">
          <h2 className="text-3xl font-bold mb-4 text-white">
            NovaDeFi Smart Control Panel 🚀
          </h2>
          <p className="text-gray-400 max-w-2xl">
            Manage deposits, withdrawals, staking rewards, team income,
            and salary bonuses — all from one powerful dashboard.
          </p>
        </div>
      )}

      {/* DEPOSIT + WITHDRAW */}
      {tab === "deposit" && (
        <div className="grid lg:grid-cols-2 gap-8">
          <DepositPanel />
          <WithdrawPanel />
        </div>
      )}

      {/* STAKING */}
      {tab === "staking" && <StakingSection />}

      {/* TEAM */}
      {tab === "team" && <TeamSection />}

    </div>
  );
}