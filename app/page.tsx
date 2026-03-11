"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import {
  BadgeCheck,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  Lock,
  ShieldCheck,
  Users,
  Wallet,
  Send,
  MessageCircle,
  Crown,
  Database,
  Ban,
  Coins,
  Network,
} from "lucide-react";

import Navbar from "@/app/components/Navbar";

const CONTRACT_ADDRESS = "0xCE61f3E878a4AB55b127092978dFF6C89a37671d";
const RENOUNCE_TX =
  "0xe379072ecc3d307e538fa8c148a98580ba18be7aac0ad97f988e8320a83c1720";

const shortAddress = (value: string) =>
  `${value.slice(0, 10)}...${value.slice(-8)}`;

const stakingPlans = [
  { name: "Basic", duration: "7 Days", totalReturn: "6%" },
  { name: "Silver", duration: "15 Days", totalReturn: "15%" },
  { name: "Gold", duration: "30 Days", totalReturn: "32%" },
  { name: "VIP", duration: "60 Days", totalReturn: "70%" },
  { name: "Diamond", duration: "90 Days", totalReturn: "120%" },
  { name: "Elite", duration: "180 Days", totalReturn: "250%" },
];

const salaryStages = [
  { stage: "Stage 1", direct: "5 Direct", team: "15 Team", reward: "30 USDT" },
  { stage: "Stage 2", direct: "10 Direct", team: "35 Team", reward: "80 USDT" },
  { stage: "Stage 3", direct: "25 Direct", team: "100 Team", reward: "250 USDT" },
  { stage: "Stage 4", direct: "45 Direct", team: "150 Team", reward: "500 USDT" },
];

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-xl md:rounded-[30px] ${className}`}
    >
      {children}
    </div>
  );
}

function TrustBadge({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="rounded-[20px] border border-amber-500/20 bg-black/30 p-4 text-center shadow-[0_0_20px_rgba(245,158,11,0.08)] md:rounded-[24px] md:p-5">
      <div className="flex justify-center">{icon}</div>
      <div className="mt-3 whitespace-pre-line text-sm font-semibold leading-tight text-white md:mt-4 md:text-[1.2rem] xl:text-[1.35rem]">
        {title}
      </div>
    </div>
  );
}

function SecurityMiniCard({
  title,
  icon,
  colorClasses,
}: {
  title: string;
  icon: React.ReactNode;
  colorClasses: string;
}) {
  return (
    <div
      className={`rounded-[18px] border p-4 text-center shadow-[0_0_20px_rgba(0,0,0,0.22)] md:rounded-[20px] ${colorClasses}`}
    >
      <div className="flex justify-center">{icon}</div>
      <div className="mt-3 whitespace-pre-line text-sm font-semibold leading-tight text-white md:text-base">
        {title}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.replace("/dashboard");
    }
  }, [isConnected, router]);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_18%),radial-gradient(circle_at_top_right,rgba(234,179,8,0.10),transparent_18%),radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_30%),radial-gradient(circle_at_bottom,rgba(245,158,11,0.08),transparent_24%)]" />

      <section className="mx-auto max-w-7xl px-3 pb-6 pt-4 md:px-6 md:pt-8">
        <SectionCard className="overflow-hidden p-3 md:p-6">
          <div className="grid gap-4 md:gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="relative overflow-hidden rounded-[22px] border border-white/8 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.1))] p-4 md:rounded-[28px] md:p-8">
              <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-amber-400/10 blur-3xl md:right-10 md:top-10 md:h-40 md:w-40" />

              <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-2 text-[11px] font-semibold text-green-300 sm:px-4 sm:text-xs">
                <Crown size={13} />
                VIP Advanced Staking Platform
              </div>

              <h1 className="mt-4 text-4xl font-black leading-none md:mt-5 md:text-7xl">
                <span className="bg-gradient-to-r from-[#ffd27a] via-[#f7b94a] to-[#e9a22f] bg-clip-text text-transparent">
                  NovaDeFi
                </span>
              </h1>

              <p className="mt-4 text-[17px] font-medium leading-snug text-zinc-100 md:text-[2rem]">
                Invest Smart <span className="text-amber-400">•</span> Earn Smart{" "}
                <span className="text-amber-400">•</span> Grow Smart
              </p>

              <div className="mt-5 inline-flex flex-wrap items-center gap-2 text-sm leading-6 text-zinc-200 md:mt-6 md:gap-3 md:text-lg">
                <ShieldCheck className="h-5 w-5 text-amber-400" />
                Powered by a{" "}
                <span className="font-semibold text-amber-400">
                  Verified Smart Contract
                </span>{" "}
                ON BNB Chain
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2 sm:gap-3 md:mt-8 md:flex md:flex-wrap">
                

                <a
                  href="https://t.me/NovaDeFiNetwork"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-[#14f195] to-[#2f80ed] px-4 py-3 text-xs font-semibold text-black sm:text-sm md:rounded-[22px] md:px-6 md:text-base"
                >
                  <Send className="h-4 w-4" />
                  Telegram
                </a>

                <a
                  href="https://whatsapp.com/channel/0029Vb7sgiFLI8YfYhcrLd3l"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-[#22c55e] to-[#14f195] px-4 py-3 text-xs font-semibold text-black sm:text-sm md:rounded-[22px] md:px-6 md:text-base"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-[11px] text-white/55 md:mt-8 md:gap-3 md:text-sm">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 md:px-4">
                  USDT staking plans
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 md:px-4">
                  Team income up to 5 levels
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 md:px-4">
                  Salary milestone rewards
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[22px] border border-amber-500/20 bg-[radial-gradient(circle_at_right,rgba(245,158,11,0.20),transparent_25%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(0,0,0,0.2))] p-4 md:rounded-[28px] md:p-8">
              <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-amber-500/10 to-transparent" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black leading-tight md:text-5xl">
                    Security <span className="text-amber-400">&</span> Transparency
                  </h2>
                  <p className="mt-3 text-base text-zinc-200 md:mt-4 md:text-2xl">
                    100% On-Chain Proof <span className="text-amber-400">•</span>{" "}
                    No Owner Control
                  </p>
                </div>

                <div className="hidden rounded-full border border-amber-500/20 bg-amber-500/10 p-4 lg:block">
                  <Globe className="h-10 w-10 text-amber-300" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 md:mt-8 md:gap-4 xl:grid-cols-4">
                <SecurityMiniCard
                  title={"Ownership\nRenounced"}
                  icon={<CheckCircle2 className="h-7 w-7 text-green-400 md:h-9 md:w-9" />}
                  colorClasses="border-green-500/30 bg-gradient-to-b from-green-500/20 to-green-900/20"
                />
                <SecurityMiniCard
                  title={"Verified\nContract"}
                  icon={<BadgeCheck className="h-7 w-7 text-sky-400 md:h-9 md:w-9" />}
                  colorClasses="border-sky-500/30 bg-gradient-to-b from-sky-500/20 to-blue-900/20"
                />
                <SecurityMiniCard
                  title={"BNB\nChain"}
                  icon={<Coins className="h-7 w-7 text-amber-400 md:h-9 md:w-9" />}
                  colorClasses="border-amber-500/30 bg-gradient-to-b from-amber-500/20 to-yellow-900/20"
                />
                <SecurityMiniCard
                  title={"Admin\nDisabled"}
                  icon={<Lock className="h-7 w-7 text-red-400 md:h-9 md:w-9" />}
                  colorClasses="border-red-500/25 bg-gradient-to-b from-red-500/15 to-red-950/20"
                />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard className="mt-6 p-4 md:p-5">
          <div className="grid gap-4 lg:grid-cols-4 lg:divide-x lg:divide-white/10">
            <div className="px-2 py-2 md:px-5 md:py-3">
              <div className="text-base text-zinc-300 md:text-xl">Smart Contract Address</div>
              <div className="mt-3 rounded-[18px] border border-amber-500/25 bg-black/40 px-4 py-4 text-base font-semibold text-zinc-100 md:text-2xl">
                {shortAddress(CONTRACT_ADDRESS)}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(CONTRACT_ADDRESS)}
                  className="inline-flex items-center gap-2 rounded-[18px] bg-gradient-to-r from-[#f0c15a] to-[#d89e39] px-4 py-3 text-sm font-semibold text-black md:text-xl"
                >
                  <Copy className="h-5 w-5" /> Copy
                </button>
                <a
                  href={`https://bscscan.com/address/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-100 md:text-xl"
                >
                  View on BscScan
                </a>
              </div>
            </div>

            <div className="px-2 py-2 md:px-5 md:py-3">
              <div className="text-base text-zinc-300 md:text-xl">Ownership Status</div>
              <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-3 text-lg font-black text-green-400 md:mt-7 md:px-6 md:py-4 md:text-[1.9rem]">
                <CheckCircle2 className="h-6 w-6 md:h-7 md:w-7" /> RENOUNCED
              </div>
            </div>

            <div className="px-2 py-2 md:px-5 md:py-3">
  <div className="text-base text-zinc-300 md:text-xl">Owner Privte Key</div>

  <div className="mt-3 rounded-[18px] border border-red-500/20 bg-red-500/5 px-4 py-4 text-lg font-black text-red-400 md:text-[2rem]">
    a0283ef425982...00fdcf04a561d4
  </div>

  <div className="mt-4 flex flex-wrap gap-3">
    <button
      type="button"
      onClick={() =>
        navigator.clipboard.writeText(
          "a0283ef425982dd0025fd1f00e1beae52b80dd41be89ebc0bf00fdcf04a561d4"
        )
      }
      className="inline-flex items-center gap-2 rounded-[18px] bg-gradient-to-r from-[#f0c15a] to-[#d89e39] px-4 py-3 text-sm font-semibold text-black md:text-xl"
    >
      <Copy className="h-5 w-5" />
      Copy
    </button>
  </div>
