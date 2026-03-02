"use client";

import { useRouter } from "next/navigation";
import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";
import { bsc } from "wagmi/chains";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();

  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  /* ================= CONNECT ================= */
  const handleConnect = async () => {
    try {
      const metaMask = connectors.find(
        (c) => c.name === "MetaMask"
      );

      if (!metaMask) return alert("MetaMask not found");

      connect({ connector: metaMask });
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= DISCONNECT ================= */
  const handleDisconnect = () => {
    disconnect();
    router.push("/");
  };

  /* ================= NETWORK WARNING ================= */
  const wrongNetwork = isConnected && chainId !== bsc.id;

  return (
    <div className="w-full flex justify-between items-center px-6 py-4 border-b border-white/10 backdrop-blur-xl bg-black/40 sticky top-0 z-50">

      {/* LOGO */}
      <h1
        onClick={() => router.push("/")}
        className="text-xl font-bold cursor-pointer bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"
      >
        NovaDeFi
      </h1>

      {/* NETWORK WARNING */}
      {wrongNetwork && (
        <div className="absolute top-full left-0 w-full bg-red-600 text-white text-center py-2 text-sm">
          ⚠ Please switch to BNB Smart Chain
        </div>
      )}

      {/* RIGHT SIDE */}
      {isConnected ? (
        <div className="flex items-center gap-4">
          <span className="text-sm bg-white/10 px-4 py-2 rounded-lg">
            {address?.slice(0, 6)}...
            {address?.slice(-4)}
          </span>

          <button
            onClick={handleDisconnect}
            className="px-4 py-2 rounded-lg bg-red-500 hover:opacity-90 transition"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isPending}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-black font-semibold hover:opacity-90 transition"
        >
          {isPending ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </div>
  );
}