"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "wagmi";
import {
  Copy,
  Check,
  Link as LinkIcon,
  BadgeDollarSign,
} from "lucide-react";

import { useNovaUser } from "@/lib/hooks/useNovaUser";
import { makeReferralCode } from "@/lib/referral";

function formatToken(value?: bigint | number | null, decimals = 18, max = 2) {
  if (value == null) return "0";
  const num =
    typeof value === "bigint"
      ? Number(value.toString()) / 10 ** decimals
      : Number(value);

  if (!Number.isFinite(num)) return "0";

  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: max,
  });
}

function cn(...a: (string | false | undefined)[]) {
  return a.filter(Boolean).join(" ");
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function shortAddress(addr?: string) {
  if (!addr || addr === ZERO_ADDRESS) return "None";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function TeamSection() {
  const { address, isConnected } = useAccount();
  const user = useNovaUser();

  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [refCode, setRefCode] = useState("");

  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!address) {
      setRefCode("");
      return;
    }

    setRefCode(makeReferralCode(address));
  }, [address]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const refLink = useMemo(() => {
    if (!origin || !address) return "";
    return `${origin}/?ref=${address}`;
  }, [origin, address]);

  async function copyLink() {
    if (!refLink) return;

    try {
      await navigator.clipboard.writeText(refLink);
      setCopied(true);

      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }

      copyTimerRef.current = setTimeout(() => {
        setCopied(false);
      }, 1200);
    } catch {
      setCopied(false);
    }
  }

  const referrer = shortAddress(user.summary?.referrer);

  const direct = Number(user.directCount ?? 0n);
  const team = Number(user.teamCount ?? 0n);
  const teamVolume = user.teamVolume ?? 0n;
  const activeStake = user.activeStake ?? user.activePrincipal ?? 0n;
  const rewardBalance = user.rewardBalance ?? 0n;

  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80">
        Connect wallet to view your team data
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-purple-300">
              Team System
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Track your referrals and share your invite link.
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/30 bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-200">
            5 Levels
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <MiniBox
            title="Direct"
            value={String(direct)}
            valueClass="text-green-300"
          />
          <MiniBox
            title="Team"
            value={String(team)}
            valueClass="text-yellow-300"
          />
          <MiniBox
            title="Volume"
            value={`${formatToken(teamVolume)} NOVA`}
            valueClass="text-blue-300"
          />
          <MiniBox
            title="Active Stake"
            value={`${formatToken(activeStake)} NOVA`}
            valueClass="text-pink-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <SimpleCard
          icon={<LinkIcon size={16} />}
          title="Your Referrer"
          value={referrer}
          iconClass="text-blue-300"
          valueClass="text-white"
        />

        <SimpleCard
          icon={<BadgeDollarSign size={16} />}
          title="Reward Balance"
          value={`${formatToken(rewardBalance)} NOVA`}
          iconClass="text-green-300"
          valueClass="text-green-300"
        />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Referral Link</div>
            <div className="mt-1 text-xs text-white/50">
              Share this link to grow your direct team.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-white/70">
            Code: <b className="text-white">{refCode || "—"}</b>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <input
            value={refLink || "Loading link..."}
            readOnly
            className="w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-white outline-none"
          />

          <button
            type="button"
            onClick={copyLink}
            disabled={!refLink}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-400 to-pink-500 px-4 py-3 font-semibold text-black transition disabled:opacity-50"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy Link"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniBox({
  title,
  value,
  valueClass,
}: {
  title: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs text-white/45">{title}</div>
      <div className={cn("mt-2 text-lg font-bold", valueClass || "text-white")}>
        {value}
      </div>
    </div>
  );
}

function SimpleCard({
  icon,
  title,
  value,
  iconClass,
  valueClass,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  iconClass?: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "rounded-xl border border-white/10 bg-black/30 p-2",
            iconClass
          )}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <div className="text-xs text-white/50">{title}</div>
          <div
            className={cn(
              "mt-1 truncate text-base font-bold",
              valueClass || "text-white"
            )}
          >
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}