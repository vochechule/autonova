import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "lfmfxfazzkpvojhhmnhv.supabase.co",
    ],
    formats: ['image/webp', 'image/avif'], // Modern formats for better performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Ensure SCSS compilation works correctly
  sassOptions: {
    includePaths: ['./app/styles'],
  },
  // Better SEO and performance
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Add security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
};

export default nextConfig;
