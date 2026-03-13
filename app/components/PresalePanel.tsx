"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { Coins, Wallet, ShieldCheck, Ticket } from "lucide-react";

import { useToastStore } from "@/lib/useToastStore";
import {
  BSC_USDT_ADDRESS,
  NOVA_PRESALE_ABI,
  NOVA_PRESALE_ADDRESS,
  PRESALE_PRICE_TEXT,
  PRESALE_USDT_ABI,
  USDT_DECIMALS,
  NOVA_DECIMALS,
} from "@/lib/presale-contract";

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function formatToken(value?: bigint | null, decimals = 18, max = 4) {
  if (value == null) return "0";
  const raw = formatUnits(value, decimals);
  const [whole, frac = ""] = raw.split(".");
  if (!frac) return whole;
  const trimmed = frac.slice(0, max).replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
}

export default function PresalePanel() {
  const { address, isConnected } = useAccount();
  const { openToast } = useToastStore();
  const handledHashRef = useRef<string | null>(null);

  const [amount, setAmount] = useState("");
  const [txMode, setTxMode] = useState<"approve" | "buy" | null>(null);

  const {
    data: txHash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess, isError } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  const presaleActiveRead = useReadContract({
    address: NOVA_PRESALE_ADDRESS,
    abi: NOVA_PRESALE_ABI,
    functionName: "presaleActive",
    query: { refetchInterval: 10000 },
  });

  const minBuyRead = useReadContract({
    address: NOVA_PRESALE_ADDRESS,
    abi: NOVA_PRESALE_ABI,
    functionName: "minBuyUSDT",
    query: { refetchInterval: 10000 },
  });

  const maxBuyRead = useReadContract({
    address: NOVA_PRESALE_ADDRESS,
    abi: NOVA_PRESALE_ABI,
    functionName: "maxBuyUSDT",
    query: { refetchInterval: 10000 },
  });

  const totalRaisedRead = useReadContract({
    address: NOVA_PRESALE_ADDRESS,
    abi: NOVA_PRESALE_ABI,
    functionName: "totalUSDRaised",
    query: { refetchInterval: 10000 },
  });

  const totalSoldRead = useReadContract({
    address: NOVA_PRESALE_ADDRESS,
    abi: NOVA_PRESALE_ABI,
    functionName: "totalNovaSold",
    query: { refetchInterval: 10000 },
  });

  const remainingRead = useReadContract({
    address: NOVA_PRESALE_ADDRESS,
    abi: NOVA_PRESALE_ABI,
    functionName: "remainingNovaForSale",
    query: { refetchInterval: 10000 },
  });

  const usdtBalanceRead = useReadContract({
    address: BSC_USDT_ADDRESS,
    abi: PRESALE_USDT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      refetchInterval: 10000,
    },
  });

  const usdtAllowanceRead = useReadContract({
    address: BSC_USDT_ADDRESS,
    abi: PRESALE_USDT_ABI,
    functionName: "allowance",
    args: address ? [address, NOVA_PRESALE_ADDRESS] : undefined,
    query: {
      enabled: Boolean(address),
      refetchInterval: 10000,
    },
  });

  const userInfoRead = useReadContract({
    address: NOVA_PRESALE_ADDRESS,
    abi: NOVA_PRESALE_ABI,
    functionName: "getUserInfo",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      refetchInterval: 10000,
    },
  });

  const parsedAmount = useMemo(() => {
    try {
      if (!amount || Number(amount) <= 0) return 0n;
      return parseUnits(amount, USDT_DECIMALS);
    } catch {
      return 0n;
    }
  }, [amount]);

  const previewRead = useReadContract({
    address: NOVA_PRESALE_ADDRESS,
    abi: NOVA_PRESALE_ABI,
    functionName: "previewNovaAmount",
    args: [parsedAmount],
    query: {
      enabled: parsedAmount > 0n,
      refetchInterval: 5000,
    },
  });

  const minBuy = (minBuyRead.data as bigint | undefined) ?? 0n;
  const maxBuy = (maxBuyRead.data as bigint | undefined) ?? 0n;
  const totalRaised = (totalRaisedRead.data as bigint | undefined) ?? 0n;
  const totalSold = (totalSoldRead.data as bigint | undefined) ?? 0n;
  const remaining = (remainingRead.data as bigint | undefined) ?? 0n;
  const usdtBalance = (usdtBalanceRead.data as bigint | undefined) ?? 0n;
  const usdtAllowance = (usdtAllowanceRead.data as bigint | undefined) ?? 0n;
  const presaleActive = Boolean(presaleActiveRead.data);
  const previewNova = (previewRead.data as bigint | undefined) ?? 0n;

  const userSpent = ((userInfoRead.data as readonly [bigint, bigint, boolean] | undefined)?.[0]) ?? 0n;
  const userBought = ((userInfoRead.data as readonly [bigint, bigint, boolean] | undefined)?.[1]) ?? 0n;

  const nextTotalSpent = userSpent + parsedAmount;
  const belowMin = parsedAmount > 0n && minBuy > 0n && parsedAmount < minBuy;
  const aboveMax = parsedAmount > 0n && maxBuy > 0n && nextTotalSpent > maxBuy;
  const insufficientBalance = parsedAmount > 0n && usdtBalance < parsedAmount;

  const needsApproval = parsedAmount > 0n && usdtAllowance < parsedAmount;
  const canBuy =
    parsedAmount > 0n &&
    !belowMin &&
    !aboveMax &&
    !insufficientBalance &&
    usdtAllowance >= parsedAmount &&
    presaleActive;

  const isBusy = isWritePending || isConfirming;

  function handleMax() {
    if (usdtBalance <= 0n) return;
    setAmount(formatToken(usdtBalance, USDT_DECIMALS, 4));
  }

  function approveUSDT() {
    if (!address || !isConnected) {
      openToast("Please connect your wallet first.", "error");
      return;
    }
    if (parsedAmount <= 0n) {
      openToast("Enter valid USDT amount.", "error");
      return;
    }
    if (belowMin) {
      openToast(`Minimum buy is ${formatToken(minBuy, USDT_DECIMALS)} USDT`, "error");
      return;
    }
    if (aboveMax) {
      openToast(`Maximum total buy is ${formatToken(maxBuy, USDT_DECIMALS)} USDT`, "error");
      return;
    }

    setTxMode("approve");
    writeContract({
      address: BSC_USDT_ADDRESS,
      abi: PRESALE_USDT_ABI,
      functionName: "approve",
      args: [NOVA_PRESALE_ADDRESS, parsedAmount],
    });

    openToast("Confirm USDT approval in wallet.", "info");
  }

  function buyNow() {
    if (!address || !isConnected) {
      openToast("Please connect your wallet first.", "error");
      return;
    }
    if (!presaleActive) {
      openToast("Presale is not active.", "error");
      return;
    }
    if (parsedAmount <= 0n) {
      openToast("Enter valid USDT amount.", "error");
      return;
    }
    if (belowMin) {
      openToast(`Minimum buy is ${formatToken(minBuy, USDT_DECIMALS)} USDT`, "error");
      return;
    }
    if (aboveMax) {
      openToast(`Maximum total buy is ${formatToken(maxBuy, USDT_DECIMALS)} USDT`, "error");
      return;
    }
    if (insufficientBalance) {
      openToast("Insufficient USDT balance.", "error");
      return;
    }

    setTxMode("buy");
    writeContract({
      address: NOVA_PRESALE_ADDRESS,
      abi: NOVA_PRESALE_ABI,
      functionName: "buyWithUSDT",
      args: [parsedAmount],
    });

    openToast("Confirm presale buy in wallet.", "info");
  }

  useEffect(() => {
    if (!writeError) return;
    openToast(writeError.message || "Transaction failed.", "error");
  }, [writeError, openToast]);

  useEffect(() => {
    if (!txHash || !isSuccess) return;
    if (handledHashRef.current === txHash) return;

    handledHashRef.current = txHash;

    if (txMode === "approve") {
      openToast("USDT approved successfully ✅", "success");
    } else if (txMode === "buy") {
      openToast("Presale purchase successful ✅", "success");
      setAmount("");
    }

    usdtBalanceRead.refetch();
    usdtAllowanceRead.refetch();
    userInfoRead.refetch();
    totalRaisedRead.refetch();
    totalSoldRead.refetch();
    remainingRead.refetch();
  }, [
    isSuccess,
    txHash,
    txMode,
    openToast,
    usdtBalanceRead,
    usdtAllowanceRead,
    userInfoRead,
    totalRaisedRead,
    totalSoldRead,
    remainingRead,
  ]);

  useEffect(() => {
    if (!txHash || !isError) return;
    openToast("Transaction failed", "error");
  }, [isError, txHash, openToast]);

  if (!isConnected) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white/80">
        Connect wallet to join NOVA presale
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-xl backdrop-blur md:p-6">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              NOVA Presale
            </h2>
            <p className="mt-2 text-sm text-zinc-400 md:text-base">
              Buy NOVA directly with USDT at fixed price.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              title="Price"
              value={PRESALE_PRICE_TEXT}
              icon={<Ticket size={16} />}
              valueClass="text-yellow-300"
            />
            <InfoCard
              title="Min Buy"
              value={`${formatToken(minBuy, USDT_DECIMALS)} USDT`}
              icon={<ShieldCheck size={16} />}
              valueClass="text-cyan-300"
            />
            <InfoCard
              title="Max Buy"
              value={`${formatToken(maxBuy, USDT_DECIMALS)} USDT`}
              icon={<ShieldCheck size={16} />}
              valueClass="text-orange-300"
            />
            <InfoCard
              title="Status"
              value={presaleActive ? "Active" : "Closed"}
              icon={<Coins size={16} />}
              valueClass={presaleActive ? "text-green-300" : "text-red-300"}
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <InfoCard
              title="Total Raised"
              value={`${formatToken(totalRaised, USDT_DECIMALS)} USDT`}
              icon={<Wallet size={16} />}
            />
            <InfoCard
              title="Total NOVA Sold"
              value={`${formatToken(totalSold, NOVA_DECIMALS)} NOVA`}
              icon={<Coins size={16} />}
            />
            <InfoCard
              title="Remaining NOVA"
              value={`${formatToken(remaining, NOVA_DECIMALS)} NOVA`}
              icon={<Coins size={16} />}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-300">
            <div className="mb-2 font-semibold text-white">How it works</div>
            <ul className="space-y-1">
              <li>• Enter USDT amount</li>
              <li>• Approve USDT once</li>
              <li>• Click Buy NOVA</li>
              <li>• NOVA goes directly to your wallet</li>
            </ul>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-xl backdrop-blur md:p-6">
          <div className="mb-5">
            <div className="text-sm uppercase tracking-wider text-zinc-500">
              Buy with USDT
            </div>
            <h3 className="mt-1 text-2xl font-bold text-white">Presale Order</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MiniStat
              title="Your USDT Balance"
              value={`${formatToken(usdtBalance, USDT_DECIMALS)} USDT`}
            />
            <MiniStat
              title="Allowance"
              value={`${formatToken(usdtAllowance, USDT_DECIMALS)} USDT`}
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <MiniStat
              title="You Spent"
              value={`${formatToken(userSpent, USDT_DECIMALS)} USDT`}
            />
            <MiniStat
              title="You Bought"
              value={`${formatToken(userBought, NOVA_DECIMALS)} NOVA`}
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              USDT Amount
            </label>

            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 p-3">
              <Coins className="text-amber-400" size={18} />
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="Enter USDT amount"
                className="w-full bg-transparent text-white outline-none placeholder:text-zinc-500"
              />
              <button
                type="button"
                onClick={handleMax}
                className="rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-white"
              >
                Max
              </button>
            </div>

            {belowMin ? (
              <div className="mt-2 text-sm text-red-400">
                Minimum buy is {formatToken(minBuy, USDT_DECIMALS)} USDT
              </div>
            ) : null}

            {aboveMax ? (
              <div className="mt-2 text-sm text-red-400">
                Maximum total buy is {formatToken(maxBuy, USDT_DECIMALS)} USDT
              </div>
            ) : null}

            {insufficientBalance ? (
              <div className="mt-2 text-sm text-red-400">
                Your USDT balance is lower than entered amount.
              </div>
            ) : null}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <MiniStat
              title="You Receive"
              value={`${formatToken(previewNova, NOVA_DECIMALS)} NOVA`}
            />
            <MiniStat
              title="Price"
              value={PRESALE_PRICE_TEXT}
            />
          </div>

          <div className="mt-6 space-y-3">
            {needsApproval ? (
              <button
                type="button"
                onClick={approveUSDT}
                disabled={isBusy || parsedAmount <= 0n}
                className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-bold text-black transition disabled:opacity-60"
              >
                {isBusy && txMode === "approve" ? "Processing..." : "Approve USDT"}
              </button>
            ) : (
              <button
                type="button"
                onClick={buyNow}
                disabled={isBusy || !canBuy}
                className="w-full rounded-2xl bg-amber-400 px-4 py-3 font-bold text-black transition disabled:opacity-60"
              >
                {isBusy && txMode === "buy" ? "Processing..." : "Buy NOVA"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({
  title,
  value,
  icon,
  valueClass,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm text-zinc-400">
        {icon}
        {title}
      </div>
      <div className={cn("text-lg font-semibold text-white", valueClass)}>
        {value}
      </div>
    </div>
  );
}

function MiniStat({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs uppercase tracking-wider text-zinc-500">
        {title}
      </div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}