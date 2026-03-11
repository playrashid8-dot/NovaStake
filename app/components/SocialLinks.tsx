"use client";

import { Send, MessageCircle } from "lucide-react";

export default function SocialLinks() {
  return (
    <div className="flex flex-wrap gap-3">
      
      {/* Telegram Channel */}
      <a
        href="https://t.me/Nova"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-400 to-blue-500 px-6 py-3 font-semibold text-black shadow-lg shadow-green-500/20 transition hover:opacity-90"
      >
        <Send size={18} />
        Telegram Channel
      </a>

      {/* WhatsApp Channel */}
      <a
        href="https://whatsapp.com/channel/0029"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-400 px-6 py-3 font-semibold text-black shadow-lg shadow-green-500/20 transition hover:opacity-90"
      >
        <MessageCircle size={18} />
        WhatsApp Channel
      </a>

    </div>
  );
}