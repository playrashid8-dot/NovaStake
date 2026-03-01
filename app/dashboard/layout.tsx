"use client";

import BottomNav from "@/app/components/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div style={{ paddingBottom: "80px" }}>
        {children}
      </div>

      <BottomNav />
    </>
  );
}