"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Home, Wallet, Users, Lock } from "lucide-react";

export default function BottomNav() {
  const router = useRouter();
  const params = useSearchParams();
  const tab = params.get("tab");

  function goTo(tabName: string | null) {
    if (!tabName) {
      router.push("/dashboard");
    } else {
      router.push(`/dashboard?tab=${tabName}`);
    }
  }

  function itemStyle(active: boolean) {
    return `flex flex-col items-center text-xs ${
      active ? "text-green-400" : "text-gray-400"
    }`;
  }

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/10 flex justify-around py-3 md:hidden z-50">

      <button onClick={() => goTo(null)} className={itemStyle(!tab)}>
        <Home size={20} />
        Dashboard
      </button>

      <button onClick={() => goTo("deposit")} className={itemStyle(tab === "deposit")}>
        <Wallet size={20} />
        Deposit
      </button>

      <button onClick={() => goTo("team")} className={itemStyle(tab === "team")}>
        <Users size={20} />
        Team
      </button>

      <button onClick={() => goTo("staking")} className={itemStyle(tab === "staking")}>
        <Lock size={20} />
        Staking
      </button>

    </div>
  );
}