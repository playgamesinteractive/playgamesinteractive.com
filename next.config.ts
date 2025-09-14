import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  compiler: {
    removeConsole: true,
  },
};

export default nextConfig;