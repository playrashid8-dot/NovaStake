"use client";

import { CheckCircle2, Clock3, Wallet } from "lucide-react";
import { useMemo } from "react";
import { useNovaUser } from "@/lib/hooks/useNovaUser";

function cn(...a: (string | false | undefined)[]) {
  return a.filter(Boolean).join(" ");
}

function StatBox({
  title,
  value,
  sub,
  tone = "default",
  icon,
}: {
  title: string;
  value: string;
  sub?: string;
  tone?: "default" | "green" | "blue" | "yellow";
  icon: React.ReactNode;
}) {
  const toneClass =
    tone === "green"
      ? "border-green-500/20 bg-green-500/10"
      : tone === "blue"
      ? "border-blue-500/20 bg-blue-500/10"
      : tone === "yellow"
      ? "border-yellow-500/20 bg-yellow-500/10"
      : "border-white/10 bg-white/5";

  return (
    <div className={cn("rounded-2xl border p-4", toneClass)}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-white/50">{title}</div>
        <div className="rounded-xl bg-white/10 p-2 text-white">{icon}</div>
      </div>

      <div className="mt-3 text-2xl font-extrabold text-white">{value}</div>
      {sub ? <div className="mt-1 text-xs text-white/45">{sub}</div> : null}
    </div>
  );
}

export default function AnalyticsSection() {
  const user = useNovaUser();

  const maturedCount = useMemo(() => {
    return (user.stakes ?? []).filter((s) => s.matured && !s.withdrawn).length;
  }, [user.stakes]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatBox
        title="Total Stakes"
        value={String(user.stakes?.length ?? 0)}
        sub="All staking entries"
        tone="blue"
        icon={<Wallet size={16} />}
      />

      <StatBox
        title="Matured Stakes"
        value={String(maturedCount)}
        sub="Ready to withdraw"
        tone="yellow"
        icon={<Clock3 size={16} />}
      />

      <StatBox
        title="Salary Status"
        value={user.canClaimSalary ? "Ready" : "Locked"}
        sub={`Stage ${user.salaryStageClaimed ?? 0}`}
        tone={user.canClaimSalary ? "green" : "default"}
        icon={<CheckCircle2 size={16} />}
      />
    </div>
  );
}