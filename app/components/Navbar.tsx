"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { ensureMainnet } from "@/lib/web3";

export default function Navbar() {
  const [account, setAccount] = useState<string | null>(null);
  const router = useRouter();

  // 🔍 Auto Detect Wallet (Safe Version)
  useEffect(() => {
    async function loadWallet() {
      if (!(window as any).ethereum) return;

      const disconnected = localStorage.getItem("nova_disconnected");
      if (disconnected === "true") return;

      const provider = new ethers.providers.Web3Provider(
        (window as any).ethereum
      );

      const accounts = await provider.listAccounts();

      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    }

    loadWallet();
  }, []);

  // 🔌 Connect Wallet
  async function connectWallet() {
    try {
      if (!(window as any).ethereum) {
        alert("Install MetaMask");
        return;
      }

      await ensureMainnet();

      const provider = new ethers.providers.Web3Provider(
        (window as any).ethereum
      );

      const accounts = await provider.send("eth_requestAccounts", []);

      localStorage.removeItem("nova_disconnected");

      setAccount(accounts[0]);
      router.push("/dashboard");
    } catch (err) {
      alert("Connection failed");
    }
  }

  // 🔴 Disconnect Wallet
  function disconnectWallet() {
    localStorage.setItem("nova_disconnected", "true");
    setAccount(null);

    // full reload to clear state
    window.location.href = "/";
  }

  return (
    <div className="w-full flex justify-between items-center px-6 py-4 border-b border-white/10 backdrop-blur-xl bg-black/40">

      <h1
        onClick={() => router.push("/")}
        className="text-xl font-bold cursor-pointer bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"
      >
        NovaDeFi
      </h1>

      {account ? (
        <div className="flex items-center gap-4">
          <span className="text-sm bg-white/10 px-4 py-2 rounded-lg">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>

          <button
            onClick={disconnectWallet}
            className="px-4 py-2 rounded-lg bg-red-500 hover:opacity-90 transition"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-black font-semibold hover:opacity-90 transition"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}