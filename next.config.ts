import type { NextConfig } from "next";

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
  "connect-src 'self' https: wss: ws:",
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
      }
    ];

    return [
      {
        source: "/:path*",
        headers: baseHeaders
      },
      {
        source: "/call/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=()"
          }
        ]
      },
      {
        source: "/((?!call/).*)",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
