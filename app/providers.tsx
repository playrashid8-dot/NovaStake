"use client";

import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wallet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import NetworkGuard from "./components/NetworkGuard";
import GlobalLoader from "./components/GlobalLoader";
import ToastSystem from "./components/ToastSystem";

export default function Providers({ children }: any) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <NetworkGuard />
        <GlobalLoader />
        <ToastSystem />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}