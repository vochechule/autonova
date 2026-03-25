import type { NextConfig } from "next";

const imageDomains = new Set(["lfmfxfazzkpvojhhmnhv.supabase.co"]);

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (apiUrl) {
  try {
    const { hostname } = new URL(apiUrl);
    imageDomains.add(hostname);

    if (
      hostname.includes(".") &&
      hostname !== "localhost" &&
      !hostname.startsWith("www.")
    ) {
      imageDomains.add(`www.${hostname}`);
    }
  } catch {
    // Ignore invalid env values and keep static host allowlist.
  }
}

const nextConfig: NextConfig = {
  images: {
    domains: Array.from(imageDomains),
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 86400,
    dangerouslyAllowSVG: false,
  },
  sassOptions: {
    includePaths: ['./app/styles'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
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
      {
        // Cache optimized images longer to reduce transformations
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=31536000, immutable',
          },
        ],
      },
    ]
  },
  
  // ✅ Remove problematic experimental features
  experimental: {
    // ❌ Remove this - it's causing the critters error
    // optimizeCss: true,
    scrollRestoration: true,
  },
};

export default nextConfig;
