"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ethers } from "ethers";
import StatsGrid from "../components/StatsGrid";
import DepositPanel from "../components/DepositPanel";
import WithdrawPanel from "../components/WithdrawPanel";
import TeamSection from "../components/TeamSection";
import StakingSection from "../components/StakingSection";
import { getProvider, getNovaDefiContract } from "@/lib/web3";
import BottomNav from "../components/BottomNav";

export default function Dashboard() {
  const params = useSearchParams();
  const tab = params.get("tab");

  const [account, setAccount] = useState<string | null>(null);
  const [level, setLevel] = useState<number>(1);
  const [monthlyUsed, setMonthlyUsed] = useState(0);
  const [monthlyLimit, setMonthlyLimit] = useState(500);

  useEffect(() => {
    async function loadUser() {
      try {
        const provider = await getProvider();
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        const contract = await getNovaDefiContract();
        const user = await contract.users(address);

        const lvl = Number(user.level);
        setLevel(lvl);

        const withdrawn = Number(
          ethers.utils.formatUnits(user.monthlyWithdrawn, 18)
        );

        setMonthlyUsed(withdrawn);

        // Level based monthly cap
        if (lvl === 1) setMonthlyLimit(500);
        if (lvl === 2) setMonthlyLimit(2000);
        if (lvl === 3) setMonthlyLimit(5000);
      } catch {}
    }

    loadUser();
  }, []);

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 18) return "Good Afternoon 🌤";
    return "Good Evening 🌙";
  }

  const progress =
    monthlyLimit > 0
      ? Math.min((monthlyUsed / monthlyLimit) * 100, 100)
      : 0;

  return (
    <div className="space-y-10">

      {/* 🔥 HERO HEADER */}
      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-xl">
        <h2 className="text-3xl font-bold mb-2 text-green-400">
          {getGreeting()}
        </h2>

        {account && (
          <p className="text-gray-300 mb-2">
            Wallet: {account.slice(0, 6)}...
            {account.slice(-4)}
          </p>
        )}

        <span className="inline-block bg-green-500/20 text-green-400 px-4 py-1 rounded-full text-sm font-semibold">
          Level {level}
        </span>
      </div>

      {/* 📊 STATS */}
      <StatsGrid />

      {/* 📈 MONTHLY WITHDRAW PROGRESS */}
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg font-semibold mb-4">
          Monthly Withdrawal Usage
        </h3>

        <div className="w-full bg-white/10 h-4 rounded-full overflow-hidden">
          <div
            className="h-4 bg-gradient-to-r from-green-400 to-blue-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-sm text-gray-400 mt-2">
          {monthlyUsed} / {monthlyLimit} USDT used
        </p>
      </div>

      {/* 🏠 DEFAULT DASHBOARD */}
      {!tab && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">
            NovaDeFi Smart Control Panel 🚀
          </h2>

          <p className="text-gray-400">
            Deposit. Earn ROI. Grow Team. Unlock Salary.
            Stake for higher rewards. All secured on BNB Chain.
          </p>
        </div>
      )}

      {/* 💰 DEPOSIT TAB */}
      {tab === "deposit" && (
        <div className="grid md:grid-cols-2 gap-8">
          <DepositPanel />
          <WithdrawPanel />
        </div>
      )}

      {/* 👥 TEAM TAB */}
      {tab === "team" && (
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <TeamSection />
        </div>
      )}

      {/* 🔒 STAKING TAB */}
      {tab === "staking" && (
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <StakingSection />
        </div>
      )}
    </div>
  );
}