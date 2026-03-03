import type { MetadataRoute } from "next";

const siteUrl = "https://landlines-ten.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    host: siteUrl,
    rules: [
      {
        allow: "/",
        disallow: ["/dashboard", "/call", "/settings", "/invites"],
        userAgent: "*"
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
