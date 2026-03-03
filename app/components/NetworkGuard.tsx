"use client";

import { useEffect } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { bsc } from "wagmi/chains";

export default function NetworkGuard() {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (chain && chain.id !== bsc.id) {
      switchChain({ chainId: bsc.id });
    }
  }, [chain, switchChain]);

  return null;
}