"use client";

import BottomNav from "@/app/components/BottomNav";
import ToastSystem from "@/app/components/ToastSystem";
import TransactionModal from "@/app/components/TransactionModal";
import NetworkGuard from "@/app/components/NetworkGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NetworkGuard>
      <div className="min-h-screen w-full">
        <div className="mx-auto max-w-6xl px-3 py-4 pb-24 md:px-6 md:pb-6">
          {children}
        </div>

        <BottomNav />

        <ToastSystem />
        <TransactionModal />
      </div>
    </NetworkGuard>
  );
}