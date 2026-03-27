import type { NextConfig } from "next";

const imageHosts = new Map<string, Set<string>>();

const addImageHost = (protocol: string, hostname: string) => {
  const normalizedProtocol = protocol.replace(":", "");
  const protocolHosts = imageHosts.get(normalizedProtocol) ?? new Set<string>();
  protocolHosts.add(hostname);
  imageHosts.set(normalizedProtocol, protocolHosts);
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

addImageHost("https", "lfmfxfazzkpvojhhmnhv.supabase.co");

if (apiUrl) {
  try {
    const { protocol, hostname } = new URL(apiUrl);
    addImageHost(protocol, hostname);

    if (
      hostname.includes(".") &&
      hostname !== "localhost" &&
      !hostname.startsWith("www.")
    ) {
      addImageHost(protocol, `www.${hostname}`);
    }
  } catch {
    // Ignore invalid env values and keep static host allowlist.
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: Array.from(imageHosts.entries()).flatMap(
      ([protocol, hostnames]) =>
        Array.from(hostnames).map((hostname) => ({
          protocol: protocol as "http" | "https",
          hostname,
          pathname: "/**",
        })),
    ),
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
    ];
  },
};

export default nextConfig;
