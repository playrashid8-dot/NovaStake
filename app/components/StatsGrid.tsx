"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getNovaDefiContract, getProvider } from "@/lib/web3";

export default function StatsGrid() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const provider = await getProvider();
        const signer = provider.getSigner();
        const address = await signer.getAddress();

        const contract = await getNovaDefiContract();
        const user = await contract.users(address);

        setData({
          deposit: ethers.utils.formatUnits(user.depositBalance, 18),
          rewards: ethers.utils.formatUnits(user.rewardBalance, 18),
          level: Number(user.level),
          direct: Number(user.directCount),
          team: Number(user.teamCount),
          monthly: ethers.utils.formatUnits(user.monthlyWithdrawn, 18),
        });
      } catch (err) {
        console.log("Wallet not connected");
      }
    }

    load();
  }, []);

  if (!data) return null;

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <Card title="Deposit Balance" value={data.deposit + " USDT"} />
      <Card title="Reward Balance" value={data.rewards + " USDT"} />
      <Card title="Level" value={"Level " + data.level} />
      <Card title="Direct Team" value={data.direct.toString()} />
      <Card title="Total Team" value={data.team.toString()} />
      <Card title="Monthly Withdrawn" value={data.monthly + " USDT"} />
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-lg">
      <h3 className="text-sm text-gray-400 mb-2">{title}</h3>
      <p className="text-xl font-bold text-green-400">{value}</p>
    </div>
  );
}