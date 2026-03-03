"use client";

import { useAccount, useDisconnect } from "wagmi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import WalletModal from "./WalletModal";

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <div className="w-full flex justify-between items-center px-6 py-4 border-b border-white/10 backdrop-blur-xl bg-black/40 sticky top-0 z-50">

        <h1
          onClick={() => router.push("/")}
          className="text-xl font-bold cursor-pointer bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"
        >
          NovaDeFi
        </h1>

        {isConnected ? (
          <div className="flex items-center gap-4">

            <span className="text-sm bg-white/10 px-4 py-2 rounded-lg">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>

            <button
              onClick={() => disconnect()}
              className="px-4 py-2 rounded-lg bg-red-500 hover:opacity-90 transition"
            >
              Disconnect
            </button>

          </div>
        ) : (
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-black font-semibold hover:opacity-90 transition"
          >
            Connect Wallet
          </button>
        )}
      </div>

      <WalletModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}