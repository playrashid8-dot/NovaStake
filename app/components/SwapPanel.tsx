"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, Coins, RefreshCcw, Wallet } from "lucide-react";
import { formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { useToastStore } from "@/lib/useToastStore";
import {
  BSC_USDT_ADDRESS,
  ERC20_ABI,
  NOVA_DECIMALS,
  NOVA_TOKEN_ADDRESS,
  NOVA_TREASURY_SWAP_ABI,
  NOVA_TREASURY_SWAP_ADDRESS,
  USDT_DECIMALS,
} from "@/lib/treasury-swap-contract";

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

function sanitizeDecimal(value: string) {
  return value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
}

type Mode = "buy" | "sell";
type TxMode = "approve-buy" | "approve-sell" | "buy" | "sell" | null;

export default function SwapPanel() {
  const { address, isConnected } = useAccount();
  const { openToast } = useToastStore();
  const handledHashRef = useRef<string | null>(null);

  const [mode, setMode] = useState<Mode>("buy");
  const [amount, setAmount] = useState("");
  const [txMode, setTxMode] = useState<TxMode>(null);

  const {
    data: txHash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess, isError } =
    useWaitForTransactionReceipt({ hash: txHash });

  const parsedBuyAmount = useMemo(() => {
    try {
      if (!amount || Number(amount) <= 0) return 0n;
      return parseUnits(amount, USDT_DECIMALS);
    } catch {
      return 0n;
    }
  }, [amount]);

  const parsedSellAmount = useMemo(() => {
    try {
      if (!amount || Number(amount) <= 0) return 0n;
      return parseUnits(amount, NOVA_DECIMALS);
    } catch {
      return 0n;
    }
  }, [amount]);

  const buyPriceRead = useReadContract({
    address: NOVA_TREASURY_SWAP_ADDRESS,
    abi: NOVA_TREASURY_SWAP_ABI,
    functionName: "getBuyPriceE18",
    query: { refetchInterval: 10000 },
  });

  const sellPriceRead = useReadContract({
    address: NOVA_TREASURY_SWAP_ADDRESS,
    abi: NOVA_TREASURY_SWAP_ABI,
    functionName: "getSellPriceE18",
    query: { refetchInterval: 10000 },
  });

  const minBuyRead = useReadContract({
    address: NOVA_TREASURY_SWAP_ADDRESS,
    abi: NOVA_TREASURY_SWAP_ABI,
    functionName: "minBuyUSDT",
    query: { refetchInterval: 10000 },
  });

  const minSellRead = useReadContract({
    address: NOVA_TREASURY_SWAP_ADDRESS,
    abi: NOVA_TREASURY_SWAP_ABI,
    functionName: "minSellNOVA",
    query: { refetchInterval: 10000 },
  });

  const swapActiveRead = useReadContract({
    address: NOVA_TREASURY_SWAP_ADDRESS,
    abi: NOVA_TREASURY_SWAP_ABI,
    functionName: "swapActive",
    query: { refetchInterval: 10000 },
  });

  const usdtReserveRead = useReadContract({
    address: NOVA_TREASURY_SWAP_ADDRESS,
    abi: NOVA_TREASURY_SWAP_ABI,
    functionName: "usdtReserve",
    query: { refetchInterval: 10000 },
  });

  const novaReserveRead = useReadContract({
    address: NOVA_TREASURY_SWAP_ADDRESS,
    abi: NOVA_TREASURY_SWAP_ABI,
    functionName: "novaReserve",
    query: { refetchInterval: 10000 },
  });

  const usdtBalanceRead = useReadContract({
    address: BSC_USDT_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address), refetchInterval: 10000 },
  });

  const novaBalanceRead = useReadContract({
    address: NOVA_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address), refetchInterval: 10000 },
  });

  const usdtAllowanceRead = useReadContract({
    address: BSC_USDT_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, NOVA_TREASURY_SWAP_ADDRESS] : undefined,
    query: { enabled: Boolean(address), refetchInterval: 10000 },
  });

  const novaAllowanceRead = useReadContract({
    address: NOVA_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, NOVA_TREASURY_SWAP_ADDRESS] : undefined,
    query: { enabled: Boolean(address), refetchInterval: 10000 },
  });

  const previewBuyRead = useReadContract({
    address: NOVA_TREASURY_SWAP_ADDRESS,
    abi: NOVA_TREASURY_SWAP_ABI,
    functionName: "previewBuy",
    args: parsedBuyAmount > 0n ? [parsedBuyAmount] : undefined,
    query: { enabled: parsedBuyAmount > 0n && mode === "buy", refetchInterval: 5000 },
  });

  const previewSellRead = useReadContract({
    address: NOVA_TREASURY_SWAP_ADDRESS,
    abi: NOVA_TREASURY_SWAP_ABI,
    functionName: "previewSell",
    args: parsedSellAmount > 0n ? [parsedSellAmount] : undefined,
    query: { enabled: parsedSellAmount > 0n && mode === "sell", refetchInterval: 5000 },
  });

  const usdtBalance = (usdtBalanceRead.data as bigint | undefined) ?? 0n;
  const novaBalance = (novaBalanceRead.data as bigint | undefined) ?? 0n;
  const usdtAllowance = (usdtAllowanceRead.data as bigint | undefined) ?? 0n;
  const novaAllowance = (novaAllowanceRead.data as bigint | undefined) ?? 0n;

  const buyPrice = (buyPriceRead.data as bigint | undefined) ?? 0n;
  const sellPrice = (sellPriceRead.data as bigint | undefined) ?? 0n;
  const minBuy = (minBuyRead.data as bigint | undefined) ?? 0n;
  const minSell = (minSellRead.data as bigint | undefined) ?? 0n;
  const usdtReserve = (usdtReserveRead.data as bigint | undefined) ?? 0n;
  const novaReserve = (novaReserveRead.data as bigint | undefined) ?? 0n;
  const swapActive = Boolean(swapActiveRead.data);

  const buyPreview = (previewBuyRead.data as bigint | undefined) ?? 0n;
  const sellPreview = (previewSellRead.data as bigint | undefined) ?? 0n;

  const isBusy = isWritePending || isConfirming;

  const belowMinBuy = mode === "buy" && parsedBuyAmount > 0n && parsedBuyAmount < minBuy;
  const belowMinSell = mode === "sell" && parsedSellAmount > 0n && parsedSellAmount < minSell;

  const insufficientBuyBalance =
    mode === "buy" && parsedBuyAmount > 0n && parsedBuyAmount > usdtBalance;

  const insufficientSellBalance =
    mode === "sell" && parsedSellAmount > 0n && parsedSellAmount > novaBalance;

  const needsBuyApproval =
    mode === "buy" && parsedBuyAmount > 0n && usdtAllowance < parsedBuyAmount;

  const needsSellApproval =
    mode === "sell" && parsedSellAmount > 0n && novaAllowance < parsedSellAmount;

  function handleMax() {
    if (mode === "buy") {
      setAmount(formatToken(usdtBalance, USDT_DECIMALS, 6));
    } else {
      setAmount(formatToken(novaBalance, NOVA_DECIMALS, 6));
    }
  }

  function approveBuy() {
    if (!address) return openToast("Connect wallet first.", "error");
    if (parsedBuyAmount <= 0n) return openToast("Enter valid USDT amount.", "error");

    setTxMode("approve-buy");
    writeContract({
      address: BSC_USDT_ADDRESS,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [NOVA_TREASURY_SWAP_ADDRESS, parsedBuyAmount],
    });

    openToast("Confirm USDT approval in wallet.", "info");
  }

  function approveSell() {
    if (!address) return openToast("Connect wallet first.", "error");
    if (parsedSellAmount <= 0n) return openToast("Enter valid NOVA amount.", "error");

    setTxMode("approve-sell");
    writeContract({
      address: NOVA_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [NOVA_TREASURY_SWAP_ADDRESS, parsedSellAmount],
    });

    openToast("Confirm NOVA approval in wallet.", "info");
  }

  function buyNow() {
    if (!address) return openToast("Connect wallet first.", "error");
    if (!swapActive) return openToast("Swap is not active.", "error");
    if (parsedBuyAmount <= 0n) return openToast("Enter valid USDT amount.", "error");
    if (belowMinBuy) return openToast(`Minimum buy is ${formatToken(minBuy, USDT_DECIMALS)} USDT`, "error");
    if (insufficientBuyBalance) return openToast("Insufficient USDT balance.", "error");
    if (buyPreview <= 0n) return openToast("Invalid buy preview.", "error");

    setTxMode("buy");
    writeContract({
      address: NOVA_TREASURY_SWAP_ADDRESS,
      abi: NOVA_TREASURY_SWAP_ABI,
      functionName: "buy",
      args: [parsedBuyAmount],
    });

    openToast("Confirm buy transaction in wallet.", "info");
  }

  function sellNow() {
    if (!address) return openToast("Connect wallet first.", "error");
    if (!swapActive) return openToast("Swap is not active.", "error");
    if (parsedSellAmount <= 0n) return openToast("Enter valid NOVA amount.", "error");
    if (belowMinSell) return openToast(`Minimum sell is ${formatToken(minSell, NOVA_DECIMALS)} NOVA`, "error");
    if (insufficientSellBalance) return openToast("Insufficient NOVA balance.", "error");
    if (sellPreview <= 0n) return openToast("Invalid sell preview.", "error");

    setTxMode("sell");
    writeContract({
      address: NOVA_TREASURY_SWAP_ADDRESS,
      abi: NOVA_TREASURY_SWAP_ABI,
      functionName: "sell",
      args: [parsedSellAmount],
    });

    openToast("Confirm sell transaction in wallet.", "info");
  }

  useEffect(() => {
    if (!writeError) return;
    openToast(writeError.message || "Transaction failed.", "error");
  }, [writeError, openToast]);

  useEffect(() => {
    if (!txHash || !isSuccess) return;
    if (handledHashRef.current === txHash) return;
    handledHashRef.current = txHash;

    if (txMode === "approve-buy") openToast("USDT approved successfully ✅", "success");
    if (txMode === "approve-sell") openToast("NOVA approved successfully ✅", "success");
    if (txMode === "buy") {
      openToast("Buy completed successfully ✅", "success");
      setAmount("");
    }
    if (txMode === "sell") {
      openToast("Sell completed successfully ✅", "success");
      setAmount("");
    }

    usdtBalanceRead.refetch();
    novaBalanceRead.refetch();
    usdtAllowanceRead.refetch();
    novaAllowanceRead.refetch();
    previewBuyRead.refetch();
    previewSellRead.refetch();
    usdtReserveRead.refetch();
    novaReserveRead.refetch();
  }, [
    txHash,
    isSuccess,
    txMode,
    openToast,
    usdtBalanceRead,
    novaBalanceRead,
    usdtAllowanceRead,
    novaAllowanceRead,
    previewBuyRead,
    previewSellRead,
    usdtReserveRead,
    novaReserveRead,
  ]);

  useEffect(() => {
    if (!txHash || !isError) return;
    openToast("Transaction failed", "error");
  }, [txHash, isError, openToast]);

  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-sm text-white/80">
        Connect wallet to use Treasury Swap
      </div>
    );
  }

  const primaryNeedsApproval = mode === "buy" ? needsBuyApproval : needsSellApproval;
  const primaryDisabled =
    isBusy ||
    !swapActive ||
    amount.trim() === "" ||
    (mode === "buy" ? parsedBuyAmount <= 0n : parsedSellAmount <= 0n) ||
    (mode === "buy" ? belowMinBuy || insufficientBuyBalance : belowMinSell || insufficientSellBalance);

  return (
    <section className="mx-auto w-full max-w-2xl px-3 pt-2 pb-28 md:px-4 md:pt-4 md:pb-8">
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#060b18_0%,#070d1c_100%)] px-4 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.42)] md:rounded-[36px] md:px-8 md:py-8">
        <div className="mb-5 flex items-center justify-between">
          <div className="w-8" />
          <h2 className="text-center text-3xl font-black tracking-tight text-white md:text-5xl">
            Swap
          </h2>
          <div className="w-8" />
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5">
          <button
            type="button"
            onClick={() => {
              setMode("buy");
              setAmount("");
            }}
            className={cn(
              "rounded-xl px-4 py-3 text-sm font-bold transition",
              mode === "buy"
                ? "bg-yellow-400 text-black"
                : "text-white/65 hover:bg-white/5 hover:text-white"
            )}
          >
            Buy NOVA
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("sell");
              setAmount("");
            }}
            className={cn(
              "rounded-xl px-4 py-3 text-sm font-bold transition",
              mode === "sell"
                ? "bg-yellow-400 text-black"
                : "text-white/65 hover:bg-white/5 hover:text-white"
            )}
          >
            Sell NOVA
          </button>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[#0b1120] px-4 py-4 md:px-5 md:py-5">
          <div className="mb-2 text-sm text-white/70">
            {mode === "buy" ? "From" : "Sell"}
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full text-lg font-black md:h-14 md:w-14 md:text-xl",
                    mode === "buy" ? "bg-[#50af95] text-white" : "bg-yellow-400 text-black"
                  )}
                >
                  {mode === "buy" ? "U" : "N"}
                </div>
                <div>
                  <div className="text-[18px] font-black text-white md:text-[28px]">
                    {mode === "buy" ? "USDT" : "NOVA"}
                  </div>
                  <div className="text-xs text-white/45 md:text-sm">BSC Chain</div>
                </div>
              </div>
            </div>

            <input
              value={amount}
              onChange={(e) => setAmount(sanitizeDecimal(e.target.value))}
              placeholder="0"
              inputMode="decimal"
              className="w-24 bg-transparent text-right text-[34px] font-medium tracking-tight text-white outline-none placeholder:text-white/30 md:w-28 md:text-[44px]"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-white/55 md:text-sm">
            <span>
              Balance:{" "}
              {mode === "buy"
                ? formatToken(usdtBalance, USDT_DECIMALS, 6)
                : formatToken(novaBalance, NOVA_DECIMALS, 6)}
            </span>

            <button
              type="button"
              onClick={handleMax}
              className="rounded-full bg-white/8 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/12 md:text-sm"
            >
              Max
            </button>
          </div>
        </div>

        <div className="my-5 flex items-center gap-4 md:my-7">
          <div className="h-px flex-1 bg-white/12" />
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#0b1120] text-yellow-400 md:h-14 md:w-14">
            <ArrowDown size={20} />
          </div>
          <div className="h-px flex-1 bg-white/12" />
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[#0b1120] px-4 py-4 md:px-5 md:py-5">
          <div className="mb-2 text-sm text-white/70">
            {mode === "buy" ? "To" : "Receive"}
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full text-lg font-black md:h-14 md:w-14 md:text-xl",
                    mode === "buy" ? "bg-yellow-400 text-black" : "bg-[#50af95] text-white"
                  )}
                >
                  {mode === "buy" ? "N" : "U"}
                </div>
                <div>
                  <div className="text-[18px] font-black text-white md:text-[28px]">
                    {mode === "buy" ? "NOVA" : "USDT"}
                  </div>
                  <div className="text-xs text-white/45 md:text-sm">BSC Chain</div>
                </div>
              </div>
            </div>

            <div className="w-24 text-right text-[34px] font-medium tracking-tight text-white md:w-28 md:text-[44px]">
              {mode === "buy"
                ? formatToken(buyPreview, NOVA_DECIMALS, 6)
                : formatToken(sellPreview, USDT_DECIMALS, 6)}
            </div>
          </div>

          <div className="mt-4 text-xs text-white/55 md:text-sm">
            Balance:{" "}
            {mode === "buy"
              ? formatToken(novaBalance, NOVA_DECIMALS, 6)
              : formatToken(usdtBalance, USDT_DECIMALS, 6)}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/70 md:p-4 md:text-sm">
          <div className="flex items-start justify-between gap-3">
            <span>Status</span>
            <span className={swapActive ? "text-green-400" : "text-red-400"}>
              {swapActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="mt-2 flex items-start justify-between gap-3">
            <span>Buy Price</span>
            <span className="text-right text-white">
              {formatToken(buyPrice, 18, 4)} USDT
            </span>
          </div>

          <div className="mt-2 flex items-start justify-between gap-3">
            <span>Sell Price</span>
            <span className="text-right text-white">
              {formatToken(sellPrice, 18, 4)} USDT
            </span>
          </div>

          <div className="mt-2 flex items-start justify-between gap-3">
            <span>Minimum</span>
            <span className="text-right text-white">
              {mode === "buy"
                ? `${formatToken(minBuy, USDT_DECIMALS, 4)} USDT`
                : `${formatToken(minSell, NOVA_DECIMALS, 4)} NOVA`}
            </span>
          </div>

          <div className="mt-2 flex items-start justify-between gap-3">
            <span>Reserve</span>
            <span className="text-right text-white">
              {mode === "buy"
                ? `${formatToken(novaReserve, NOVA_DECIMALS, 4)} NOVA`
                : `${formatToken(usdtReserve, USDT_DECIMALS, 4)} USDT`}
            </span>
          </div>

          <div className="mt-2 flex items-start justify-between gap-3">
            <span>Allowance</span>
            <span className="text-right text-white">
              {mode === "buy"
                ? `${formatToken(usdtAllowance, USDT_DECIMALS, 4)} USDT`
                : `${formatToken(novaAllowance, NOVA_DECIMALS, 4)} NOVA`}
            </span>
          </div>

          {belowMinBuy ? (
            <div className="mt-3 text-red-400">
              Minimum buy is {formatToken(minBuy, USDT_DECIMALS)} USDT
            </div>
          ) : null}

          {belowMinSell ? (
            <div className="mt-3 text-red-400">
              Minimum sell is {formatToken(minSell, NOVA_DECIMALS)} NOVA
            </div>
          ) : null}

          {insufficientBuyBalance ? (
            <div className="mt-3 text-red-400">Insufficient USDT balance.</div>
          ) : null}

          {insufficientSellBalance ? (
            <div className="mt-3 text-red-400">Insufficient NOVA balance.</div>
          ) : null}
        </div>

        {mode === "buy" ? (
          needsBuyApproval ? (
            <button
              type="button"
              onClick={approveBuy}
              disabled={primaryDisabled}
              className={cn(
                "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[22px] px-5 py-4 text-lg font-black tracking-wide transition md:mt-8 md:text-2xl",
                primaryDisabled
                  ? "cursor-not-allowed bg-white/10 text-white/40"
                  : "bg-cyan-400 text-black hover:brightness-110"
              )}
            >
              <Wallet size={20} />
              {isBusy && txMode === "approve-buy" ? "PROCESSING..." : "APPROVE USDT"}
            </button>
          ) : (
            <button
              type="button"
              onClick={buyNow}
              disabled={primaryDisabled}
              className={cn(
                "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[22px] px-5 py-4 text-lg font-black tracking-wide transition md:mt-8 md:text-2xl",
                primaryDisabled
                  ? "cursor-not-allowed bg-white/10 text-white/40"
                  : "bg-[#9b7a0c] text-black hover:brightness-110"
              )}
            >
              <Coins size={20} />
              {isBusy && txMode === "buy" ? "PROCESSING..." : "BUY NOVA"}
            </button>
          )
        ) : needsSellApproval ? (
          <button
            type="button"
            onClick={approveSell}
            disabled={primaryDisabled}
            className={cn(
              "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[22px] px-5 py-4 text-lg font-black tracking-wide transition md:mt-8 md:text-2xl",
              primaryDisabled
                ? "cursor-not-allowed bg-white/10 text-white/40"
                : "bg-cyan-400 text-black hover:brightness-110"
            )}
          >
            <Wallet size={20} />
            {isBusy && txMode === "approve-sell" ? "PROCESSING..." : "APPROVE NOVA"}
          </button>
        ) : (
          <button
            type="button"
            onClick={sellNow}
            disabled={primaryDisabled}
            className={cn(
              "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[22px] px-5 py-4 text-lg font-black tracking-wide transition md:mt-8 md:text-2xl",
              primaryDisabled
                ? "cursor-not-allowed bg-white/10 text-white/40"
                : "bg-[#9b7a0c] text-black hover:brightness-110"
            )}
          >
            <RefreshCcw size={20} />
            {isBusy && txMode === "sell" ? "PROCESSING..." : "SELL NOVA"}
          </button>
        )}
      </div>
    </section>
  );
}