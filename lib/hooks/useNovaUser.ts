"use client";

import { useMemo } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";

import {
  NOVASTAKE_ABI,
  NOVASTAKE_ADDRESS,
  NOVA_TOKEN_ABI,
  NOVA_TOKEN_ADDRESS,
  PLAN_META,
} from "../contract";

type StakeTuple = readonly [
  bigint, // amount
  bigint, // totalReward
  bigint, // claimedReward
  bigint, // startTime
  bigint, // endTime
  number | bigint, // planId
  boolean // withdrawn
];

export type NovaUserStake = {
  index: number;
  amount: bigint;
  totalReward: bigint;
  claimedReward: bigint;
  pendingReward: bigint;
  startTime: bigint;
  endTime: bigint;
  planId: number;
  withdrawn: boolean;
  matured: boolean;
  planName: string;
  roiLabel: string;
};

export type NovaUserSummary = {
  referrer: string;
  activePrincipal: bigint;
  totalStakedVolume: bigint;
  rewardBalance: bigint;
  directCount: bigint;
  teamCount: bigint;
  teamVolume: bigint;
  salaryStageClaimed: number;
  totalStakes: number;
  totalPendingRewards: bigint;
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function toBigIntSafe(value: unknown): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  if (typeof value === "string" && value !== "") {
    try {
      return BigInt(value);
    } catch {
      return 0n;
    }
  }
  return 0n;
}

function toStringSafe(value: unknown): string {
  return typeof value === "string" ? value : ZERO_ADDRESS;
}

function normalizeSummary(data: unknown): NovaUserSummary | null {
  if (!data) return null;

  if (Array.isArray(data)) {
    return {
      referrer: toStringSafe(data[0]),
      activePrincipal: toBigIntSafe(data[1]),
      totalStakedVolume: toBigIntSafe(data[2]),
      rewardBalance: toBigIntSafe(data[3]),
      directCount: toBigIntSafe(data[4]),
      teamCount: toBigIntSafe(data[5]),
      teamVolume: toBigIntSafe(data[6]),
      salaryStageClaimed: Number(toBigIntSafe(data[7])),
      totalStakes: Number(toBigIntSafe(data[8])),
      totalPendingRewards: toBigIntSafe(data[9]),
    };
  }

  if (typeof data === "object" && data !== null) {
    const d = data as Record<string, unknown>;

    return {
      referrer: toStringSafe(d.referrer),
      activePrincipal: toBigIntSafe(d.activePrincipal),
      totalStakedVolume: toBigIntSafe(d.totalStakedVolume),
      rewardBalance: toBigIntSafe(d.rewardBalance),
      directCount: toBigIntSafe(d.directCount),
      teamCount: toBigIntSafe(d.teamCount),
      teamVolume: toBigIntSafe(d.teamVolume),
      salaryStageClaimed: Number(toBigIntSafe(d.salaryStageClaimed)),
      totalStakes: Number(toBigIntSafe(d.totalStakes)),
      totalPendingRewards: toBigIntSafe(d.totalPendingRewards),
    };
  }

  return null;
}

function isRealStake(stake: StakeTuple | undefined | null) {
  if (!stake) return false;
  const amount = stake[0] ?? 0n;
  const startTime = stake[3] ?? 0n;
  const endTime = stake[4] ?? 0n;

  return amount > 0n || startTime > 0n || endTime > 0n;
}

