"use client";

import { motion } from "framer-motion";

export default function GlobalLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0 }}
      className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500 z-50"
    />
  );
}