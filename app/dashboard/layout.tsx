"use client";

import { ReactNode } from "react";
import Navbar from "../components/Navbar";
import Link from "next/link";
import { LayoutDashboard, Wallet, Users, Trophy } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-black via-gray-900 to-black text-white">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6 hidden md:block">
        <h1 className="text-2xl font-bold mb-8 text-green-400">
          NovaDeFi
        </h1>

        <nav className="space-y-4">
          <Link href="/dashboard" className="flex items-center gap-3 hover:text-green-400 transition">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link href="/dashboard?tab=deposit" className="flex items-center gap-3 hover:text-green-400 transition">
            <Wallet size={18} />
            Deposit
          </Link>

          <Link href="/dashboard?tab=team" className="flex items-center gap-3 hover:text-green-400 transition">
            <Users size={18} />
            Team
          </Link>

          <Link href="/dashboard?tab=staking" className="flex items-center gap-3 hover:text-green-400 transition">
            <Trophy size={18} />
            Staking
          </Link>
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}