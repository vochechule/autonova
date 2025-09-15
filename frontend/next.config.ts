import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "lfmfxfazzkpvojhhmnhv.supabase.co",
    ],
  },
  // Ensure SCSS compilation works correctly
  sassOptions: {
    includePaths: ['./app/styles'],
  },
  // Ensure CSS is not purged incorrectly
  experimental: {
    optimizeCss: false,
  },
};

export default nextConfig;
