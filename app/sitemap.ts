import type { MetadataRoute } from "next";

const siteUrl = "https://landlines-ten.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 1,
      url: siteUrl
    }
  ];
}
