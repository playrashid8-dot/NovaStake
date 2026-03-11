// next.config.ts
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // ✅ Force turbopack root to this project
    root: path.join(__dirname),
  },
};

export default nextConfig;