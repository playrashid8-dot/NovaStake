"use client";

import { useMemo } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";

import {
  NOVASTAKE_ABI,
  NOVASTAKE_ADDRESS,
  NOVA_TOKEN_ABI,
  NOVA_TOKEN_ADDRESS,
  PLAN_META,
  ZERO_ADDRESS,
} from "../contract";

type RawStake =
  | readonly [bigint, bigint, bigint, bigint, bigint, number | bigint, boolean]
  | {
      amount?: bigint;
      totalReward?: bigint;
      claimedReward?: bigint;
      startTime?: bigint;
      endTime?: bigint;
      planId?: number | bigint;
      withdrawn?: boolean;
      [key: number]: unknown;
    };

export type NovaUserStake = {
  index: number;
  amount: bigint;
  totalReward: bigint;
  claimedReward: bigint;
  pendingReward: bigint;
  startTime: bigint;
  endTime: bigint;
  nextClaimTime: bigint;
  planId: number;
  withdrawn: boolean;
  matured: boolean;
  active: boolean;
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

function getStakeAmount(stake: RawStake): bigint {
  if (
    typeof stake === "object" &&
    stake !== null &&
    "amount" in stake &&
    stake.amount != null
  ) {
    return toBigIntSafe(stake.amount);
  }
  return toBigIntSafe((stake as any)?.[0]);
}

function getStakeTotalReward(stake: RawStake): bigint {
  if (
    typeof stake === "object" &&
    stake !== null &&
    "totalReward" in stake &&
    stake.totalReward != null
  ) {
    return toBigIntSafe(stake.totalReward);
  }
  return toBigIntSafe((stake as any)?.[1]);
}

function getStakeClaimedReward(stake: RawStake): bigint {
  if (
    typeof stake === "object" &&
    stake !== null &&
    "claimedReward" in stake &&
    stake.claimedReward != null
  ) {
    return toBigIntSafe(stake.claimedReward);
  }
  return toBigIntSafe((stake as any)?.[2]);
}

function getStakeStartTime(stake: RawStake): bigint {
  if (
    typeof stake === "object" &&
    stake !== null &&
    "startTime" in stake &&
    stake.startTime != null
  ) {
    return toBigIntSafe(stake.startTime);
  }
  return toBigIntSafe((stake as any)?.[3]);
}

function getStakeEndTime(stake: RawStake): bigint {
  if (
    typeof stake === "object" &&
    stake !== null &&
    "endTime" in stake &&
    stake.endTime != null
  ) {
    return toBigIntSafe(stake.endTime);
  }
  return toBigIntSafe((stake as any)?.[4]);
}

function getStakePlanId(stake: RawStake): number {
  if (
    typeof stake === "object" &&
    stake !== null &&
    "planId" in stake &&
    stake.planId != null
  ) {
    return Number(stake.planId);
  }
  return Number((stake as any)?.[5] ?? 0);
}

function getStakeWithdrawn(stake: RawStake): boolean {
  if (
    typeof stake === "object" &&
    stake !== null &&
    "withdrawn" in stake &&
    stake.withdrawn != null
  ) {
    return Boolean(stake.withdrawn);
  }
  return Boolean((stake as any)?.[6]);
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

function isRealStake(stake: RawStake | undefined | null) {
  if (!stake) return false;

  const amount = getStakeAmount(stake);
  const startTime = getStakeStartTime(stake);
  const endTime = getStakeEndTime(stake);

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
      refetchInterval: 10000,
    },
  });

  const stakesRead = useReadContract({
    address: NOVASTAKE_ADDRESS,
    abi: NOVASTAKE_ABI,
    functionName: "getUserStakes",
    args: address ? [address] : undefined,
    query: {
      enabled,
      refetchInterval: 10000,
    },
  });

  const canClaimSalaryRead = useReadContract({
    address: NOVASTAKE_ADDRESS,
    abi: NOVASTAKE_ABI,
    functionName: "canClaimSalary",
    args: address ? [address] : undefined,
    query: {
      enabled,
      refetchInterval: 10000,
    },
  });

  const contractBalanceRead = useReadContract({
    address: NOVASTAKE_ADDRESS,
    abi: NOVASTAKE_ABI,
    functionName: "contractTokenBalance",
    query: {
      refetchInterval: 10000,
    },
  });

  const walletTokenBalanceRead = useReadContract({
    address: NOVA_TOKEN_ADDRESS,
    abi: NOVA_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled,
      refetchInterval: 10000,
    },
  });

  const allowanceRead = useReadContract({
    address: NOVA_TOKEN_ADDRESS,
    abi: NOVA_TOKEN_ABI,
    functionName: "allowance",
    args: address ? [address, NOVASTAKE_ADDRESS] : undefined,
    query: {
      enabled,
      refetchInterval: 10000,
    },
  });

  const rawStakes = useMemo(() => {
    if (!stakesRead.data || !Array.isArray(stakesRead.data)) return [];
    return stakesRead.data as RawStake[];
  }, [stakesRead.data]);

  const validStakeItems = useMemo(() => {
    return rawStakes
      .map((stake, rawIndex) => ({ stake, rawIndex }))
      .filter(({ stake }) => isRealStake(stake));
  }, [rawStakes]);

  const pendingRewardReads = useReadContracts({
    contracts:
      enabled && address && validStakeItems.length > 0
        ? validStakeItems.map(({ rawIndex }) => ({
            address: NOVASTAKE_ADDRESS,
            abi: NOVASTAKE_ABI,
            functionName: "pendingReward",
            args: [address, BigInt(rawIndex)],
          }))
        : [],
    query: {
      enabled: enabled && validStakeItems.length > 0,
      refetchInterval: 10000,
    },
  });

  const nextClaimReads = useReadContracts({
    contracts:
      enabled && address && validStakeItems.length > 0
        ? validStakeItems.map(({ rawIndex }) => ({
            address: NOVASTAKE_ADDRESS,
            abi: NOVASTAKE_ABI,
            functionName: "nextClaimTime",
            args: [address, BigInt(rawIndex)],
          }))
        : [],
    query: {
      enabled: enabled && validStakeItems.length > 0,
      refetchInterval: 10000,
    },
  });

  const summary = useMemo<NovaUserSummary | null>(() => {
    return normalizeSummary(summaryRead.data);
  }, [summaryRead.data]);

  const stakes = useMemo<NovaUserStake[]>(() => {
    const now = Math.floor(Date.now() / 1000);

    return validStakeItems.map(({ stake, rawIndex }, visibleIndex) => {
      const pendingReward =
        (pendingRewardReads.data?.[visibleIndex]?.result as bigint | undefined) ?? 0n;

      const nextClaimTime =
        (nextClaimReads.data?.[visibleIndex]?.result as bigint | undefined) ?? 0n;

      const amount = getStakeAmount(stake);
      const totalReward = getStakeTotalReward(stake);
      const claimedReward = getStakeClaimedReward(stake);
      const startTime = getStakeStartTime(stake);
      const endTime = getStakeEndTime(stake);
      const planId = getStakePlanId(stake);
      const withdrawn = getStakeWithdrawn(stake);

      const matured = !withdrawn && endTime > 0n && Number(endTime) <= now;
      const active = !withdrawn && !matured;

      const plan = PLAN_META.find((p) => p.id === planId) ?? PLAN_META[0];

      return {
        index: rawIndex,
        amount,
        totalReward,
        claimedReward,
        pendingReward,
        startTime,
        endTime,
        nextClaimTime,
        planId,
        withdrawn,
        matured,
        active,
        planName: plan.name,
        roiLabel: plan.roi,
      };
    });
  }, [validStakeItems, pendingRewardReads.data, nextClaimReads.data]);

  const nextClaimTimes = useMemo(() => {
    return stakes.map((stake) => stake.nextClaimTime);
  }, [stakes]);

  const totalPendingRewards = useMemo(() => {
    if (summary?.totalPendingRewards != null) return summary.totalPendingRewards;
    return stakes.reduce((sum, stake) => sum + stake.pendingReward, 0n);
  }, [summary, stakes]);

  const maturedPrincipal = useMemo(() => {
    return stakes.reduce((sum, stake) => {
      if (stake.matured && !stake.withdrawn) return sum + stake.amount;
      return sum;
    }, 0n);
  }, [stakes]);

  const activeStakes = useMemo(() => {
    return stakes.filter((stake) => stake.active);
  }, [stakes]);

  const runningStakes = useMemo(() => {
    return stakes.filter((stake) => !stake.withdrawn && !stake.matured);
  }, [stakes]);

  const maturedStakes = useMemo(() => {
    return stakes.filter((stake) => stake.matured && !stake.withdrawn);
  }, [stakes]);

  const withdrawnStakes = useMemo(() => {
    return stakes.filter((stake) => stake.withdrawn);
  }, [stakes]);

  const activeStakeCount = activeStakes.length;
  const runningStakeCount = runningStakes.length;
  const maturedStakeCount = maturedStakes.length;
  const withdrawnStakeCount = withdrawnStakes.length;

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
    activeStakes,
    runningStakes,
    maturedStakes,
    withdrawnStakes,
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

    activeStakeCount,
    runningStakeCount,
    maturedStakeCount,
    withdrawnStakeCount,

    canClaimSalary: Boolean(canClaimSalaryRead.data),
    walletTokenBalance:
      (walletTokenBalanceRead.data as bigint | undefined) ?? 0n,
    contractTokenBalance:
      (contractBalanceRead.data as bigint | undefined) ?? 0n,
    allowance,

    isLoading,
    isRefetching,
    refetchAll,
  };
}