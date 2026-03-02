"use client";

import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { NOVADEFI_ADDRESS, NOVADEFI_ABI } from "@/lib/web3";

export default function StatsGrid() {
  const { address, isConnected, chain } = useAccount();

  /* ================= NETWORK CHECK ================= */

  if (chain?.id !== 56) {
    return (
      <GridWrapper>
        <StatCard title="Network Error" value="Switch to BSC Mainnet" />
        <StatCard title="Reward Balance" value="-" />
        <StatCard title="Team Size" value="-" />
      </GridWrapper>
    );
  }

  /* ================= CONTRACT READ ================= */

  const { data, isLoading, isError } = useReadContract({
  address: NOVADEFI_ADDRESS,
  abi: NOVADEFI_ABI,
  functionName: "users",
  args: address ? [address] : undefined,
  chainId: 56,
  query: {
    enabled: !!address, // ✅ call only when address exists
    refetchInterval: 10000,
  },
});

  /* ================= NOT CONNECTED ================= */

  if (!isConnected) {
    return (
      <GridWrapper>
        <StatCard title="Deposit Balance" value="Connect Wallet" />
        <StatCard title="Reward Balance" value="Connect Wallet" />
        <StatCard title="Team Size" value="Connect Wallet" />
      </GridWrapper>
    );
  }

  /* ================= ERROR ================= */

  if (isError) {
    return (
      <GridWrapper>
        <StatCard title="Error" value="Contract read failed" />
        <StatCard title="-" value="-" />
        <StatCard title="-" value="-" />
      </GridWrapper>
    );
  }

  /* ================= LOADING ================= */

  if (isLoading || !data) {
    return (
      <GridWrapper>
        <StatCard title="Deposit Balance" value="Loading..." />
        <StatCard title="Reward Balance" value="Loading..." />
        <StatCard title="Team Size" value="Loading..." />
      </GridWrapper>
    );
  }

  /* ================= SAFE CAST ================= */

  const user = data as readonly [
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
    bigint,
    number
  ];

  const deposit = formatUnits(user[0], 18);
  const reward = formatUnits(user[1], 18);
  const team = user[10].toString();

  return (
    <GridWrapper>
      <StatCard title="Deposit Balance" value={`${deposit} USDT`} />
      <StatCard title="Reward Balance" value={`${reward} USDT`} />
      <StatCard title="Team Size" value={team} />
    </GridWrapper>
  );
}

/* ================= WRAPPER ================= */

function GridWrapper({ children }: { children: React.ReactNode }) {
  return <div className="grid md:grid-cols-3 gap-6">{children}</div>;
}

/* ================= CARD ================= */

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg hover:scale-105 transition">
      <h3 className="text-gray-400 text-sm mb-2">{title}</h3>
      <p className="text-2xl font-bold text-green-400">{value}</p>
    </div>
  );
}