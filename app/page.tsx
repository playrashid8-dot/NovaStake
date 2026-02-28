"use client"

import { useRouter } from "next/navigation"
import { Rocket, Lock, TrendingUp, Users, Shield, Wallet } from "lucide-react"

export default function Home() {
  const router = useRouter()

  async function connectWallet() {
    if (!(window as any).ethereum) {
      alert("Install MetaMask")
      return
    }

    await (window as any).ethereum.request({
      method: "eth_requestAccounts",
    })

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen relative text-white overflow-hidden">

      {/* Background Galaxy */}
      <div className="absolute inset-0 bg-[url('/space.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative z-10">

        {/* NAVBAR */}
        <div className="flex justify-between items-center px-10 py-6">
          <h1 className="text-2xl font-bold">NovaDeFi</h1>
          <button
            onClick={connectWallet}
            className="px-6 py-2 rounded-lg border border-green-400 bg-green-500/20 hover:bg-green-500/40 transition"
          >
            Connect Wallet
          </button>
        </div>

        {/* HERO */}
        <div className="text-center mt-20 px-6">
          <Rocket size={60} className="mx-auto mb-6 text-purple-400" />
          <h1 className="text-5xl font-bold leading-tight">
            NovaDeFi – Next-Gen <br /> On-Chain Income System
          </h1>

          <p className="mt-6 text-lg text-gray-300">
            Start earning USDT rewards directly on blockchain with
            NovaDeFi’s secure income engine.
          </p>

          <button
            onClick={connectWallet}
            className="mt-10 px-10 py-4 rounded-xl bg-gradient-to-r from-green-400 to-blue-500 hover:scale-105 transition duration-300 shadow-lg shadow-green-500/30"
          >
            Connect Wallet
          </button>
        </div>

        {/* FEATURES */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 px-10 text-center">
          {[
            { icon: Lock, text: "6-8 Day Smart Lock" },
            { icon: TrendingUp, text: "Up to 2.1% Daily ROI" },
            { icon: Users, text: "3-Level Team Income" },
            { icon: Wallet, text: "Staking Engine" },
            { icon: Shield, text: "Fully On-Chain" },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 hover:scale-105 transition duration-300 shadow-lg shadow-purple-500/20"
            >
              <item.icon className="mx-auto mb-4 text-green-400" size={30} />
              {item.text}
            </div>
          ))}
        </div>

        {/* HOW IT WORKS */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-semibold mb-12">How It Works</h2>

          <div className="grid md:grid-cols-4 gap-10 px-10">
            {[
              "Deposit USDT",
              "Earn Daily ROI",
              "Build Team",
              "Withdraw Securely",
            ].map((step, i) => (
              <div
                key={i}
                className="p-6 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 hover:scale-110 transition duration-300"
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* STATS */}
        <div className="mt-24 grid md:grid-cols-3 gap-10 px-10 pb-24">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-lg border border-purple-400/30 shadow-lg shadow-purple-500/20">
            <p>Total Users</p>
            <h3 className="text-3xl font-bold mt-2">14,682</h3>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500/20 to-yellow-500/20 backdrop-blur-lg border border-green-400/30 shadow-lg shadow-green-500/20">
            <p>Total Deposited</p>
            <h3 className="text-3xl font-bold mt-2">$5,742,500</h3>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg border border-blue-400/30 shadow-lg shadow-blue-500/20">
            <p>Total Withdrawn</p>
            <h3 className="text-3xl font-bold mt-2">$1,250,800</h3>
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center py-10 border-t border-white/10 text-gray-400 text-sm">
          © 2026 NovaDeFi. All rights reserved.
        </div>

      </div>
    </div>
  )
}