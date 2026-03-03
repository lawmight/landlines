"use client";

import type { ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ThemeProvider } from "next-themes";

import { convex } from "@/lib/convex";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Wraps client providers shared by all routes.
 */
export function Providers({ children }: ProvidersProps): React.JSX.Element {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ThemeProvider>
  );
}
