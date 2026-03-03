"use client";

import { useConnect } from "wagmi";
import { X } from "lucide-react";

export default function WalletModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { connectors, connect } = useConnect();

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1a1a3c] p-6 rounded-2xl w-80 shadow-xl relative">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold mb-6 text-center">
          Connect Wallet
        </h2>

        <div className="space-y-4">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => {
                connect({ connector });
                onClose();
              }}
              className="w-full py-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl font-semibold text-black hover:opacity-90 transition"
            >
              {connector.name}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}