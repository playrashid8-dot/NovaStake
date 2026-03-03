"use client";

import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { NOVADEFI_ADDRESS, NOVADEFI_ABI } from "@/lib/web3";

type UserTuple = readonly [
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  number,
  `0x${string}`,
  bigint,
  bigint
];

export default function PremiumHeader() {
  const { address } = useAccount();

  const { data } = useReadContract({
    address: NOVADEFI_ADDRESS,
    abi: NOVADEFI_ABI,
    functionName: "users",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const user = data as UserTuple | undefined;

  const deposit = user?.[0] ?? 0n;
  const reward = user?.[1] ?? 0n;
  const level = user?.[7] ?? 0;

  const total = deposit + reward;

  const shortAddress =
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "-";

  const vipConfig = {
    0: { gradient: "from-gray-600 to-gray-800", label: "Member" },
    1: { gradient: "from-green-400 to-emerald-600", label: "VIP 1" },
    2: { gradient: "from-blue-400 to-blue-600", label: "VIP 2" },
    3: { gradient: "from-yellow-400 to-yellow-600", label: "VIP 3" },
  } as const;

  const vip =
    vipConfig[level as keyof typeof vipConfig] || vipConfig[0];

  return (
    <div className="relative rounded-3xl p-6 bg-gradient-to-br from-black to-gray-900 border border-white/10 shadow-2xl overflow-hidden">

      <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-xs text-gray-400">
            Connected Wallet
          </div>
          <div className="text-sm font-semibold text-white">
            {shortAddress}
          </div>
        </div>

        <div
          className={`px-4 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${vip.gradient} text-white shadow-lg`}
        >
          👑 {vip.label}
        </div>
      </div>

      <div>
        <div className="text-xs text-gray-400">
          Total Portfolio
        </div>

        <div className="text-3xl font-bold text-green-400 mt-1">
          {formatUnits(total, 18)} USDT
        </div>

        <div className="flex justify-between mt-4 text-xs text-gray-400">
          <span>
            Deposit: {formatUnits(deposit, 18)}
          </span>
          <span>
            Rewards: {formatUnits(reward, 18)}
          </span>
        </div>
      </div>
    </div>
  );
}