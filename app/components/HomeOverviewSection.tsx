"use client";

import {
  Wallet,
  Users,
  Coins,
  Layers3,
  Crown,
  Sparkles,
  ShieldCheck,
  Repeat,
} from "lucide-react";

type HomeOverviewSectionProps = {
  activeStake: string;
  rewardBalance: string;
  teamVolume: string;
  directReferrals: number | string;
};

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function StatCard({
  title,
  value,
  icon,
  valueClass,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:border-white/15 hover:bg-white/[0.07] md:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">
          {title}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/10 p-2 text-white/90">
          {icon}
        </div>
      </div>

      <div className={cn("text-lg font-black text-white md:text-xl", valueClass)}>
        {value}
      </div>
    </div>
  );
}

export default function HomeOverviewSection({
  activeStake,
  rewardBalance,
  teamVolume,
  directReferrals,
}: HomeOverviewSectionProps) {
  return (
    <section className="w-full">
      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(10,16,32,0.96),rgba(25,18,45,0.94),rgba(7,10,22,0.98))] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.35)] md:p-6">

        <div className="relative">
          <div className="absolute -right-10 top-0 h-32 w-32 rounded-full bg-yellow-400/10 blur-3xl" />
          <div className="absolute left-0 top-0 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">

            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-300">
                <Crown size={14} />
                Premium Dashboard Overview
              </div>

              <h2 className="mt-4 text-2xl font-black tracking-tight text-white md:text-4xl">
                NovaStake Control Center
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/60 md:text-base">
                Track your stake, rewards, referrals, salary progress, and token
                activity from one premium dashboard.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
                  <Sparkles size={13} />
                  Smart staking
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1 text-xs font-medium text-green-300">
                  <ShieldCheck size={13} />
                  Reward system
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-medium text-yellow-300">
                  <Repeat size={13} />
                  Swap ready
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 xl:min-w-[380px]">

              <StatCard
                title="Active Stake"
                value={activeStake}
                icon={<Wallet size={16} />}
                valueClass="text-yellow-300"
              />

              <StatCard
                title="Reward Balance"
                value={rewardBalance}
                icon={<Coins size={16} />}
                valueClass="text-green-300"
              />

              <StatCard
                title="Team Volume"
                value={teamVolume}
                icon={<Layers3 size={16} />}
                valueClass="text-cyan-300"
              />

              <StatCard
                title="Direct Referrals"
                value={directReferrals}
                icon={<Users size={16} />}
                valueClass="text-pink-300"
              />

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}