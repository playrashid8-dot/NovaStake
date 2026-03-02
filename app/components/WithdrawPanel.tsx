"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  getNovaDefiContract,
  ensureMainnet,
  toWei,
  fromWei,
} from "@/lib/web3";

export default function WithdrawPanel() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState<any>(null);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  /* =============================
     LOAD USER DATA
  ============================= */

  async function loadUser() {
    try {
      await ensureMainnet();
      const defi = await getNovaDefiContract();
      const signer = await defi.signer.getAddress();

      const user = await defi.users(signer);
      setUserData(user);

      if (user.lastWithdrawRequest > 0) {
        const cooldown =
          Number(user.lastWithdrawRequest) +
          96 * 60 * 60 -
          Math.floor(Date.now() / 1000);

        if (cooldown > 0) setCooldownLeft(cooldown);
        else setCooldownLeft(0);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  /* =============================
     TIMER
  ============================= */

  useEffect(() => {
    if (cooldownLeft <= 0) return;

    const interval = setInterval(() => {
      setCooldownLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownLeft]);

  function formatTime(seconds: number) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  }

  /* =============================
     REQUEST WITHDRAW
  ============================= */

  async function handleRequestWithdraw() {
    if (!amount) return alert("Enter amount");

    try {
      setLoading(true);
      await ensureMainnet();

      const defi = await getNovaDefiContract();
      const parsedAmount = toWei(amount);

      const tx = await defi.requestWithdraw(parsedAmount);
      await tx.wait();

      alert("Withdraw requested ✅");
      setAmount("");
      loadUser();
    } catch (err: any) {
      alert(err?.reason || err?.error?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  /* =============================
     CLAIM WITHDRAW
  ============================= */

  async function handleClaimWithdraw() {
    try {
      setLoading(true);
      await ensureMainnet();

      const defi = await getNovaDefiContract();
      const tx = await defi.claimWithdraw();
      await tx.wait();

      alert("Withdraw claimed 🚀");
      loadUser();
    } catch (err: any) {
      alert(err?.reason || err?.error?.message || "Claim failed");
    } finally {
      setLoading(false);
    }
  }

  if (!userData)
    return <div className="text-white">Loading...</div>;

  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg mt-6 text-white">
      <h2 className="text-xl font-semibold mb-4">
        VIP Withdraw Panel
      </h2>

      {/* USER STATS */}
      <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
        <div className="bg-black/30 p-3 rounded-lg">
          Deposit: {fromWei(userData.depositBalance)} USDT
        </div>
        <div className="bg-black/30 p-3 rounded-lg">
          Rewards: {fromWei(userData.rewardBalance)} USDT
        </div>
        <div className="bg-black/30 p-3 rounded-lg">
          Pending: {fromWei(userData.pendingWithdraw)} USDT
        </div>
        <div className="bg-black/30 p-3 rounded-lg">
          Level: {userData.level}
        </div>
      </div>

      {/* COOLDOWN */}
      {cooldownLeft > 0 && (
        <div className="bg-yellow-500/20 p-3 rounded-lg mb-4 text-yellow-300 text-sm">
          Cooldown Active: {formatTime(cooldownLeft)}
        </div>
      )}

      {/* INPUT */}
      <input
        type="number"
        placeholder="Enter withdraw amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-3 rounded-lg bg-black/40 border border-white/20 mb-4"
      />

      {/* BUTTONS */}
      <button
        onClick={handleRequestWithdraw}
        disabled={loading}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 font-semibold mb-3"
      >
        {loading ? "Processing..." : "Request Withdraw"}
      </button>

      <button
        onClick={handleClaimWithdraw}
        disabled={loading}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-green-400 to-emerald-600 font-semibold"
      >
        {loading ? "Processing..." : "Claim Withdraw"}
      </button>
    </div>
  );
}