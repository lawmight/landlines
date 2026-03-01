import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    localPatterns: [
      {
        pathname: "/assets/**",
        search: "?v=1"
      }
    ]
  },
  experimental: {
    typedRoutes: true
  }
};

export default nextConfig;
