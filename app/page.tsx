"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { ensureMainnet } from "@/lib/web3";
import StatsGrid from "./components/StatsGrid";

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 🔥 Auto Detect Wallet
  useEffect(() => {
  async function checkWallet() {
    if (!(window as any).ethereum) return;

    // 🚫 Stop auto reconnect if manually disconnected
    const disconnected = localStorage.getItem("nova_disconnected");
    if (disconnected === "true") return;

    const provider = new ethers.providers.Web3Provider(
      (window as any).ethereum
    );

    const accounts = await provider.listAccounts();

    if (accounts.length > 0) {
      setAccount(accounts[0]);
      router.push("/dashboard");
    }
  }

  checkWallet();
}, [router])

  // 🔥 Connect Wallet
  async function connectWallet() {
    try {
      setLoading(true);

      if (!(window as any).ethereum) {
        alert("Install MetaMask");
        return;
      }

      await ensureMainnet();

      const provider = new ethers.providers.Web3Provider(
        (window as any).ethereum
      );

      await provider.send("eth_requestAccounts", []);

      const signer = provider.getSigner();
      const address = await signer.getAddress();

      setAccount(address);

      // Redirect after connect
      router.push("/dashboard");
    } catch (err) {
      console.log(err);
      alert("Connection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col justify-between">

      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center py-32 px-6">

        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          NovaDeFi
        </h1>

        <p className="text-gray-400 max-w-xl text-lg mb-10">
          Smart Hybrid Earning Ecosystem powered by BNB Chain.
          Deposit. Stake. Build Team. Earn Weekly Salary.
        </p>

        <button
          onClick={connectWallet}
          disabled={loading}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-green-400 to-blue-500 text-black font-semibold shadow-lg hover:opacity-90 transition"
        >
          {loading ? "Connecting..." : "Connect Wallet"}
        </button>

      </section>

      {/* FEATURES SECTION */}
      <section className="grid md:grid-cols-4 gap-6 px-6 pb-20">

        {[
          { title: "Deposit Engine", desc: "Earn daily ROI up to 2%" },
          { title: "Staking System", desc: "7 to 60 day lock plans" },
          { title: "Team Rewards", desc: "3-Level deposit commission" },
          { title: "Weekly Salary", desc: "Milestone unlock bonuses" },
        ].map((item, i) => (
          <div
            key={i}
            className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:scale-105 transition"
          >
            <h3 className="text-xl font-semibold mb-2">
              {item.title}
            </h3>
            <p className="text-gray-400 text-sm">
              {item.desc}
            </p>
          </div>
        ))}

      </section>

      {/* FOOTER */}
      <footer className="text-center text-gray-500 py-6 border-t border-white/10">
        NovaDeFi © 2026 | Powered by BNB Chain
      </footer>
    </div>
  );
}