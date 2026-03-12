"use client";

import { useEffect, useState } from "react";
import GlobalLoader from "@/app/components/GlobalLoader";

export default function HydrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-black text-sm text-gray-400">
        <GlobalLoader />
        <span className="animate-pulse">Loading NovaStake...</span>
      </div>
    );
  }

  return <>{children}</>;
}