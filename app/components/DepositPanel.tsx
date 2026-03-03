"use client";

import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useSimulateContract,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import {
  NOVADEFI_ADDRESS,
  NOVADEFI_ABI,
  USDT_ADDRESS,
  ERC20_ABI,
} from "@/lib/web3";

export default function DepositPanel() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [amount, setAmount] = useState("");
  const [referrer, setReferrer] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= PARSE AMOUNT ================= */

  const parsedAmount =
    amount && Number(amount) > 0
      ? parseUnits(amount, 18)
      : undefined;

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

  const { data: allowanceData } = useReadContract({
    address: USDT_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, NOVADEFI_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  const currentAllowance =
    typeof allowanceData === "bigint"
      ? allowanceData
      : 0n;

  const needsApproval =
    parsedAmount !== undefined &&
    currentAllowance < parsedAmount;

  /* ================= GAS ESTIMATION ================= */

  const { data: simulation } = useSimulateContract({
    address: NOVADEFI_ADDRESS,
    abi: NOVADEFI_ABI,
    functionName: "deposit",
    args:
      parsedAmount !== undefined
        ? [
            parsedAmount,
            referrer ||
              "0x0000000000000000000000000000000000000000",
          ]
        : undefined,
    query: {
      enabled: !!parsedAmount && isConnected,
    },
  });

  const estimatedGas = simulation?.request?.gas;

  /* ================= ACTIONS ================= */

  async function handleApprove() {
    if (!parsedAmount) return;

    try {
      setLoading(true);

      await writeContractAsync({
        address: USDT_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [NOVADEFI_ADDRESS, parsedAmount],
      });

      alert("Approval successful ✅");
    } catch (err) {
      alert("Approval failed ❌");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeposit() {
    if (!parsedAmount) return;

    if (parsedAmount < minDeposit) {
      alert(
        `Minimum deposit is ${formatUnits(minDeposit, 18)} USDT`
      );
      return;
    }

    try {
      setLoading(true);

      await writeContractAsync({
        address: NOVADEFI_ADDRESS,
        abi: NOVADEFI_ABI,
        functionName: "deposit",
        args: [
          parsedAmount,
          referrer ||
            "0x0000000000000000000000000000000000000000",
        ],
      });

      alert("Deposit successful 🚀");
      setAmount("");
      setReferrer("");
    } catch (err) {
      alert("Deposit failed ❌");
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */

  if (!isConnected) {
    return (
      <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
        Please connect wallet
      </div>
    );
  }

  return (
    <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 space-y-4">

      <h2 className="text-xl font-bold text-green-400">
        Deposit USDT
      </h2>

      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
      />

      <input
        type="text"
        placeholder="Referrer address (optional)"
        value={referrer}
        onChange={(e) => setReferrer(e.target.value)}
        className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
      />

      {estimatedGas && (
        <div className="text-xs text-gray-400">
          Estimated Gas: {estimatedGas.toString()}
        </div>
      )}

      {needsApproval ? (
        <button
          onClick={handleApprove}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-yellow-500 text-black font-semibold"
        >
          {loading ? "Approving..." : "Approve USDT"}
        </button>
      ) : (
        <button
          onClick={handleDeposit}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-black font-semibold"
        >
          {loading ? "Processing..." : "Deposit"}
        </button>
      )}
    </div>
  );
}