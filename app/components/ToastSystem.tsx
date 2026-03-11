"use client";

import { useEffect } from "react";
import { useToastStore } from "@/lib/useToastStore";
import { CheckCircle, XCircle, Info } from "lucide-react";

export default function ToastSystem() {
  const { message, type, show, closeToast } = useToastStore();

  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(() => {
      closeToast();
    }, 3000);

    return () => clearTimeout(timer);
  }, [show, closeToast]);

  if (!show) return null;

  const color =
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : "bg-blue-600";

  const icon =
    type === "success" ? (
      <CheckCircle size={18} />
    ) : type === "error" ? (
      <XCircle size={18} />
    ) : (
      <Info size={18} />
    );

  return (
    <div className="pointer-events-none fixed left-4 right-4 top-5 z-[100] md:left-auto md:right-6">
      <div
        role="alert"
        className={`pointer-events-auto flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-xl animate-[fadeIn_0.25s_ease] ${color}`}
      >
        {icon}
        <span>{message || "Notification"}</span>
      </div>
    </div>
  );
}