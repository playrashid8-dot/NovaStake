"use client";

import Navbar from "@/app/components/Navbar";
import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

import GlobalLoader from "@/app/components/GlobalLoader";
import NetworkGuard from "@/app/components/NetworkGuard";

const DashboardContent = dynamic(() => import("./DashboardContent"), {
  ssr: false,
});

export default function DashboardPage() {
  const { isConnected, isConnecting } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnecting && !isConnected) {
      router.replace("/");
    }
  }, [isConnected, isConnecting, router]);

  if (isConnecting) {
    return <GlobalLoader />;
  }

  if (!isConnected) {
    return null;
  }

  return (
    <main className="min-h-screen">
      <Navbar />

      <NetworkGuard>
        <Suspense fallback={<GlobalLoader />}>
          <DashboardContent />
        </Suspense>
      </NetworkGuard>
    </main>
  );
}