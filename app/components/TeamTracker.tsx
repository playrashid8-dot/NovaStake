"use client";

import { Users, UserPlus, Gift, Layers3 } from "lucide-react";
import { useNovaUser } from "@/lib/hooks/useNovaUser";

function formatToken(value?: bigint | number | null, decimals = 18, max = 2) {
  if (value == null) return "0.00";

  const num =
    typeof value === "bigint"
      ? Number(value.toString()) / 10 ** decimals
      : Number(value);

  if (!Number.isFinite(num)) return "0.00";

  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: max,
  });
}

export default function TeamTracker() {
  const user = useNovaUser();

  if (!user?.connected) return null;

  const direct = user.directCount ?? 0n;
  const team = user.teamCount ?? 0n;
  const reward = user.rewardBalance ?? 0n;
  const teamVolume = user.teamVolume ?? 0n;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MiniCard
        title="Direct Referrals"
        value={direct.toString()}
        subtext="Personal invites"
        icon={<UserPlus size={16} />}
        box="bg-blue-500/10 border-blue-500/20"
        text="text-blue-300"
      />

      <MiniCard
        title="Team Count"
        value={team.toString()}
        subtext="Network size"
        icon={<Users size={16} />}
        box="bg-purple-500/10 border-purple-500/20"
        text="text-purple-300"
      />

      <MiniCard
        title="Team Volume"
        value={`${formatToken(teamVolume)} NOVA`}
        subtext="Downline staking volume"
        icon={<Layers3 size={16} />}
        box="bg-yellow-500/10 border-yellow-500/20"
        text="text-yellow-300"
      />

      <MiniCard
        title="Rewards"
        value={`${formatToken(reward)} NOVA`}
        subtext="Claimable reward balance"
        icon={<Gift size={16} />}
        box="bg-green-500/10 border-green-500/20"
        text="text-green-300"
      />
    </div>
  );
}

function MiniCard({
  title,
  value,
  subtext,
  icon,
  box,
  text,
}: {
  title: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  box: string;
  text: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${box}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-white/50">{title}</div>
          <div className={`mt-2 text-xl font-extrabold ${text}`}>{value}</div>
          <div className="mt-1 text-[11px] text-white/40">{subtext}</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-2 text-white/80">
          {icon}
        </div>
      </div>
    </div>
  );
}