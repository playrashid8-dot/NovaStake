"use client";

import { useAccount, useDisconnect } from "wagmi";
import { LogOut, Wallet } from "lucide-react";

function short(addr?: string) {
  if (!addr) return "Not connected";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function DashboardHeader() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
      <div>
        <div className="text-xl font-bold text-white">
          NovaStake Dashboard
        </div>
        <div className="text-xs text-white/50">
          Manage staking, rewards, team and salary
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white">
          <Wallet size={15} className="text-green-300" />
          <span className="font-medium">
            {isConnected ? short(address) : "Not connected"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => disconnect()}
          className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/20 px-3 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/30"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </div>
  );
}