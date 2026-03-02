"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  getUSDTContract,
  getNovaDefiContract,
  NOVADEFI_ADDRESS,
  ensureMainnet,
  toWei,
  fromWei,
} from "@/lib/web3";

export default function DepositPanel() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const [depositBalance, setDepositBalance] = useState("0");
  const [rewardBalance, setRewardBalance] = useState("0");
  const [level, setLevel] = useState(0);
  const [teamCount, setTeamCount] = useState(0);

  const [referrer, setReferrer] = useState(
    "0x0000000000000000000000000000000000000000"
  );

  /* ============================
     AUTO REFERRAL FROM URL
  ============================ */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");

      if (ref && ethers.utils.isAddress(ref)) {
        setReferrer(ref);
      }
    }
  }, []);

  /* ============================
     LOAD USER DATA (SAFE)
  ============================ */
  async function loadUser() {
    try {
      await ensureMainnet();
      const defi = await getNovaDefiContract();
      const signer = await defi.signer.getAddress();

      const user = await defi.users(signer);

      setDepositBalance(fromWei(user.depositBalance));
      setRewardBalance(fromWei(user.rewardBalance));
      setLevel(Number(user.level));
      setTeamCount(Number(user.teamCount));
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  /* ============================
     HANDLE DEPOSIT
  ============================ */
  async function handleDeposit() {
    if (!amount) return alert("Enter amount");
    if (Number(amount) < 50)
      return alert("Minimum deposit is 50 USDT");

    try {
      setLoading(true);
      await ensureMainnet();

      const usdt = await getUSDTContract();
      const defi = await getNovaDefiContract();

      const parsedAmount = toWei(amount);
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

      const depositTx = await defi.deposit(
        parsedAmount,
        referrer
      );

      await depositTx.wait();

      alert("Deposit Successful 🚀");
      setAmount("");
      loadUser();
    } catch (err: any) {
      console.error(err);
      alert(err?.reason || err?.error?.message || "Deposit Failed ❌");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg mt-6 text-white">

      <h2 className="text-xl font-semibold mb-4">
        VIP Deposit Panel
      </h2>

      {/* USER STATS */}
      <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
        <div className="bg-black/30 p-3 rounded-lg">
          Deposit: {depositBalance} USDT
        </div>
        <div className="bg-black/30 p-3 rounded-lg">
          Rewards: {rewardBalance} USDT
        </div>
        <div className="bg-black/30 p-3 rounded-lg">
          Level: {level}
        </div>
        <div className="bg-black/30 p-3 rounded-lg">
          Team: {teamCount}
        </div>
      </div>

      {/* INPUT */}
      <input
        type="number"
        placeholder="Enter amount (Min 50 USDT)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-3 rounded-lg bg-black/40 border border-white/20 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
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