export function useNovaUser() {
  const { address, isConnected } = useAccount();

  const enabled = Boolean(address && isConnected);

  const summaryRead = useReadContract({
    address: NOVASTAKE_ADDRESS,
    abi: NOVASTAKE_ABI,
    functionName: "getUserSummary",
    args: address ? [address] : undefined,
    query: {
      enabled,
      refetchInterval: 10_000,
    },
  });

  const stakesRead = useReadContract({
    address: NOVASTAKE_ADDRESS,
    abi: NOVASTAKE_ABI,
    functionName: "getUserStakes",
    args: address ? [address] : undefined,
    query: {
      enabled,
      refetchInterval: 10_000,
    },
  });

  const canClaimSalaryRead = useReadContract({
    address: NOVASTAKE_ADDRESS,
    abi: NOVASTAKE_ABI,
    functionName: "canClaimSalary",
    args: address ? [address] : undefined,
    query: {
      enabled,
      refetchInterval: 10_000,
    },
  });

  const contractBalanceRead = useReadContract({
    address: NOVASTAKE_ADDRESS,
    abi: NOVASTAKE_ABI,
    functionName: "contractTokenBalance",
    query: {
      refetchInterval: 10_000,
    },
  });

  const treasuryReferralBalanceRead = useReadContract({
    address: NOVASTAKE_ADDRESS,
    abi: NOVASTAKE_ABI,
    functionName: "treasuryReferralBalance",
    query: {
      refetchInterval: 10_000,
    },
  });

  const walletTokenBalanceRead = useReadContract({
    address: NOVA_TOKEN_ADDRESS,
    abi: NOVA_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled,
      refetchInterval: 10_000,
    },
  });

  const allowanceRead = useReadContract({
    address: NOVA_TOKEN_ADDRESS,
    abi: NOVA_TOKEN_ABI,
    functionName: "allowance",
    args: address ? [address, NOVASTAKE_ADDRESS] : undefined,
    query: {
      enabled,
      refetchInterval: 10_000,
    },
  });

  const rawStakes = useMemo(() => {
    if (!stakesRead.data || !Array.isArray(stakesRead.data)) return [];
    return stakesRead.data as StakeTuple[];
  }, [stakesRead.data]);

  const pendingRewardReads = useReadContracts({
    contracts:
      enabled && address && rawStakes.length > 0
        ? rawStakes.map((_, index) => ({
            address: NOVASTAKE_ADDRESS,
            abi: NOVASTAKE_ABI,
            functionName: "pendingReward",
            args: [address, BigInt(index)],
          }))
        : [],
    query: {
      enabled: enabled && rawStakes.length > 0,
      refetchInterval: 10_000,
    },
  });

  const nextClaimReads = useReadContracts({
    contracts:
      enabled && address && rawStakes.length > 0
        ? rawStakes.map((_, index) => ({
            address: NOVASTAKE_ADDRESS,
            abi: NOVASTAKE_ABI,
            functionName: "nextClaimTime",
            args: [address, BigInt(index)],
          }))
        : [],
    query: {
      enabled: enabled && rawStakes.length > 0,
      refetchInterval: 10_000,
    },
  });

  const summary = useMemo<NovaUserSummary | null>(() => {
    return normalizeSummary(summaryRead.data);
  }, [summaryRead.data]);

  const stakes = useMemo<NovaUserStake[]>(() => {
    const now = Math.floor(Date.now() / 1000);

    return rawStakes
      .map((stake, rawIndex) => ({ stake, rawIndex }))
      .filter(({ stake }) => isRealStake(stake))
      .map(({ stake, rawIndex }) => {
        const pendingReward =
          (pendingRewardReads.data?.[rawIndex]?.result as bigint | undefined) ?? 0n;

        const planId = Number(stake[5] ?? 0);
        const plan = PLAN_META.find((p) => p.id === planId) ?? PLAN_META[0];

        const amount = stake[0] ?? 0n;
        const totalReward = stake[1] ?? 0n;
        const claimedReward = stake[2] ?? 0n;
        const startTime = stake[3] ?? 0n;
        const endTime = stake[4] ?? 0n;
        const withdrawn = Boolean(stake[6]);

        return {
          index: rawIndex,
          amount,
          totalReward,
          claimedReward,
          pendingReward,
          startTime,
          endTime,
          planId,
          withdrawn,
          matured: !withdrawn && endTime > 0n && Number(endTime) <= now,
          planName: plan.name,
          roiLabel: plan.roi,
        };
      });
  }, [rawStakes, pendingRewardReads.data]);

  const totalPendingRewards = useMemo(() => {
    if (summary?.totalPendingRewards != null) return summary.totalPendingRewards;
    return stakes.reduce((sum, stake) => sum + stake.pendingReward, 0n);
  }, [summary, stakes]);

  const nextClaimTimes = useMemo(() => {
    return rawStakes
      .map((stake, rawIndex) => ({ stake, rawIndex }))
      .filter(({ stake }) => isRealStake(stake))
      .map(({ rawIndex }) => {
        return (nextClaimReads.data?.[rawIndex]?.result as bigint | undefined) ?? 0n;
      });
  }, [rawStakes, nextClaimReads.data]);

  const maturedPrincipal = useMemo(() => {
    return stakes.reduce((sum, stake) => {
      if (stake.matured && !stake.withdrawn) return sum + stake.amount;
      return sum;
    }, 0n);
  }, [stakes]);

  const allowance = useMemo(() => {
    return (allowanceRead.data as bigint | undefined) ?? 0n;
  }, [allowanceRead.data]);

  const isLoading =
    summaryRead.isLoading ||
    stakesRead.isLoading ||
    canClaimSalaryRead.isLoading ||
    walletTokenBalanceRead.isLoading ||
    contractBalanceRead.isLoading ||
    allowanceRead.isLoading;

  const isRefetching =
    summaryRead.isRefetching ||
    stakesRead.isRefetching ||
    canClaimSalaryRead.isRefetching ||
    walletTokenBalanceRead.isRefetching ||
    contractBalanceRead.isRefetching ||
    pendingRewardReads.isRefetching ||
    nextClaimReads.isRefetching;

  async function refetchAll() {
    await Promise.all([
      summaryRead.refetch(),
      stakesRead.refetch(),
      canClaimSalaryRead.refetch(),
      contractBalanceRead.refetch(),
      treasuryReferralBalanceRead.refetch(),
      walletTokenBalanceRead.refetch(),
      allowanceRead.refetch(),
      pendingRewardReads.refetch(),
      nextClaimReads.refetch(),
    ]);
  }

  const referrer = summary?.referrer ?? ZERO_ADDRESS;
  const activePrincipal = summary?.activePrincipal ?? 0n;
  const totalStakedVolume = summary?.totalStakedVolume ?? 0n;
  const rewardBalance = summary?.rewardBalance ?? 0n;
  const directCount = summary?.directCount ?? 0n;
  const teamCount = summary?.teamCount ?? 0n;
  const teamVolume = summary?.teamVolume ?? 0n;
  const salaryStageClaimed = summary?.salaryStageClaimed ?? 0;
  const totalStakes = summary?.totalStakes ?? stakes.length;

  return {
    address,
    connected: enabled,
    isConnected: enabled,

    summary,
    referrer,
    stakes,
    nextClaimTimes,

    activePrincipal,
    activeStake: activePrincipal,
    totalStakedVolume,
    rewardBalance,
    directCount,
    teamCount,
    teamVolume,
    salaryStageClaimed,
    totalStakes,
    totalPendingRewards,
    maturedPrincipal,

    canClaimSalary: Boolean(canClaimSalaryRead.data),
    walletTokenBalance:
      (walletTokenBalanceRead.data as bigint | undefined) ?? 0n,
    contractTokenBalance:
      (contractBalanceRead.data as bigint | undefined) ?? 0n,
    treasuryReferralBalance:
      (treasuryReferralBalanceRead.data as bigint | undefined) ?? 0n,
    allowance,

    isLoading,
    isRefetching,
    refetchAll,
  };
}