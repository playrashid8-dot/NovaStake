"use client";

import { useAccount } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";

import { useNovaUser } from "@/lib/hooks/useNovaUser";

function cn(...a: (string | false | undefined)[]) {
  return a.filter(Boolean).join(" ");
}

function formatToken(v?: bigint | null, decimals = 18) {
  if (v == null) return "0";
  const n = Number(v) / 10 ** decimals;
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function ReferralBox() {
  const { address, isConnected } = useAccount();
  const user = useNovaUser();

  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const link = useMemo(() => {
    if (!origin || !address) return "";
    return `${origin}/?ref=${address}`;
  }, [origin, address]);

  async function copy() {
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  if (!isConnected) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
        Connect wallet to see referral system
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-xl font-extrabold text-purple-300">
          Referral Link
        </h2>

        <div className="mt-4 flex items-center gap-2">
          <input
            readOnly
            value={link}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
          />

          <button
            onClick={copy}
            className={cn(
              "flex items-center justify-center rounded-xl px-3 py-2 transition",
              copied
                ? "bg-green-500 text-black"
                : "bg-purple-500 text-white"
            )}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>

        <p className="mt-2 text-xs text-white/50">
          Share this link to grow your team and earn referral rewards.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatBox
          title="Direct"
          value={String(user.directCount ?? 0n)}
          color="text-purple-300"
        />

        <StatBox
          title="Team"
          value={String(user.teamCount ?? 0n)}
          color="text-blue-300"
        />

        <StatBox
          title="Volume"
          value={`${formatToken(user.teamVolume)} NOVA`}
          color="text-green-300"
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/50">
        • Referral rewards come from your team's daily rewards.
      </div>
    </div>
  );
}

function StatBox({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
      <div className="text-xs text-white/50">{title}</div>
      <div className={cn("mt-2 text-lg font-bold", color)}>{value}</div>
    </div>
  );
}