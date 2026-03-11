"use client";

import Link from "next/link";
import { useNovaUser } from "@/lib/hooks/useNovaUser";

function formatToken(value?: bigint | null, decimals = 18, max = 2) {
  if (value == null) return "0.00";
  const num = Number(value) / 10 ** decimals;
  if (!Number.isFinite(num)) return "0.00";
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: max,
  });
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-white/50">{title}</div>
      <div className="mt-2 text-2xl font-extrabold text-white">{value}</div>
    </div>
  );
}

export default function PremiumHeader() {
  const user = useNovaUser();

  if (!user.connected) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
        Connect wallet to view dashboard
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card
          title="Active Stake"
          value={`${formatToken(user.activePrincipal)} NOVA`}
        />

        <Card
          title="Rewards"
          value={`${formatToken(user.rewardBalance)} NOVA`}
        />

        <Card
          title="Team Volume"
          value={`${formatToken(user.teamVolume)} NOVA`}
        />

        <Card
          title="Direct Referrals"
          value={String(user.directCount ?? 0n)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Link
          href="/dashboard?tab=stake"
          className="rounded-xl border border-green-500/30 bg-green-500/20 px-4 py-3 text-center text-sm font-semibold text-green-300"
        >
          Stake
        </Link>

        <Link
          href="/dashboard?tab=rewards"
          className="rounded-xl border border-blue-500/30 bg-blue-500/20 px-4 py-3 text-center text-sm font-semibold text-blue-300"
        >
          Rewards
        </Link>

        <Link
          href="/dashboard?tab=staking"
          className="rounded-xl border border-purple-500/30 bg-purple-500/20 px-4 py-3 text-center text-sm font-semibold text-purple-300"
        >
          My Stakes
        </Link>

        <Link
          href="/dashboard?tab=team"
          className="rounded-xl border border-yellow-500/30 bg-yellow-500/20 px-4 py-3 text-center text-sm font-semibold text-yellow-300"
        >
          Team
        </Link>
      </div>
    </div>
  );
}