import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import { Providers } from "@/components/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Landlines",
  description: "Private, invite-only voice and video calling for your inner circle."
};

/**
 * Root app layout with Clerk and Convex providers.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen antialiased">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
