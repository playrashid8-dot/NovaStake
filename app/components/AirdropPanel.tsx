"use client";

import { useEffect, useRef, useState } from "react";
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

type PendingTask = "telegram" | "whatsapp" | null;
type TxMode = "telegram" | "whatsapp" | "claim" | null;

export default function AirdropPanel() {
  const { address, isConnected } = useAccount();
  const { openToast } = useToastStore();
  const handledHashRef = useRef<string | null>(null);

  const [txMode, setTxMode] = useState<TxMode>(null);
  const [pendingTask, setPendingTask] = useState<PendingTask>(null);

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
    | readonly [
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint
      ]
    | undefined;

  const taskStatus = taskStatusRead.data as readonly [boolean, boolean] | undefined;

  const walletReward = breakdown?.[0] ?? 0n;
  const telegramReward = breakdown?.[1] ?? 0n;
  const whatsappReward = breakdown?.[2] ?? 0n;
  const stakeReward = breakdown?.[3] ?? 0n;
  const referralReward = breakdown?.[4] ?? 0n;
  const presaleReward = breakdown?.[5] ?? 0n;
  const claimableNow = breakdown?.[9] ?? 0n;

  const telegramDone = taskStatus?.[0] ?? false;
  const whatsappDone = taskStatus?.[1] ?? false;
  const stakeDone = stakeReward > 0n;

  const isBusy = isWritePending || isConfirming;

  function openTelegramLink() {
    window.open(TELEGRAM_URL, "_blank", "noopener,noreferrer");
  }

  function openWhatsappLink() {
    window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
  }

  function startTelegramTask() {
    openTelegramLink();
    setPendingTask("telegram");
    openToast(
      "Telegram open ho gaya. Join karke wapas aao, phir Claim Telegram Reward dabao.",
      "info"
    );
  }

  function startWhatsappTask() {
    openWhatsappLink();
    setPendingTask("whatsapp");
    openToast(
      "WhatsApp open ho gaya. Join karke wapas aao, phir Claim WhatsApp Reward dabao.",
      "info"
    );
  }

  function claimTelegramReward() {
    setTxMode("telegram");
    writeContract({
      address: NOVA_AIRDROP_ADDRESS,
      abi: NOVA_AIRDROP_ABI,
      functionName: "completeTelegramTask",
      args: [],
    });
  }

  function claimWhatsappReward() {
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
      setPendingTask(null);
      openToast("Telegram reward added ✅", "success");
    } else if (txMode === "whatsapp") {
      setPendingTask(null);
      openToast("WhatsApp reward added ✅", "success");
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
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-sm text-white/80">
        Connect wallet to view Nova Airdrop
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-3 py-4 md:px-4 md:py-6">
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-lg backdrop-blur md:p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-yellow-400/10 p-2.5 text-yellow-300">
              <Gift size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white md:text-2xl">
                Nova Airdrop
              </h2>
              <p className="mt-1 text-xs text-zinc-400 md:text-sm">
                Complete important tasks and claim NOVA in your wallet.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <TaskCard
            title="Connect Wallet"
            reward="+3 NOVA"
            icon={<Wallet size={16} />}
            done={walletReward > 0n}
            buttonText="Completed"
            onClick={() => {}}
            disabled
          />

          <TaskCard
            title="Join Telegram"
            reward="+5 NOVA"
            icon={<Send size={16} />}
            done={telegramDone}
            buttonText={
              telegramDone
                ? "Completed"
                : pendingTask === "telegram"
                ? "Claim Reward"
                : "Open Telegram"
            }
            onClick={
              telegramDone
                ? openTelegramLink
                : pendingTask === "telegram"
                ? claimTelegramReward
                : startTelegramTask
            }
            disabled={isBusy}
          />

          <TaskCard
            title="Join WhatsApp"
            reward="+5 NOVA"
            icon={<MessageCircle size={16} />}
            done={whatsappDone}
            buttonText={
              whatsappDone
                ? "Completed"
                : pendingTask === "whatsapp"
                ? "Claim Reward"
                : "Open WhatsApp"
            }
            onClick={
              whatsappDone
                ? openWhatsappLink
                : pendingTask === "whatsapp"
                ? claimWhatsappReward
                : startWhatsappTask
            }
            disabled={isBusy}
          />

          <TaskCard
            title="First Stake"
            reward="+5 NOVA"
            icon={<Sparkles size={16} />}
            done={stakeDone}
            buttonText={stakeDone ? "Completed" : "Pending"}
            onClick={() => {}}
            disabled
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-lg backdrop-blur md:p-5">
          <h3 className="text-lg font-bold text-white">Reward Summary</h3>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <MiniBox title="Referral Reward" value={`${formatToken(referralReward)} NOVA`} />
            <MiniBox title="Presale Bonus" value={`${formatToken(presaleReward)} NOVA`} />
            <MiniBox title="Claimable Now" value={`${formatToken(claimableNow)} NOVA`} />
          </div>

          <button
            type="button"
            onClick={claimAirdrop}
            disabled={isBusy || claimableNow <= 0n}
            className={cn(
              "mt-4 w-full rounded-2xl px-4 py-3 text-sm font-bold transition md:text-base",
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-lg backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-xl bg-white/10 p-2.5 text-yellow-300">
            {icon}
          </div>
          <div className="min-w-0">
            <div className="truncate text-base font-bold text-white md:text-lg">
              {title}
            </div>
            <div className="mt-1 text-xs text-zinc-400 md:text-sm">{reward}</div>
          </div>
        </div>

        {done ? <CheckCircle2 size={18} className="shrink-0 text-green-400" /> : null}
      </div>

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "mt-3 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition",
          disabled
            ? "cursor-not-allowed bg-white/10 text-white/50"
            : done
            ? "border border-white/10 bg-black/20 text-white hover:border-white/20 hover:bg-black/30"
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
    <div className="rounded-xl border border-white/10 bg-black/20 p-3.5">
      <div className="text-[11px] uppercase tracking-wider text-zinc-500">
        {title}
      </div>
      <div className="mt-1.5 text-base font-semibold text-white md:text-lg">
        {value}
      </div>
    </div>
  );
}