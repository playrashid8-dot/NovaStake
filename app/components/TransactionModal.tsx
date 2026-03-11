"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";
import { useTransactionStore } from "@/lib/useTransactionStore";

function cn(...a: (string | false | undefined)[]) {
  return a.filter(Boolean).join(" ");
}

export default function TransactionModal() {
  const { open, hash, status, message, close } = useTransactionStore();

  const isLoading = status === "loading" || status === "pending";
  const isSuccess = status === "success";
  const isError = status === "error";

  const title = isLoading
    ? "Transaction Pending"
    : isSuccess
    ? "Transaction Successful"
    : isError
    ? "Transaction Failed"
    : "Transaction";

  const icon = isLoading ? (
    <Loader2 className="animate-spin text-yellow-300" size={22} />
  ) : isSuccess ? (
    <CheckCircle2 className="text-green-300" size={22} />
  ) : isError ? (
    <XCircle className="text-red-300" size={22} />
  ) : null;

  const badgeClass = isLoading
    ? "border-yellow-500/30 bg-yellow-500/15 text-yellow-200"
    : isSuccess
    ? "border-green-500/30 bg-green-500/15 text-green-200"
    : isError
    ? "border-red-500/30 bg-red-500/15 text-red-200"
    : "border-white/10 bg-white/5 text-white/70";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md space-y-4 rounded-3xl border border-white/10 bg-[#0b0b12] p-6 shadow-2xl"
            initial={{ scale: 0.94, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 12 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={cn("rounded-2xl border p-2.5", badgeClass)}>
                  {icon}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">{title}</h2>
                  <p className="mt-1 text-sm text-white/55">
                    {message || (isLoading ? "Please wait while the transaction is being processed." : "Transaction update")}
                  </p>
                </div>
              </div>
            </div>

            {hash ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-white/45">Transaction Hash</div>
                <div className="mt-2 break-all text-xs text-white/75">{hash}</div>

                <a
                  href={`https://bscscan.com/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-300 hover:text-blue-200"
                >
                  View on BscScan
                  <ExternalLink size={14} />
                </a>
              </div>
            ) : null}

            <button
              type="button"
              onClick={close}
              className="w-full rounded-2xl bg-gradient-to-r from-green-400 to-blue-500 py-3 font-semibold text-black transition hover:opacity-95"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}