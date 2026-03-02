"use client";

import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { NOVADEFI_ADDRESS } from "@/lib/contract";
import { novadefiAbi } from "@/lib/novadefiAbi";

export default function StatsGrid() {
  const { address } = useAccount();

  // USER STRUCT
  const { data: userData } = useReadContract({
    address: NOVADEFI_ADDRESS,
    abi: novadefiAbi,
    functionName: "users",
    args: address ? [address] : undefined,
  });

  // PENDING REWARDS
  const { data: rewardsData } = useReadContract({
    address: NOVADEFI_ADDRESS,
    abi: novadefiAbi,
    functionName: "getPendingRewards",
    args: address ? [address] : undefined,
  });

  // TOTAL INVESTED
  const { data: totalData } = useReadContract({
    address: NOVADEFI_ADDRESS,
    abi: novadefiAbi,
    functionName: "totalInvested",
  });

  // TREASURY
  const { data: treasuryData } = useReadContract({
    address: NOVADEFI_ADDRESS,
    abi: novadefiAbi,
    functionName: "treasury",
  });

  // 🔥 SAFE TYPE CASTING
  const user = userData as any;
  const rewards = rewardsData as bigint | undefined;
  const total = totalData as bigint | undefined;
  const treasury = treasuryData as string | undefined;

  const deposit = user?.depositAmt
    ? formatUnits(user.depositAmt as bigint, 18)
    : "0";

  const pending = rewards
    ? formatUnits(rewards, 18)
    : "0";

  const totalInvested = total
    ? formatUnits(total, 18)
    : "0";

  const level = user?.level ?? 0;

  return (
    <div className="grid md:grid-cols-5 gap-6">

      <div className="p-6 bg-white/10 rounded-xl">
        <p className="text-sm text-gray-400">Your Deposit</p>
        <h2 className="text-2xl font-bold">{deposit} USDT</h2>
      </div>

      <div className="p-6 bg-white/10 rounded-xl">
        <p className="text-sm text-gray-400">Pending Rewards</p>
        <h2 className="text-2xl font-bold text-green-400">
          {pending} USDT
        </h2>
      </div>

      <div className="p-6 bg-white/10 rounded-xl">
        <p className="text-sm text-gray-400">Your Level</p>
        <h2 className="text-2xl font-bold">
          Level {level}
        </h2>
      </div>

      <div className="p-6 bg-white/10 rounded-xl">
        <p className="text-sm text-gray-400">Total Platform Invested</p>
        <h2 className="text-2xl font-bold">
          {totalInvested} USDT
        </h2>
      </div>

      <div className="p-6 bg-white/10 rounded-xl">
        <p className="text-sm text-gray-400">Treasury Address</p>
        <h2 className="text-xs font-mono break-all">
          {treasury ?? "Loading..."}
        </h2>
      </div>

    </div>
  );
}