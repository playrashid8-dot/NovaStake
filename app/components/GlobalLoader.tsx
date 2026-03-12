"use client";

import { motion } from "framer-motion";

export default function GlobalLoader() {
  return (
    <div className="pointer-events-none fixed left-0 right-0 top-0 z-[9999] h-[3px] overflow-hidden">

      <div className="absolute inset-0 bg-white/10" />

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

      <motion.div
        initial={{ x: "-120%" }}
        animate={{ x: "130%" }}
        transition={{
          repeat: Infinity,
          duration: 0.9,
          ease: "linear",
        }}
        className="absolute h-full w-[15%] bg-white/30 blur-md"
      />

    </div>
  );
}