</div>

            <div className="px-2 py-2 md:px-5 md:py-3">
              <div className="text-base text-zinc-300 md:text-xl">Renounce Transaction</div>
              <div className="mt-5 rounded-[18px] border border-white/10 bg-black/40 px-4 py-4 text-base font-semibold text-zinc-100 md:mt-6 md:text-2xl">
                {shortAddress(RENOUNCE_TX)}
              </div>
              <div className="mt-4 flex gap-3">
                <a
                  href={`https://bscscan.com/tx/${RENOUNCE_TX}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-[18px] border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-amber-300 md:text-xl"
                >
                  View TX <ExternalLink className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </SectionCard>

        <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-5">
          <TrustBadge
            icon={<Network className="h-8 w-8 text-amber-400 md:h-10 md:w-10" />}
            title={"No Upgradeable\nCode"}
          />
          <TrustBadge
            icon={<Ban className="h-8 w-8 text-amber-400 md:h-10 md:w-10" />}
            title={"No Pause\nMechanism"}
          />
          <TrustBadge
            icon={<Wallet className="h-8 w-8 text-amber-400 md:h-10 md:w-10" />}
            title={"Transparent\nTreasury"}
          />
          
          <TrustBadge
            icon={<Users className="h-8 w-8 text-amber-400 md:h-10 md:w-10" />}
            title={"100%\nDecentralized"}
          />
        </section>

        <section id="earning-system" className="mt-6">
          <SectionCard className="p-4 md:p-8">
            <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="text-2xl font-black text-amber-400 md:text-5xl">
                  NovaDeFi Earning System
                </div>
                <div className="mt-3 text-base text-zinc-200 md:text-2xl">
                  100% On-Chain Proof <span className="text-amber-400">•</span>{" "}
                  No Owner Control
                </div>

                <div className="mt-5 rounded-[22px] border border-amber-500/20 bg-black/30 p-4 md:mt-8 md:rounded-[28px] md:p-5">
                  <div className="flex items-center gap-3 text-lg font-bold text-amber-300 md:text-2xl">
                    <ShieldCheck className="h-5 w-5 md:h-7 md:w-7" />
                    Smart Contract Staking
                  </div>

                  <div className="mt-4 overflow-hidden rounded-[18px] border border-white/10 md:mt-5 md:rounded-[24px]">
                    <div className="grid grid-cols-4 border-b border-white/10 bg-white/5 px-3 py-3 text-[11px] font-semibold text-zinc-300 md:px-5 md:py-4 md:text-lg">
                      <div>Plan</div>
                      <div>Duration</div>
                      <div>Total</div>
                      <div className="text-right">View</div>
                    </div>

                    {stakingPlans.map((plan, idx) => (
                      <div
                        key={plan.name}
                        className={`grid grid-cols-4 items-center px-3 py-3 md:px-5 md:py-4 ${
                          idx !== stakingPlans.length - 1
                            ? "border-b border-white/10"
                            : ""
                        }`}
                      >
                        <div className="text-sm font-bold text-amber-300 md:text-2xl">
                          {plan.name}
                        </div>
                        <div className="text-xs text-zinc-200 md:text-xl">
                          {plan.duration}
                        </div>
                        <div className="text-sm font-black text-amber-400 md:text-2xl">
                          {plan.totalReturn}
                        </div>
                        <div className="flex justify-end text-green-400">
                          <Check className="h-4 w-4 md:h-8 md:w-8" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="rounded-[22px] border border-amber-500/20 bg-black/30 p-4 shadow-[0_0_25px_rgba(245,158,11,0.08)] md:rounded-[28px] md:p-5">
                  <div className="flex items-center gap-2 text-lg font-bold text-amber-300 md:text-xl">
                    <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />
                    Smart Contract Staking
                  </div>

                  <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-300 md:text-base">
                    <li>• Stake USDT directly through smart contract</li>
                    <li>• Rewards auto-calculated on-chain</li>
                    <li>• Principal returned after plan duration</li>
                    <li>• Transparent staking records</li>
                  </ul>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                      <div className="text-[11px] text-zinc-400 md:text-xs">Network</div>
                      <div className="mt-1 text-sm font-bold text-white md:text-base">
                        BNB Mainnet
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                      <div className="text-[11px] text-zinc-400 md:text-xs">Control</div>
                      <div className="mt-1 text-sm font-bold text-green-400 md:text-base">
                        No Admin
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </section>

        <section className="mt-6">
          <SectionCard className="overflow-hidden p-4 md:p-8">
            <div className="grid items-center gap-5 lg:grid-cols-[1fr_0.95fr]">
              <div>
                <div className="text-2xl font-black text-amber-400 md:text-5xl">
                  Multi-Level Team Rewards
                </div>
                <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300 md:text-2xl">
                  Team income distributed automatically by smart contract based on
                  staking activity.
                </p>
              </div>

              <div className="rounded-[22px] border border-amber-500/20 bg-black/30 p-4 md:rounded-[28px] md:p-6">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center md:p-4">
                    <div className="text-xs text-zinc-400 md:text-sm">Level 1</div>
                    <div className="mt-2 text-xl font-black text-green-400 md:text-2xl">10%</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center md:p-4">
                    <div className="text-xs text-zinc-400 md:text-sm">Level 2</div>
                    <div className="mt-2 text-xl font-black text-sky-400 md:text-2xl">7%</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center md:p-4">
                    <div className="text-xs text-zinc-400 md:text-sm">Level 3</div>
                    <div className="mt-2 text-xl font-black text-purple-400 md:text-2xl">5%</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center md:p-4">
                    <div className="text-xs text-zinc-400 md:text-sm">Level 4</div>
                    <div className="mt-2 text-xl font-black text-pink-400 md:text-2xl">4%</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center md:p-4">
                    <div className="text-xs text-zinc-400 md:text-sm">Level 5</div>
                    <div className="mt-2 text-xl font-black text-amber-400 md:text-2xl">3%</div>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <SectionCard className="p-4 md:p-8">
            <div className="text-2xl font-black text-amber-400 md:text-5xl">
              Leadership Salary Rewards
            </div>

            <div className="mt-5 overflow-hidden rounded-[20px] border border-white/10 md:mt-6 md:rounded-[24px]">
              <div className="grid grid-cols-4 border-b border-white/10 bg-white/5 px-3 py-3 text-[11px] font-semibold text-zinc-300 md:px-5 md:py-4 md:text-lg">
                <div>Stage</div>
                <div>Direct</div>
                <div>Team</div>
                <div>Reward</div>
              </div>

              {salaryStages.map((item, idx) => (
                <div
                  key={item.stage}
                  className={`grid grid-cols-4 px-3 py-3 text-[11px] md:px-5 md:py-4 md:text-lg ${
                    idx !== salaryStages.length - 1 ? "border-b border-white/10" : ""
                  }`}
                >
                  <div className="font-bold text-amber-300">{item.stage}</div>
                  <div className="text-zinc-200">{item.direct}</div>
                  <div className="text-zinc-200">{item.team}</div>
                  <div className="font-semibold text-green-400">{item.reward}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard className="p-4 md:p-8">
            <div className="text-2xl font-black text-amber-400 md:text-5xl">
              First Stake Bonus
            </div>

            <p className="mt-4 text-base leading-8 text-zinc-300 md:text-2xl">
              New users receive a{" "}
              <span className="font-bold text-green-400">5% USDT Bonus</span> on
              their first stake.
            </p>

            <div className="mt-5 space-y-3 md:mt-6 md:space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-200 md:text-lg">
                • Instant reward credit after first successful stake
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-200 md:text-lg">
                • Bonus tracked transparently on-chain
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-200 md:text-lg">
                • Claimable anytime from rewards section
              </div>
            </div>
          </SectionCard>
        </section>
      </section>
    </main>
  );
}