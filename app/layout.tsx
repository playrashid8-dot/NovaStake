"use client";

import "./globals.css";

import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wallet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "@/app/components/Navbar";
import { ReactNode, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // ✅ Prevent double QueryClient creation
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-[#0f0c29] via-[#1a1a3c] to-[#24243e] text-white min-h-screen">

        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>

            {/* 🔥 Global Navbar */}
            <Navbar />

            {/* 🔥 Page Content */}
            {children}

          </QueryClientProvider>
        </WagmiProvider>

      </body>
    </html>
  );
}