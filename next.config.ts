import type { NextConfig } from "next";

const LOOPBACK_HOSTS = ["localhost", "127.0.0.1"] as const;

function getAllowedConnectSources(): string {
  const sources = new Set(["'self'", "https:", "wss:", "ws:"]);
  const signalingBaseUrl = process.env.NEXT_PUBLIC_SIGNALING_BASE_URL;

  if (!signalingBaseUrl) {
    return Array.from(sources).join(" ");
  }

  try {
    const signalingUrl = new URL(signalingBaseUrl);
    sources.add(signalingUrl.origin);

    if (LOOPBACK_HOSTS.includes(signalingUrl.hostname as (typeof LOOPBACK_HOSTS)[number])) {
      for (const hostname of LOOPBACK_HOSTS) {
        const loopbackVariant = new URL(signalingBaseUrl);
        loopbackVariant.hostname = hostname;
        sources.add(loopbackVariant.origin);
      }
    }
  } catch {
    // Ignore malformed env values here; env validation covers the runtime app path.
  }

  return Array.from(sources).join(" ");
}

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data: https:",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
  "style-src 'self' 'unsafe-inline' https:",
  `connect-src ${getAllowedConnectSources()}`,
  "frame-src 'self' https:",
  "worker-src 'self' blob:"
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    localPatterns: [
      {
        pathname: "/assets/**",
        search: "?v=1"
      }
    ]
  },
  async headers() {
    const baseHeaders = [
      {
        key: "Content-Security-Policy",
        value: contentSecurityPolicy
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin"
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload"
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff"
      },
      {
        key: "Permissions-Policy",
        value: "camera=(self), microphone=(self), geolocation=()"
      }
    ];

    return [
      {
        source: "/:path*",
        headers: baseHeaders
      }
    ];
  }
};

export default nextConfig;
