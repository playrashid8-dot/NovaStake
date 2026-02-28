"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { getContract, getUSDT, CONTRACT_ADDRESS } from "@/lib/web3";

export default function DepositPanel() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDeposit() {
    if (!amount) return alert("Enter amount");

    try {
      setLoading(true);

      const usdt = await getUSDT();
      const contract = await getContract();

      const parsedAmount = ethers.utils.parseUnits(amount, 18);

      // 1️⃣ Approve USDT
      const approveTx = await usdt.approve(
        CONTRACT_ADDRESS,
        parsedAmount
      );
      await approveTx.wait();

      // 2️⃣ Deposit
      const depositTx = await contract.deposit(parsedAmount);
      await depositTx.wait();

      alert("Deposit Successful 🚀");
      setAmount("");
    } catch (error: any) {
      console.error(error);
      alert("Transaction Failed ❌");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg shadow-green-500/20 mt-6">
      <h2 className="text-xl font-semibold mb-4">Deposit USDT</h2>

      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-3 rounded-lg bg-black/40 border border-white/20 text-white mb-4"
      />

      <button
        onClick={handleDeposit}
        disabled={loading}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 font-semibold hover:opacity-90 transition"
      >
        {loading ? "Processing..." : "Approve & Deposit"}
      </button>
    </div>
  );
}