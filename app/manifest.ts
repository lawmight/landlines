import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#080b12",
    description: "Private, invite-only voice and video calling for your inner circle.",
    display: "standalone",
    icons: [
      {
        sizes: "512x512",
        src: "/icon",
        type: "image/png"
      },
      {
        sizes: "180x180",
        src: "/apple-icon",
        type: "image/png"
      }
    ],
    name: "Landlines",
    short_name: "Landlines",
    start_url: "/",
    theme_color: "#080b12"
  };
}
