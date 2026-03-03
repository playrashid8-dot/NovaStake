"use client";

import "./globals.css";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wallet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import Navbar from "@/app/components/Navbar";
import NetworkGuard from "@/app/components/NetworkGuard";
import TransactionModal from "./components/TransactionModal";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-[#0f0c29] via-[#1a1a3c] to-[#24243e] text-white min-h-screen">

        <WagmiProvider config={config}>
  <QueryClientProvider client={queryClient}>
    <NetworkGuard />
    <Navbar />

    <TransactionModal />   {/* 👈 YAHAN */}

    {children}
  </QueryClientProvider>
</WagmiProvider>

      </body>
    </html>
  );
}