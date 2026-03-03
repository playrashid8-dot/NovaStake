"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTransactionStore } from "@/lib/useTransactionStore";

export default function TransactionModal() {
  const { open, hash, status, message, close } =
    useTransactionStore();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900 w-[90%] max-w-md p-6 rounded-2xl border border-white/10 space-y-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            <h2 className="text-xl font-bold">
              {status === "success"
                ? "Transaction Successful 🚀"
                : "Transaction Failed ❌"}
            </h2>

            <p className="text-gray-400">{message}</p>

            {hash && (
              <div className="space-y-2">
                <div className="text-xs text-gray-500 break-all">
                  {hash}
                </div>

                <a
                  href={`https://bscscan.com/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline text-sm"
                >
                  View on BscScan
                </a>
              </div>
            )}

            <button
              onClick={close}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-black font-semibold"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}