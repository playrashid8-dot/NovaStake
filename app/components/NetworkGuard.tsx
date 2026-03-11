"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { bsc } from "wagmi/chains";
import { AlertTriangle } from "lucide-react";

type NetworkGuardProps = {
  children?: React.ReactNode;
};

export default function NetworkGuard({ children }: NetworkGuardProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const [mounted, setMounted] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  async function switchToBSC() {
    if (switching) return;

    try {
      setSwitching(true);
      setErrorMsg("");
      setManualMode(false);

      await switchChainAsync({ chainId: bsc.id });
    } catch (e: any) {
      setManualMode(true);

      setErrorMsg(
        e?.shortMessage ||
          e?.message ||
          "Automatic network switch failed."
      );
    } finally {
      setSwitching(false);
    }
  }

  async function addAndSwitchBSC() {
    try {
      const ethereum = (window as any).ethereum;

      if (!ethereum) {
        setErrorMsg("No wallet provider detected.");
        return;
      }

      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x38",
            chainName: "BNB Smart Chain",
            rpcUrls: ["https://bsc-dataseed.binance.org/"],
            nativeCurrency: {
              name: "BNB",
              symbol: "BNB",
              decimals: 18,
            },
            blockExplorerUrls: ["https://bscscan.com"],
          },
        ],
      });

      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x38" }],
      });

      setManualMode(false);
      setErrorMsg("");
    } catch (e: any) {
      setErrorMsg(
        e?.shortMessage ||
          e?.message ||
          "Failed to add or switch to BSC."
      );
    }
  }

  useEffect(() => {
    if (!mounted) return;
    if (!isConnected) return;
    if (!chainId) return;
    if (chainId === bsc.id) return;

    switchToBSC();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isConnected, chainId]);

  if (!mounted) return null;

  const wrongNetwork = Boolean(isConnected && chainId && chainId !== bsc.id);

  if (!wrongNetwork) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-[#0b0b12] p-6 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 rounded-xl bg-red-500/15 p-3 text-red-300">
              <AlertTriangle size={24} />
            </div>

            <h2 className="text-2xl font-extrabold text-white">
              Wrong Network
            </h2>

            <p className="mt-2 text-sm text-white/70">
              Please switch to{" "}
              <span className="font-semibold text-white">
                BNB Smart Chain (BSC)
              </span>{" "}
              to continue using NovaStake.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={switchToBSC}
              disabled={switching}
              className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {switching ? "Switching..." : "Switch to BSC"}
            </button>

            {manualMode && (
              <button
                type="button"
                onClick={addAndSwitchBSC}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Add BSC + Switch
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-100/80">
              {errorMsg}
            </div>
          )}
        </div>
      </div>
    </>
  );
}