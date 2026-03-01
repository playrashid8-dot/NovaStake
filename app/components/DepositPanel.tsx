"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  getUSDTContract,
  getNovaDefiContract,
  NOVADEFI_ADDRESS,
  ensureMainnet,
} from "@/lib/web3";

export default function DepositPanel() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [referrer, setReferrer] = useState(
    "0x0000000000000000000000000000000000000000"
  );

  // 🔥 Auto detect referral from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");

      if (ref && ethers.utils.isAddress(ref)) {
        setReferrer(ref);
      }
    }
  }, []);

  async function handleDeposit() {
    if (!amount) return alert("Enter amount");

    if (Number(amount) < 50) {
      alert("Minimum deposit is 50 USDT");
      return;
    }

    try {
      setLoading(true);

      // 🔄 Ensure BSC Mainnet
      await ensureMainnet();

      const usdt = await getUSDTContract();
      const defi = await getNovaDefiContract();

      const parsedAmount = ethers.utils.parseUnits(amount, 18);

      // 1️⃣ Check allowance first
      const signer = await usdt.signer.getAddress();
      const allowance = await usdt.allowance(
        signer,
        NOVADEFI_ADDRESS
      );

      if (allowance.lt(parsedAmount)) {
        const approveTx = await usdt.approve(
          NOVADEFI_ADDRESS,
          parsedAmount
        );
        await approveTx.wait();
      }

      // 2️⃣ Deposit with referrer
      const depositTx = await defi.deposit(
        parsedAmount,
        referrer
      );

      await depositTx.wait();

      alert("Deposit Successful 🚀");
      setAmount("");
    } catch (err) {
      console.error(err);
      alert("Transaction Failed ❌");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg mt-6">
      <h2 className="text-xl font-semibold mb-4">
        Deposit USDT
      </h2>

      <input
        type="number"
        placeholder="Enter amount (Min 50 USDT)"
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

      {referrer !==
        "0x0000000000000000000000000000000000000000" && (
        <p className="text-xs text-gray-400 mt-3">
          Referral: {referrer.slice(0, 6)}...
          {referrer.slice(-4)}
        </p>
      )}
    </div>
  );
}