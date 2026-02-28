"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Users,
  BarChart3,
  Menu,
  X,
} from "lucide-react"

import StatsGrid from "@/app/components/StatsGrid"
import DepositPanel from "@/app/components/DepositPanel"
import WithdrawPanel from "@/app/components/WithdrawPanel"
import StakingSection from "@/app/components/StakingSection"
import TeamSection from "@/app/components/TeamSection"
import AnalyticsSection from "@/app/components/AnalyticsSection"

export default function Dashboard() {
  const [active, setActive] = useState("dashboard")
  const [open, setOpen] = useState(false)

  const menu = [
    { key: "dashboard", icon: <LayoutDashboard size={18} /> },
    { key: "deposit", icon: <Wallet size={18} /> },
    { key: "staking", icon: <TrendingUp size={18} /> },
    { key: "team", icon: <Users size={18} /> },
    { key: "analytics", icon: <BarChart3 size={18} /> },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#1a1a3c] to-[#24243e] text-white">

      {/* Desktop Sidebar */}
      <div className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6 hidden md:block">
        <h2 className="text-2xl font-bold mb-10">NovaDeFi</h2>

        {menu.map((item) => (
          <div
            key={item.key}
            onClick={() => setActive(item.key)}
            className={`flex items-center gap-3 mb-6 cursor-pointer capitalize transition ${
              active === item.key
                ? "text-green-400"
                : "text-gray-400 hover:text-green-400"
            }`}
          >
            {item.icon}
            {item.key}
          </div>
        ))}
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/60 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed left-0 top-0 h-full w-64 bg-[#111] p-6 z-50"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-bold">NovaDeFi</h2>
                <X size={20} onClick={() => setOpen(false)} />
              </div>

              {menu.map((item) => (
                <div
                  key={item.key}
                  onClick={() => {
                    setActive(item.key)
                    setOpen(false)
                  }}
                  className={`flex items-center gap-3 mb-6 cursor-pointer capitalize ${
                    active === item.key
                      ? "text-green-400"
                      : "text-gray-400"
                  }`}
                >
                  {item.icon}
                  {item.key}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10">

        {/* Top Bar */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <Menu
              className="md:hidden cursor-pointer"
              onClick={() => setOpen(true)}
            />
            <h1 className="text-2xl md:text-3xl font-bold capitalize">
              {active}
            </h1>
          </div>

          <div className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-400/30 text-sm">
            0x6380...594a
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {active === "dashboard" && <StatsGrid />}
            {active === "deposit" && (
              <div className="grid md:grid-cols-2 gap-10">
                <DepositPanel />
                <WithdrawPanel />
              </div>
            )}
            {active === "staking" && <StakingSection />}
            {active === "team" && <TeamSection />}
            {active === "analytics" && <AnalyticsSection />}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  )
}