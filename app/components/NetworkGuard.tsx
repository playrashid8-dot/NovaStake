"use client";

import { useEffect, useState } from "react";
import { useChainId, useSwitchChain } from "wagmi";
import { bsc } from "wagmi/chains";

export default function NetworkGuard() {
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const [mounted, setMounted] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!chainId) return;
    if (chainId === bsc.id) return;
    if (switching) return;

    const switchToBSC = async () => {
      try {
        setSwitching(true);
        await switchChainAsync({ chainId: bsc.id });
      } catch {
        const ethereum = (window as any).ethereum;

        if (ethereum) {
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
        }
      } finally {
        setSwitching(false);
      }
    };

    switchToBSC();
  }, [chainId, mounted, switchChainAsync, switching]);

  if (!mounted) return null;

  if (chainId && chainId !== bsc.id) {
    return (
      <div className="fixed bottom-6 right-6 bg-red-600 text-white px-6 py-3 rounded-xl shadow-xl z-50 animate-pulse">
        ⚠ Wrong Network – Switching to BSC...
      </div>
    );
  }

  return null;
}