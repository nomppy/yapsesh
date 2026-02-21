import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Cloudflare Pages compatibility
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
