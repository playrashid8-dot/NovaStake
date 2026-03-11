"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { X, Wallet, Loader2, AlertTriangle } from "lucide-react";
import { useToastStore } from "@/lib/useToastStore";

type WalletModalProps = {
  open?: boolean;
  onClose?: () => void;
  triggerLabel?: string;
  className?: string;
};

export default function WalletModal({
  open,
  onClose,
  triggerLabel = "Connect Wallet",
  className = "",
}: WalletModalProps) {
  const { isConnected } = useAccount();
  const { connectors, connectAsync, isPending } = useConnect();
  const { openToast } = useToastStore();

  const [internalOpen, setInternalOpen] = useState(false);
  const [loadingUid, setLoadingUid] = useState<string | null>(null);

  const isControlled = typeof open === "boolean";
  const modalOpen = isControlled ? open : internalOpen;

  function handleClose() {
    if (onClose) onClose();
    if (!isControlled) setInternalOpen(false);
  }

  function handleOpen() {
    if (!isControlled) setInternalOpen(true);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }

    if (modalOpen) {
      window.addEventListener("keydown", onKey);
    }

    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  useEffect(() => {
    if (isConnected && modalOpen) {
      handleClose();
    }
  }, [isConnected, modalOpen]);

  const sortedConnectors = useMemo(() => {
    const list = [...connectors];

    list.sort((a, b) => {
      const getScore = (name: string, type?: string) => {
        const lower = name.toLowerCase();

        if (type === "injected") return 0;
        if (lower.includes("walletconnect")) return 1;
        if (lower.includes("coinbase")) return 2;
        return 3;
      };

      return getScore(a.name, a.type) - getScore(b.name, b.type);
    });

    return list;
  }, [connectors]);

  async function handleConnect(connector: (typeof connectors)[number]) {
    if (isPending || loadingUid) return;

    try {
      setLoadingUid(connector.uid);

      const anyConn: any = connector;
      const isWalletConnect = connector.name
        .toLowerCase()
        .includes("walletconnect");

      if (!isWalletConnect && anyConn?.ready === false) {
        openToast(`${connector.name} not available on this device`, "error");
        return;
      }

      await connectAsync({ connector });
      openToast("Wallet connected ✅", "success");
    } catch (err: any) {
      openToast(
        err?.shortMessage || err?.message || "Wallet connect failed",
        "error"
      );
    } finally {
      setLoadingUid(null);
    }
  }

  return (
    <>
      {!isControlled && !isConnected && (
        <button
          type="button"
          onClick={handleOpen}
          className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-400 to-blue-500 px-6 py-3 font-semibold text-black transition hover:opacity-90 ${className}`}
        >
          <Wallet size={18} />
          {triggerLabel}
        </button>
      )}

      {!modalOpen ? null : (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0b0b12] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute right-3 top-3 text-gray-400 transition hover:text-white"
              aria-label="Close"
              type="button"
            >
              <X size={18} />
            </button>

            <div className="flex items-center justify-center gap-2">
              <Wallet className="text-green-300" size={18} />
              <h2 className="text-center text-xl font-extrabold text-white">
                Connect Wallet
              </h2>
            </div>

            <p className="mt-2 text-center text-xs text-gray-400">
              Choose a wallet to continue on BNB Chain
            </p>

            <div className="mt-5 space-y-3">
              {sortedConnectors.map((connector) => {
                const anyConn: any = connector;
                const isWalletConnect = connector.name
                  .toLowerCase()
                  .includes("walletconnect");
                const notReady = !isWalletConnect && anyConn?.ready === false;
                const loading = loadingUid === connector.uid;

                return (
                  <button
                    key={connector.uid}
                    onClick={() => handleConnect(connector)}
                    disabled={notReady || loading || isPending}
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-400 to-blue-500 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Connecting...
                      </>
                    ) : notReady ? (
                      <>
                        <AlertTriangle size={18} />
                        {connector.name} (Not available)
                      </>
                    ) : (
                      connector.name
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 text-center text-[11px] text-gray-500">
              Tap outside or press ESC to close
            </div>
          </div>
        </div>
      )}
    </>
  );
}