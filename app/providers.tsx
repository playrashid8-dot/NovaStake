"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { config } from "@/lib/wallet";

import HydrationProvider from "@/app/components/HydrationProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <HydrationProvider>{children}</HydrationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}