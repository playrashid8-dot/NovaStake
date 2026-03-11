"use client";

import { motion } from "framer-motion";

export default function GlobalLoader() {
  return (
    <div className="pointer-events-none fixed top-0 left-0 right-0 z-[9999] h-[3px] overflow-hidden">

      {/* background line */}
      <div className="absolute inset-0 bg-white/10" />

      {/* animated bar */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "120%" }}
        transition={{
          repeat: Infinity,
          duration: 1.1,
          ease: "linear",
        }}
        className="absolute h-full w-[35%] bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 blur-[0.2px]"
      />

      {/* glow */}
      <motion.div
        initial={{ x: "-120%" }}
        animate={{ x: "130%" }}
        transition={{
          repeat: Infinity,
          duration: 1.1,
          ease: "linear",
        }}
        className="absolute h-full w-[15%] bg-white/30 blur-md"
      />

    </div>
  );
}