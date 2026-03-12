"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import { Wallet, LogOut, LayoutDashboard } from "lucide-react";

import WalletModal from "./WalletModal";
import { captureRefFromUrl } from "@/lib/referral";

function shortAddr(addr?: string) {
  if (!addr) return "Not connected";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const pathname = usePathname();

  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const shortAddress = useMemo(() => shortAddr(address), [address]);
  const isDashboardPage = pathname?.startsWith("/dashboard");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    captureRefFromUrl();
  }, [mounted]);

  function handleDisconnect() {
    disconnect();
    router.push("/");
  }

  if (!mounted) return null;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 md:px-6">
          <button
            type="button"
            onClick={() => router.push(isConnected ? "/dashboard" : "/")}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_20px_rgba(34,197,94,0.12)]">
              <Image
                src="/logo.png"
                alt="NovaStake Logo"
                width={44}
                height={44}
                className="h-full w-full object-cover"
                priority
              />
            </div>

            <div className="min-w-0 text-left">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-lg font-bold text-transparent">
                NovaStake
              </div>
              <div className="truncate text-[11px] text-white/40">
                Premium Dashboard
              </div>
            </div>
          </button>

          {isConnected ? (
            <div className="flex items-center gap-2 md:gap-3">
              {!isDashboardPage && (
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition hover:bg-white/10 sm:inline-flex"
                >
                  <LayoutDashboard size={15} className="text-blue-300" />
                  <span>Dashboard</span>
                </button>
              )}

              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-200 sm:px-4 sm:text-sm">
                <Wallet size={14} className="text-green-300" />
                <span>{shortAddress}</span>
              </div>

              <button
                type="button"
                onClick={handleDisconnect}
                className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600 sm:px-4"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="rounded-2xl bg-gradient-to-r from-green-400 to-blue-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-95 md:px-5"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      <WalletModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}