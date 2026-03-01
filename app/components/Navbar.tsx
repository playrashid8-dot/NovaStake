"use client";

import { useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { usePathname } from "next/navigation";
import { bsc } from "wagmi/chains";

export default function Navbar() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = chainId && chainId !== bsc.id;
  const [open, setOpen] = useState(false);

  return (
  <>
    {/* NAVBAR */}
    <div className="flex justify-between items-center px-6 py-4 bg-black/40 backdrop-blur border-b border-white/10 text-white relative z-10">
      
      <h1 className="text-xl font-bold">NovaDeFi</h1>

      {!isConnected ? (
        <button
          onClick={() => setOpen(true)}
          className="px-6 py-2 bg-green-500 rounded-lg hover:opacity-90 transition"
        >
          Connect Wallet
        </button>
      ) : (
        pathname.startsWith("/dashboard") && (
          <div className="flex items-center gap-4">
            {isWrongNetwork && (
              <button
                onClick={() => switchChain({ chainId: bsc.id })}
                className="px-4 py-2 bg-yellow-500 text-black rounded-lg text-sm"
              >
                Switch to BNB
              </button>
            )}

            <span className="text-green-400 text-sm">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>

            <button
              onClick={() => disconnect()}
              className="px-4 py-2 bg-red-500 rounded-lg text-sm"
            >
              Disconnect
            </button>
          </div>
        )
      )}
    </div>

    {/* 🔥 MODAL OUTSIDE NAVBAR */}
    {open && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-[#1a1a3c] p-6 rounded-2xl w-[320px] border border-white/10 shadow-2xl">

          <h2 className="text-lg font-semibold mb-4 text-center">
            Select Wallet
          </h2>

          <div className="space-y-3">
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => {
                  connect({ connector });
                  setOpen(false);
                }}
                className="w-full px-4 py-3 bg-green-600 rounded-lg hover:opacity-90 transition"
              >
                {connector.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => setOpen(false)}
            className="w-full mt-4 text-sm text-gray-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    )}
  </>
);
}