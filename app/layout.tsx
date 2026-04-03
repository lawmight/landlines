import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import Script from "next/script";

import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { env } from "@/lib/env";

import "./globals.css";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-display",
  display: "swap"
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
  display: "swap"
});

const siteUrl = "https://landlines-ten.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Landlines",
    template: "%s | Landlines"
  },
  description: "Private, invite-only voice and video calling for your inner circle.",
  openGraph: {
    title: "Landlines",
    description: "Private, invite-only voice and video calling for your inner circle.",
    images: ["/opengraph-image"],
    siteName: "Landlines",
    type: "website",
    url: siteUrl
  },
  twitter: {
    card: "summary_large_image",
    title: "Landlines",
    description: "Private, invite-only voice and video calling for your inner circle.",
    images: ["/opengraph-image"]
  }
};

/**
 * Root app layout with Clerk and Convex providers.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en" suppressHydrationWarning>
        <body className={`${displayFont.variable} ${bodyFont.variable} min-h-screen antialiased`}>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50">
            Skip to main content
          </a>
          <Providers>
            {children}
            <Toaster richColors position="top-right" />
          </Providers>
          {env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? (
            <Script
              async
              data-domain={env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
              defer
              src="https://plausible.io/js/script.js"
            />
          ) : null}
        </body>
      </html>
    </ClerkProvider>
  );
}
