"use client";

import type { ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";

import { convex } from "@/lib/convex";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Wraps client providers shared by all routes.
 */
export function Providers({ children }: ProvidersProps): React.JSX.Element {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
