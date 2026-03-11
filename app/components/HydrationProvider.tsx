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
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  if (!mounted) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-black text-sm text-gray-400">
        <GlobalLoader />
        Loading NovaStake...
      </div>
    );
  }

  return <>{children}</>;
}