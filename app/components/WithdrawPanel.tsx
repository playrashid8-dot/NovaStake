"use client";

import { useState } from "react";
import { ethers } from "ethers";
import {
  getNovaDefiContract,
  ensureMainnet,
} from "@/lib/web3";

export default function WithdrawPanel() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleWithdraw() {
    if (!amount) return alert("Enter amount");

    try {
      setLoading(true);

      await ensureMainnet();

      const defi = await getNovaDefiContract();

      const parsedAmount = ethers.utils.parseUnits(amount, 18);

      const withdrawTx = await defi.withdraw(parsedAmount);
      await withdrawTx.wait();

      alert("Withdrawal Successful 🚀");
      setAmount("");
    } catch (err: any) {
      console.error(err);

      if (err?.error?.message) {
        alert(err.error.message);
      } else {
        alert("Withdrawal Failed ❌");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg mt-6">
      <h2 className="text-xl font-semibold mb-4">
        Withdraw USDT
      </h2>

      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-3 rounded-lg bg-black/40 border border-white/20 text-white mb-4"
      />

      <button
        onClick={handleWithdraw}
        disabled={loading}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-400 to-pink-500 font-semibold hover:opacity-90 transition"
      >
        {loading ? "Processing..." : "Withdraw"}
      </button>
    </div>
  );
}