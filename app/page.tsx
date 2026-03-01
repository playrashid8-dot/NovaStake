"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Rocket, Lock, TrendingUp, Users, Shield, Wallet } from "lucide-react";

export default function Home() {
  const router = useRouter();
const { status } = useAccount();

useEffect(() => {
  if (status === "disconnected") {
    router.replace("/");
  }
}, [status, router]);

  // ✅ Auto redirect when connected
  useEffect(() => {
    if (status === "connected") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen relative text-white overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#1a1a3c] to-[#24243e]">

      {/* HERO */}
      <div className="text-center mt-32 px-6">
        <Rocket size={60} className="mx-auto mb-6 text-purple-400" />

        <h1 className="text-5xl font-bold leading-tight">
          NovaDeFi – Next-Gen <br /> On-Chain Income Platform
        </h1>

        <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
          Earn daily USDT rewards with level-based ROI,
          team income, salary system and fully on-chain security.
        </p>

        <p className="mt-8 text-green-400 text-sm">
          Connect your wallet to continue
        </p>
      </div>

      {/* FEATURES */}
      <div className="mt-24 grid md:grid-cols-3 gap-8 px-10 text-center">
        {[
          { icon: Lock, text: "6-Day Smart Lock System" },
          { icon: TrendingUp, text: "Level-Based Daily ROI" },
          { icon: Users, text: "3-Level Team Income" },
          { icon: Wallet, text: "Optional Fixed Staking" },
          { icon: Shield, text: "Fully On-Chain Logic" },
        ].map((item, i) => (
          <div
            key={i}
            className="p-6 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 hover:scale-105 transition duration-300"
          >
            <item.icon className="mx-auto mb-4 text-green-400" size={30} />
            <p className="font-semibold">{item.text}</p>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="text-center py-10 mt-24 border-t border-white/10 text-gray-400 text-sm">
        © 2026 NovaDeFi. All rights reserved.
      </div>
    </div>
  );
}