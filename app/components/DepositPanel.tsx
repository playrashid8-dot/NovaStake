"use client";

import { useState, useMemo } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { parseUnits, formatUnits } from "viem";
import { config } from "@/lib/wallet";

import {
  NOVADEFI_ADDRESS,
  NOVADEFI_ABI,
  USDT_ADDRESS,
  ERC20_ABI,
} from "@/lib/web3";

import { useTransactionStore } from "@/lib/useTransactionStore";

export default function DepositPanel() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { openModal } = useTransactionStore();

  const [amount, setAmount] = useState("");
  const [referrer, setReferrer] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= PARSE AMOUNT ================= */

  const parsedAmount = useMemo(() => {
    if (!amount || Number(amount) <= 0) return undefined;
    try {
      return parseUnits(amount, 18);
    } catch {
      return undefined;
    }
  }, [amount]);

  /* ================= USER USDT BALANCE ================= */

  const { data: balanceData, refetch: refetchBalance } =
    useReadContract({
      address: USDT_ADDRESS,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: address ? [address] : undefined,
      query: { enabled: !!address },
    });

  const usdtBalance =
    typeof balanceData === "bigint" ? balanceData : 0n;

  /* ================= MIN DEPOSIT ================= */

  const { data: minDepositData } = useReadContract({
    address: NOVADEFI_ADDRESS,
    abi: NOVADEFI_ABI,
    functionName: "MIN_DEPOSIT",
  });

  const minDeposit =
    typeof minDepositData === "bigint"
      ? minDepositData
      : 0n;

  /* ================= ALLOWANCE ================= */

  const { data: allowanceData, refetch: refetchAllowance } =
    useReadContract({
      address: USDT_ADDRESS,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: address
        ? [address, NOVADEFI_ADDRESS]
        : undefined,
      query: { enabled: !!address },
    });

  const currentAllowance =
    typeof allowanceData === "bigint"
      ? allowanceData
      : 0n;

  const needsApproval =
    parsedAmount !== undefined &&
    currentAllowance < parsedAmount;

  /* ================= VALIDATION ================= */

  const insufficientBalance =
    parsedAmount !== undefined &&
    parsedAmount > usdtBalance;

  const belowMin =
    parsedAmount !== undefined &&
    parsedAmount < minDeposit;

  const disableDeposit =
    !parsedAmount ||
    insufficientBalance ||
    belowMin ||
    loading;

  /* ================= APPROVE ================= */

  async function handleApprove() {
    if (!parsedAmount) return;

    try {
      setLoading(true);

      const hash = await writeContractAsync({
        address: USDT_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [NOVADEFI_ADDRESS, parsedAmount],
      });

      await waitForTransactionReceipt(config, {
        hash,
      });

      await refetchAllowance();

      openModal({
        status: "success",
        message: "USDT Approved Successfully",
        hash,
      });

    } catch (err: any) {
      openModal({
        status: "error",
        message: err?.shortMessage || "Approval Failed",
      });
    } finally {
      setLoading(false);
    }
  }

  /* ================= DEPOSIT ================= */

  async function handleDeposit() {
    if (disableDeposit) return;

    try {
      setLoading(true);

      const hash = await writeContractAsync({
        address: NOVADEFI_ADDRESS,
        abi: NOVADEFI_ABI,
        functionName: "deposit",
        args: [
          parsedAmount!,
          referrer ||
            "0x0000000000000000000000000000000000000000",
        ],
      });

      const receipt = await waitForTransactionReceipt(
        config,
        { hash }
      );

      if (receipt.status === "success") {
        openModal({
          status: "success",
          message: "Deposit Confirmed 🚀",
          hash,
        });

        setAmount("");
        setReferrer("");

        await refetchBalance();
        await refetchAllowance();
      } else {
        openModal({
          status: "error",
          message: "Transaction Reverted",
          hash,
        });
      }

    } catch (err: any) {
      openModal({
        status: "error",
        message: err?.shortMessage || "Deposit Failed",
      });
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */

  if (!isConnected) {
    return (
      <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
        Connect wallet to deposit
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl border border-white/10 space-y-5 shadow-xl">

      <h2 className="text-xl font-bold text-green-400">
        Deposit USDT
      </h2>

      <div className="text-sm text-gray-400">
        Wallet Balance:{" "}
        {formatUnits(usdtBalance, 18)} USDT
      </div>

      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-3 rounded-xl bg-black/50 border border-white/10 focus:border-green-400 outline-none"
      />

      <input
        type="text"
        placeholder="Referrer address (optional)"
        value={referrer}
        onChange={(e) => setReferrer(e.target.value)}
        className="w-full p-3 rounded-xl bg-black/50 border border-white/10"
      />

      <div className="text-xs text-gray-400">
        Minimum Deposit:{" "}
        {formatUnits(minDeposit, 18)} USDT
      </div>

      {insufficientBalance && (
        <div className="text-red-400 text-xs">
          Insufficient USDT Balance
        </div>
      )}

      {belowMin && (
        <div className="text-yellow-400 text-xs">
          Below minimum deposit
        </div>
      )}

      {needsApproval ? (
        <button
          onClick={handleApprove}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-yellow-500 text-black font-semibold disabled:opacity-50"
        >
          {loading ? "Approving..." : "Approve USDT"}
        </button>
      ) : (
        <button
          onClick={handleDeposit}
          disabled={disableDeposit}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-green-400 to-blue-500 text-black font-semibold disabled:opacity-50"
        >
          {loading ? "Processing..." : "Deposit"}
        </button>
      )}
    </div>
  );
}