"use client";

import { useState } from "react";
import {
  ChevronDown,
  Copy,
  ArrowDown,
  Settings,
  RefreshCcw,
} from "lucide-react";

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

type TokenBoxProps = {
  label: "From" | "To";
  token: string;
  chain: string;
  balance: string;
  amount: string;
  onAmountChange?: (value: string) => void;
  onMax?: () => void;
  logoBg: string;
  logoText: string;
};

function TokenBox({
  label,
  token,
  chain,
  balance,
  amount,
  onAmountChange,
  onMax,
  logoBg,
  logoText,
}: TokenBoxProps) {
  return (
    <div>
      <div className="mb-4 text-[15px] font-medium text-white/75">{label}</div>

      <div className="rounded-[28px] border border-white/10 bg-[#0b1120] px-5 py-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full text-xl font-black",
                logoBg,
                logoText
              )}
            >
              {token.slice(0, 1)}
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 text-left text-[28px] font-black tracking-tight text-white"
            >
              {token}
              <ChevronDown size={18} className="text-yellow-400" />
            </button>
          </div>

          <input
            value={amount}
            onChange={(e) => onAmountChange?.(e.target.value)}
            placeholder="0"
            inputMode="decimal"
            className="w-24 bg-transparent text-right text-[44px] font-medium tracking-tight text-white outline-none placeholder:text-white/35"
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-[15px] text-white/55">
          <span>{chain}</span>

          <button
            type="button"
            className="inline-flex items-center justify-center text-white/55 transition hover:text-white"
          >
            <Copy size={20} />
          </button>

          <span>Balance: {balance}</span>

          <button
            type="button"
            onClick={onMax}
            className="rounded-full bg-white/8 px-5 py-2.5 text-[15px] font-semibold text-white transition hover:bg-white/12"
          >
            Max
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SwapPanel() {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  function handleSwapDirection() {
    const currentFrom = fromAmount;
    const currentTo = toAmount;
    setFromAmount(currentTo);
    setToAmount(currentFrom);
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-3 py-4 md:px-4 md:py-6">
      <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,#060b18_0%,#070d1c_100%)] px-5 py-7 shadow-[0_25px_80px_rgba(0,0,0,0.45)] md:px-10 md:py-10">
        <div className="mb-10 flex items-center justify-between">
          <div className="w-10" />
          <h2 className="text-center text-4xl font-black tracking-tight text-white md:text-5xl">
            Swap
          </h2>

          <button
            type="button"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full text-white/80 transition hover:bg-white/5 hover:text-white"
          >
            <Settings size={24} />
          </button>
        </div>

        <TokenBox
          label="From"
          token="USDT"
          chain="BSC Chain"
          balance="0.0098"
          amount={fromAmount}
          onAmountChange={setFromAmount}
          onMax={() => setFromAmount("0.0098")}
          logoBg="bg-[#50af95]"
          logoText="text-white"
        />

        <div className="my-8 flex items-center gap-6">
          <div className="h-px flex-1 bg-white/12" />

          <button
            type="button"
            onClick={handleSwapDirection}
            className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-[#0b1120] text-yellow-400 shadow-[0_0_0_6px_rgba(255,255,255,0.01)] transition hover:rotate-180 hover:text-yellow-300"
          >
            <ArrowDown size={24} />
          </button>

          <div className="h-px flex-1 bg-white/12" />
        </div>

        <TokenBox
          label="To"
          token="NOVA"
          chain="BSC Chain"
          balance="0.0000"
          amount={toAmount}
          onAmountChange={setToAmount}
          onMax={() => setToAmount("0")}
          logoBg="bg-yellow-400"
          logoText="text-black"
        />

        <button
          type="button"
          className="mt-10 inline-flex w-full items-center justify-center gap-3 rounded-[28px] bg-[#9b7a0c] px-6 py-5 text-2xl font-black tracking-wide text-black transition hover:brightness-110"
        >
          <RefreshCcw size={26} />
          SWAP
        </button>
      </div>
    </section>
  );
}