"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatUnits } from "viem";
import {
  CheckCircle2,
  Gift,
  MessageCircle,
  Send,
  Sparkles,
  Wallet,
} from "lucide-react";

import { useToastStore } from "@/lib/useToastStore";
import {
  NOVA_AIRDROP_ABI,
  NOVA_AIRDROP_ADDRESS,
  TELEGRAM_URL,
  WHATSAPP_URL,
} from "@/lib/airdrop-contract";

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function formatToken(value?: bigint | null, decimals = 18, max = 2) {
  if (value == null) return "0";
  const raw = formatUnits(value, decimals);
  const [whole, frac = ""] = raw.split(".");
  if (!frac) return whole;
  const trimmed = frac.slice(0, max).replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
}

export default function AirdropPanel() {
  const { address, isConnected } = useAccount();
  const { openToast } = useToastStore();
  const handledHashRef = useRef<string | null>(null);

  const [txMode, setTxMode] = useState<"telegram" | "whatsapp" | "claim" | null>(null);

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

  const breakdownRead = useReadContract({
    address: NOVA_AIRDROP_ADDRESS,
    abi: NOVA_AIRDROP_ABI,
    functionName: "getUserAirdropBreakdown",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      refetchInterval: 10000,
    },
  });

  const taskStatusRead = useReadContract({
    address: NOVA_AIRDROP_ADDRESS,
    abi: NOVA_AIRDROP_ABI,
    functionName: "getTaskStatus",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      refetchInterval: 10000,
    },
  });

  const breakdown = breakdownRead.data as
    | readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint]
    | undefined;

  const taskStatus = taskStatusRead.data as readonly [boolean, boolean] | undefined;

  const walletReward = breakdown?.[0] ?? 0n;
  const telegramReward = breakdown?.[1] ?? 0n;
  const whatsappReward = breakdown?.[2] ?? 0n;
  const stakeReward = breakdown?.[3] ?? 0n;
  const referralReward = breakdown?.[4] ?? 0n;
  const presaleReward = breakdown?.[5] ?? 0n;
  const totalEarned = breakdown?.[7] ?? 0n;
  const totalClaimed = breakdown?.[8] ?? 0n;
  const claimableNow = breakdown?.[9] ?? 0n;

  const telegramDone = taskStatus?.[0] ?? false;
  const whatsappDone = taskStatus?.[1] ?? false;
  const stakeDone = stakeReward > 0n;

  const isBusy = isWritePending || isConfirming;

  function completeTelegram() {
    setTxMode("telegram");
    writeContract({
      address: NOVA_AIRDROP_ADDRESS,
      abi: NOVA_AIRDROP_ABI,
      functionName: "completeTelegramTask",
      args: [],
    });
  }

  function completeWhatsapp() {
    setTxMode("whatsapp");
    writeContract({
      address: NOVA_AIRDROP_ADDRESS,
      abi: NOVA_AIRDROP_ABI,
      functionName: "completeWhatsappTask",
      args: [],
    });
  }

  function claimAirdrop() {
    setTxMode("claim");
    writeContract({
      address: NOVA_AIRDROP_ADDRESS,
      abi: NOVA_AIRDROP_ABI,
      functionName: "claimAirdrop",
      args: [],
    });
  }

  useEffect(() => {
    if (!writeError) return;
    openToast(writeError.message || "Transaction failed.", "error");
  }, [writeError, openToast]);

  useEffect(() => {
    if (!txHash || !isSuccess) return;
    if (handledHashRef.current === txHash) return;
    handledHashRef.current = txHash;

    if (txMode === "telegram") {
      openToast("Telegram reward added ✅", "success");
      window.open(TELEGRAM_URL, "_blank", "noopener,noreferrer");
    } else if (txMode === "whatsapp") {
      openToast("WhatsApp reward added ✅", "success");
      window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
    } else if (txMode === "claim") {
      openToast("Airdrop claimed successfully ✅", "success");
    }

    breakdownRead.refetch();
    taskStatusRead.refetch();
  }, [txHash, isSuccess, txMode, breakdownRead, taskStatusRead, openToast]);

  useEffect(() => {
    if (!txHash || !isError) return;
    openToast("Transaction failed", "error");
  }, [txHash, isError, openToast]);

  if (!isConnected) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white/80">
        Connect wallet to view Nova Airdrop
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur md:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-yellow-400/10 p-3 text-yellow-300">
              <Gift size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white md:text-3xl">
                Nova Airdrop
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Complete tasks and claim NOVA directly in your wallet.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <TaskCard
            title="Connect Wallet"
            reward="+3 NOVA"
            icon={<Wallet size={18} />}
            done={walletReward > 0n}
            buttonText="Completed"
            onClick={() => {}}
            disabled
          />

          <TaskCard
            title="Join Telegram"
            reward="+5 NOVA"
            icon={<Send size={18} />}
            done={telegramDone}
            buttonText={telegramDone ? "Completed" : "Join Telegram"}
            onClick={completeTelegram}
            disabled={telegramDone || isBusy}
          />

          <TaskCard
            title="Join WhatsApp Channel"
            reward="+5 NOVA"
            icon={<MessageCircle size={18} />}
            done={whatsappDone}
            buttonText={whatsappDone ? "Completed" : "Join WhatsApp"}
            onClick={completeWhatsapp}
            disabled={whatsappDone || isBusy}
          />

          <TaskCard
            title="Activate First Stake"
            reward="+5 NOVA"
            icon={<Sparkles size={18} />}
            done={stakeDone}
            buttonText={stakeDone ? "Completed" : "Pending"}
            onClick={() => {}}
            disabled
          />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur md:p-6">
          <h3 className="text-xl font-bold text-white">Referral Rewards</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MiniBox title="1 Referral" value="1 NOVA" />
            <MiniBox title="5 Referrals" value="7 NOVA" />
            <MiniBox title="10 Referrals" value="15 NOVA" />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur md:p-6">
          <h3 className="text-xl font-bold text-white">Presale Bonus</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <MiniBox title="Buy 10 USDT" value="+2 NOVA" />
            <MiniBox title="Buy 50 USDT" value="+7 NOVA" />
            <MiniBox title="Buy 100 USDT" value="+15 NOVA" />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur md:p-6">
          <h3 className="text-xl font-bold text-white">Airdrop Summary</h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MiniBox title="Wallet Reward" value={`${formatToken(walletReward)} NOVA`} />
            <MiniBox title="Telegram Reward" value={`${formatToken(telegramReward)} NOVA`} />
            <MiniBox title="WhatsApp Reward" value={`${formatToken(whatsappReward)} NOVA`} />
            <MiniBox title="Stake Reward" value={`${formatToken(stakeReward)} NOVA`} />
            <MiniBox title="Referral Reward" value={`${formatToken(referralReward)} NOVA`} />
            <MiniBox title="Presale Bonus" value={`${formatToken(presaleReward)} NOVA`} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MiniBox title="Total Earned" value={`${formatToken(totalEarned)} NOVA`} />
            <MiniBox title="Already Claimed" value={`${formatToken(totalClaimed)} NOVA`} />
            <MiniBox title="Claimable Now" value={`${formatToken(claimableNow)} NOVA`} />
          </div>

          <button
            type="button"
            onClick={claimAirdrop}
            disabled={isBusy || claimableNow <= 0n}
            className={cn(
              "mt-5 w-full rounded-2xl px-4 py-3 font-bold transition",
              isBusy || claimableNow <= 0n
                ? "cursor-not-allowed bg-white/10 text-white/40"
                : "bg-yellow-400 text-black hover:bg-yellow-300"
            )}
          >
            {isBusy && txMode === "claim" ? "Processing..." : "Claim Airdrop"}
          </button>
        </div>
      </div>
    </section>
  );
}

function TaskCard({
  title,
  reward,
  icon,
  done,
  buttonText,
  onClick,
  disabled,
}: {
  title: string;
  reward: string;
  icon: React.ReactNode;
  done?: boolean;
  buttonText: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-3 text-yellow-300">{icon}</div>
          <div>
            <div className="text-lg font-bold text-white">{title}</div>
            <div className="mt-1 text-sm text-zinc-400">{reward}</div>
          </div>
        </div>

        {done ? <CheckCircle2 size={20} className="text-green-400" /> : null}
      </div>

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "mt-4 w-full rounded-2xl px-4 py-3 font-semibold transition",
          disabled
            ? "cursor-not-allowed bg-white/10 text-white/50"
            : "bg-yellow-400 text-black hover:bg-yellow-300"
        )}
      >
        {buttonText}
      </button>
    </div>
  );
}

function MiniBox({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs uppercase tracking-wider text-zinc-500">{title}</div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}