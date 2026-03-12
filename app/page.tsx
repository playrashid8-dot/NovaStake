"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useAccount,
  useConnect,
  useDisconnect,
} from "wagmi";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Coins,
  Crown,
  Gift,
  Home,
  Layers3,
  Lock,
  Menu,
  Rocket,
  Repeat,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

function shortAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function NovaLogo() {
  return (
    <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 shadow-[0_0_28px_rgba(251,191,36,0.18)]">
      <div className="absolute inset-1 rounded-full border border-amber-300/20" />
      <div className="text-3xl font-black text-amber-400">✦</div>
    </div>
  );
}

function BottomNavItem({
  href,
  label,
  icon,
  active = false,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 transition ${
        active ? "text-amber-400" : "text-zinc-400 hover:text-white"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full ${
          active ? "bg-amber-400/15" : "bg-transparent"
        }`}
      >
        {icon}
      </div>
      <span className="text-[11px] font-medium leading-none">{label}</span>
    </Link>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_30px_rgba(0,0,0,0.28)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_28%)]" />
      <div className="relative">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-400">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-zinc-300">{description}</p>
      </div>
    </div>
  );
}

function PlanPreview({
  title,
  duration,
  roi,
  accent,
}: {
  title: string;
  duration: string;
  roi: string;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.04] p-4">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-lg font-bold text-white">{title}</h4>
          <p className="mt-1 text-sm text-zinc-400">{duration}</p>
        </div>
        <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-300">
          {roi}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const {
    connect,
    connectors,
    isPending: isConnectPending,
  } = useConnect();

  useEffect(() => {
    if (isConnected) {
      router.replace("/dashboard");
    }
  }, [isConnected, router]);

  const firstConnector = useMemo(() => {
    return connectors?.[0];
  }, [connectors]);

  function handleConnect() {
    if (!firstConnector) return;
    connect({ connector: firstConnector });
  }

  return (
    <main className="min-h-screen bg-[#05070f] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_20%),radial-gradient(circle_at_center,rgba(168,85,247,0.10),transparent_30%),radial-gradient(circle_at_bottom,rgba(245,158,11,0.08),transparent_22%),linear-gradient(180deg,#05070f_0%,#0b1020_100%)]" />
      <div className="fixed inset-0 -z-10 opacity-25 [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#05070f]/85 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <NovaLogo />
              <div>
                <h1 className="text-3xl font-black tracking-wide text-white md:text-4xl">
                  NOVA
                </h1>
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                  Premium Staking
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/"
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-zinc-200"
              >
                Home
              </Link>
              <Link
                href="/stake"
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-zinc-200"
              >
                Stake
              </Link>
              <Link
                href="/team"
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-zinc-200"
              >
                Team
              </Link>

              {isConnected ? (
                <>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-300"
                  >
                    <Wallet size={16} />
                    {shortAddress(address)}
                  </button>
                  <button
                    onClick={() => disconnect()}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-zinc-200"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={!firstConnector || isConnectPending}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#facc15] via-[#fbbf24] to-[#f59e0b] px-5 py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(251,191,36,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Wallet size={16} />
                  {isConnectPending ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>

            <button className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-zinc-200 md:hidden">
              <Menu size={22} />
            </button>
          </div>
        </header>

        {/* Hero */}
        <section className="px-4 pb-6 pt-5 md:px-6 md:pb-10 md:pt-8 lg:px-8">
          <div className="relative overflow-hidden rounded-[34px] border border-amber-400/15 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.11),transparent_25%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 shadow-[0_0_50px_rgba(0,0,0,0.35)] md:p-10">
            <div className="pointer-events-none absolute -right-10 top-0 h-36 w-36 rounded-full bg-amber-400/10 blur-3xl md:h-52 md:w-52" />
            <div className="pointer-events-none absolute left-1/2 top-0 h-px w-52 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

            <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-[11px] font-semibold text-green-300 md:text-xs">
              <Crown size={14} />
              VIP Advanced DeFi Platform
            </div>

            <div className="mt-5 max-w-4xl">
              <h2 className="text-4xl font-black leading-none tracking-tight md:text-6xl lg:text-7xl">
                <span className="bg-gradient-to-r from-[#ffe4ad] via-[#f7c35b] to-[#e7a12a] bg-clip-text text-transparent">
                  NovaStake
                </span>
              </h2>

              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-200 md:text-xl">
                A premium staking ecosystem designed for serious users who want
                clean UI, structured earning plans, advanced referral growth,
                and a modern BNB Chain DeFi experience.
              </p>

              <div className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-300">
                <Sparkles size={16} />
                Invest Smart • Earn Smart • Grow Smart
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap">
              {isConnected ? (
                <>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="inline-flex items-center justify-center gap-3 rounded-[22px] bg-gradient-to-r from-[#facc15] via-[#fbbf24] to-[#f59e0b] px-6 py-4 text-base font-bold text-black shadow-[0_0_25px_rgba(251,191,36,0.28)] transition hover:scale-[1.01]"
                  >
                    <ArrowRight size={20} />
                    Go to Dashboard
                  </button>

                  <button
                    onClick={() => disconnect()}
                    className="inline-flex items-center justify-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] px-6 py-4 text-base font-semibold text-white"
                  >
                    Disconnect Wallet
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleConnect}
                    disabled={!firstConnector || isConnectPending}
                    className="inline-flex items-center justify-center gap-3 rounded-[22px] bg-gradient-to-r from-[#facc15] via-[#fbbf24] to-[#f59e0b] px-6 py-4 text-base font-bold text-black shadow-[0_0_25px_rgba(251,191,36,0.28)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Wallet size={20} />
                    {isConnectPending ? "Connecting..." : "Connect Wallet"}
                  </button>

                  <Link
                    href="/stake"
                    className="inline-flex items-center justify-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] px-6 py-4 text-base font-semibold text-white"
                  >
                    Explore Plans
                    <ChevronRight size={18} />
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Main VIP Info Layout */}
        <section className="px-4 pb-6 md:px-6 lg:px-8">
          <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
              <InfoCard
                icon={<Coins size={26} />}
                title="Premium Staking Experience"
                description="NovaStake offers a polished high-end staking interface where users can choose premium locking plans with strong fixed-return structures and smooth transaction flow."
              />
              <InfoCard
                icon={<Users size={26} />}
                title="Team-Based Growth Model"
                description="The platform includes a powerful referral-driven network design that supports community expansion, deeper engagement, and multi-level earning opportunities."
              />
              <InfoCard
                icon={<ShieldCheck size={26} />}
                title="Secure & Transparent Logic"
                description="Built around on-chain smart contract execution on BNB Chain, NovaStake is designed to provide clarity, trust, and direct visibility into staking and claim actions."
              />
            </div>

            <div className="space-y-5">
              <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_40px_rgba(0,0,0,0.28)] md:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-400">
                    <Layers3 size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">
                      Project Vision
                    </h3>
                    <p className="text-sm text-zinc-400">
                      Built for premium presentation and long-term growth
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm leading-7 text-zinc-300">
                  <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                    NovaStake is designed as a clean, advanced, and visually
                    premium DeFi product focused on staking simplicity,
                    credibility, and user retention.
                  </div>
                  <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                    The homepage is intentionally built around project
                    positioning, trust, and investor confidence rather than
                    generic dashboard stats.
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-amber-400/12 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.08),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(0,0,0,0.08))] p-5 shadow-[0_0_40px_rgba(0,0,0,0.28)] md:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-400">
                    <Rocket size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">
                      Staking Plans
                    </h3>
                    <p className="text-sm text-zinc-400">
                      Preview of premium NOVA plans
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <PlanPreview
                    title="Starter"
                    duration="7 Days"
                    roi="7%"
                    accent="from-amber-400 to-yellow-500"
                  />
                  <PlanPreview
                    title="Boost"
                    duration="30 Days"
                    roi="45%"
                    accent="from-cyan-400 to-sky-500"
                  />
                  <PlanPreview
                    title="Pro"
                    duration="90 Days"
                    roi="160%"
                    accent="from-fuchsia-400 to-violet-500"
                  />
                  <PlanPreview
                    title="VIP"
                    duration="180 Days"
                    roi="400%"
                    accent="from-orange-400 to-amber-500"
                  />
                  <PlanPreview
                    title="Elite"
                    duration="360 Days"
                    roi="900%"
                    accent="from-emerald-400 to-teal-500"
                  />
                </div>

                <div className="mt-5">
                  <Link
                    href="/stake"
                    className="inline-flex w-full items-center justify-center gap-3 rounded-[22px] bg-gradient-to-r from-[#facc15] via-[#fbbf24] to-[#f59e0b] px-5 py-4 text-base font-bold text-black shadow-[0_0_24px_rgba(251,191,36,0.26)]"
                  >
                    Open Staking
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security + Referral */}
        <section className="px-4 pb-6 md:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_40px_rgba(0,0,0,0.28)]">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/10 text-green-300">
                  <BadgeCheck size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">
                    User Confidence
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Trust-first premium homepage
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-[20px] border border-white/8 bg-black/20 p-4 text-sm leading-7 text-zinc-300">
                  Clean wallet onboarding, polished visuals, responsive layout,
                  and structured staking flow are designed to improve user trust
                  from the first screen.
                </div>
                <div className="rounded-[20px] border border-white/8 bg-black/20 p-4 text-sm leading-7 text-zinc-300">
                  The focus is not on noisy data blocks, but on quality
                  positioning, clarity, and premium DeFi presentation.
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_40px_rgba(0,0,0,0.28)]">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-400">
                  <Gift size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">
                    Referral Ecosystem
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Community-driven growth structure
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm leading-7 text-zinc-300">
                <div className="rounded-[20px] border border-white/8 bg-black/20 p-4">
                  Invite users, grow your structure, and unlock stronger
                  network-based earning mechanics with NovaStake.
                </div>
                <div className="rounded-[20px] border border-white/8 bg-black/20 p-4">
                  Designed for both solo stakers and team builders who want a
                  stronger DeFi business-style experience.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-28 md:px-6 lg:px-8">
          <div className="rounded-[34px] border border-amber-400/15 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.10),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(0,0,0,0.08))] p-6 text-center shadow-[0_0_50px_rgba(0,0,0,0.35)] md:p-10">
            <h3 className="text-3xl font-black text-white md:text-4xl">
              Enter the NovaStake Ecosystem
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-zinc-300 md:text-base">
              Premium staking interface, advanced project positioning, smart
              reward structure, and a polished user journey — all built for a
              stronger Web3 brand presence.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {isConnected ? (
                <button
                  onClick={() => router.push("/dashboard")}
                  className="inline-flex items-center justify-center gap-3 rounded-[22px] bg-gradient-to-r from-[#facc15] via-[#fbbf24] to-[#f59e0b] px-6 py-4 text-base font-bold text-black shadow-[0_0_24px_rgba(251,191,36,0.26)]"
                >
                  Open Dashboard
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={!firstConnector || isConnectPending}
                  className="inline-flex items-center justify-center gap-3 rounded-[22px] bg-gradient-to-r from-[#facc15] via-[#fbbf24] to-[#f59e0b] px-6 py-4 text-base font-bold text-black shadow-[0_0_24px_rgba(251,191,36,0.26)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Wallet size={18} />
                  {isConnectPending ? "Connecting..." : "Connect Wallet"}
                </button>
              )}

              <Link
                href="/stake"
                className="inline-flex items-center justify-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] px-6 py-4 text-base font-semibold text-white"
              >
                View Plans
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* Mobile Bottom Nav */}
        <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-7xl -translate-x-1/2 border-t border-white/10 bg-[#05070f]/95 px-3 pb-4 pt-2 backdrop-blur-xl md:hidden">
          <div className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-[26px] border border-white/10 bg-white/[0.03] p-2">
            <BottomNavItem
              href="/"
              label="Home"
              active
              icon={<Home size={20} />}
            />
            <BottomNavItem
              href="/swap"
              label="Swap"
              icon={<Repeat size={20} />}
            />
            <BottomNavItem
              href="/team"
              label="Team"
              icon={<Users size={20} />}
            />
            <BottomNavItem
              href="/stake"
              label="Stake"
              icon={<Coins size={20} />}
            />
            <BottomNavItem
              href="/claim"
              label="Claim"
              icon={<Gift size={20} />}
            />
          </div>
        </nav>
      </div>
    </main>
  );
}