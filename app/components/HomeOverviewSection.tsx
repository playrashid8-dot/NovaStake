"use client";

import {
  Wallet,
  Users,
  Coins,
  Layers3,
  ChevronRight,
} from "lucide-react";

type HomeOverviewSectionProps = {
  activeStake: string;
  rewardBalance: string;
  teamVolume: string;
  directReferrals: number | string;
  onStakeNow?: () => void;
  onClaimRewards?: () => void;
  onViewMyStaking?: () => void;
  onViewTeam?: () => void;
  onViewSalary?: () => void;
};

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 transition hover:border-white/15 hover:bg-black/40">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wide text-white/45">
          {title}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/10 p-2 text-white/90">
          {icon}
        </div>
      </div>

      <div className="text-lg font-extrabold text-white md:text-xl">
        {value}
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  primary = false,
}: {
  label: string;
  onClick?: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition",
        primary
          ? "bg-gradient-to-r from-green-400 to-blue-500 text-black hover:opacity-95"
          : "border border-white/10 bg-white/5 text-white hover:bg-white/10",
      ].join(" ")}
    >
      {label}
      <ChevronRight size={15} />
    </button>
  );
}

export default function HomeOverviewSection({
  activeStake,
  rewardBalance,
  teamVolume,
  directReferrals,
  onStakeNow,
  onClaimRewards,
  onViewMyStaking,
  onViewTeam,
  onViewSalary,
}: HomeOverviewSectionProps) {
  return (
    <section className="w-full">
      <div className="rounded-3xl border border-white/10 bg-[#0b1020] p-4 md:p-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-white md:text-2xl">
            Dashboard Overview
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Simple summary of your staking account
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Active Stake"
            value={activeStake}
            icon={<Wallet size={16} />}
          />

          <StatCard
            title="Reward Balance"
            value={rewardBalance}
            icon={<Coins size={16} />}
          />

          <StatCard
            title="Team Volume"
            value={teamVolume}
            icon={<Layers3 size={16} />}
          />

          <StatCard
            title="Direct Referrals"
            value={directReferrals}
            icon={<Users size={16} />}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
          <ActionButton label="Stake Now" onClick={onStakeNow} primary />
          <ActionButton label="Claim Rewards" onClick={onClaimRewards} />
          <ActionButton label="My Staking" onClick={onViewMyStaking} />
          <ActionButton label="Team" onClick={onViewTeam} />
          <ActionButton label="Salary" onClick={onViewSalary} />
        </div>
      </div>
    </section>
  );
}