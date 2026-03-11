"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { config } from "@/lib/wallet";

import HydrationProvider from "@/app/components/HydrationProvider";
import TransactionModal from "@/app/components/TransactionModal";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <HydrationProvider>
          <TransactionModal />
          {children}
        </HydrationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}