"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import {
  Crown,
  ShieldCheck,
  Sparkles,
  Wallet,
  Coins,
  Users,
  Layers3,
} from "lucide-react";

import WalletModal from "@/app/components/WalletModal";

function NovaLogo() {
  return (
    <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 shadow-[0_0_28px_rgba(251,191,36,0.18)]">
      <div className="absolute inset-1 rounded-full border border-amber-300/20" />
      <div className="text-3xl font-black text-amber-400">✦</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_30px_rgba(0,0,0,0.25)]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-400">
        {icon}
      </div>

      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-zinc-300">{description}</p>
    </div>
  );
}

function PlanCard({
  title,
  duration,
  roi,
}: {
  title: string;
  duration: string;
  roi: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-bold text-white">{title}</div>
          <div className="mt-1 text-sm text-zinc-400">{duration}</div>
        </div>

        <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-sm font-semibold text-amber-300">
          {roi}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [walletOpen, setWalletOpen] = useState(false);

  useEffect(() => {
    if (isConnected) {
      router.replace("/dashboard");
    }
  }, [isConnected, router]);

  return (
    <main className="min-h-screen bg-[#05070f] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_20%),radial-gradient(circle_at_center,rgba(168,85,247,0.08),transparent_30%),linear-gradient(180deg,#05070f_0%,#0b1020_100%)]" />
      <div className="fixed inset-0 -z-10 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 md:px-6 lg:px-8">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#05070f]/80 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <NovaLogo />
              <div>
                <h1 className="text-2xl font-black tracking-wide text-white md:text-3xl">
                  NovaStake
                </h1>
                <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">
                  Premium Staking
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setWalletOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#facc15] via-[#fbbf24] to-[#f59e0b] px-4 py-2.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(251,191,36,0.25)] transition hover:opacity-95"
            >
              <Wallet size={16} />
              Connect Wallet
            </button>
          </div>
        </header>

        {/* Hero */}
        <section className="flex-1 py-6 md:py-10">
          <div className="overflow-hidden rounded-[34px] border border-amber-400/15 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.10),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 shadow-[0_0_50px_rgba(0,0,0,0.35)] md:p-10">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs font-semibold text-amber-300">
                <Crown size={14} />
                VIP DeFi Experience
              </div>

              <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-6xl">
                <span className="bg-gradient-to-r from-[#ffe4ad] via-[#f7c35b] to-[#e7a12a] bg-clip-text text-transparent">
                  Smart staking for premium users
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-zinc-200 md:text-xl">
                NovaStake is built for clean staking, direct rewards, strong
                referral growth, and a premium BNB Chain experience with a
                modern dashboard.
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
                  <Sparkles size={13} />
                  Smart staking
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1 text-xs font-medium text-green-300">
                  <ShieldCheck size={13} />
                  Reward system
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => setWalletOpen(true)}
                  className="inline-flex items-center justify-center gap-3 rounded-[24px] bg-gradient-to-r from-[#facc15] via-[#fbbf24] to-[#f59e0b] px-8 py-4 text-base font-bold text-black shadow-[0_0_25px_rgba(251,191,36,0.28)] transition hover:scale-[1.01]"
                >
                  <Wallet size={20} />
                  Connect Wallet
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="pb-6 md:pb-8">
          <div className="grid gap-5 lg:grid-cols-3">
            <FeatureCard
              icon={<Coins size={22} />}
              title="Premium Staking"
              description="Choose structured NOVA plans with a polished interface and smooth wallet transaction flow."
            />

            <FeatureCard
              icon={<Users size={22} />}
              title="Team Growth"
              description="Build your network with referral-based expansion and a simple community-driven earning model."
            />

            <FeatureCard
              icon={<Layers3 size={22} />}
              title="VIP Dashboard"
              description="Track staking, rewards, team progress, salary, and presale access from one premium dashboard."
            />
          </div>
        </section>

        {/* Plans Preview */}
        <section className="pb-10 md:pb-14">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_40px_rgba(0,0,0,0.25)] md:p-6">
            <div className="mb-5 text-center">
              <h3 className="text-2xl font-black text-white">NOVA Plans</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Premium plan structure preview
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <PlanCard title="Starter" duration="7 Days" roi="7%" />
              <PlanCard title="Boost" duration="30 Days" roi="45%" />
              <PlanCard title="Pro" duration="90 Days" roi="160%" />
              <PlanCard title="VIP" duration="180 Days" roi="400%" />
              <PlanCard title="Elite" duration="360 Days" roi="900%" />
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setWalletOpen(true)}
                className="inline-flex items-center justify-center gap-3 rounded-[22px] border border-amber-400/20 bg-amber-400/10 px-6 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/15"
              >
                <Wallet size={18} />
                Connect Wallet to Continue
              </button>
            </div>
          </div>
        </section>
      </div>

      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </main>
  );
}