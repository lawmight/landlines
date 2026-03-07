"use client";

import { useAuth } from "@clerk/nextjs";

interface AuthShowProps {
  when: "signed-in" | "signed-out";
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Renders children when auth state matches `when`; otherwise renders `fallback`.
 * Use instead of Clerk's SignedIn/SignedOut to avoid Turbopack RSC export issues with @clerk/nextjs.
 */
export function AuthShow({ when, fallback = null, children }: AuthShowProps): React.JSX.Element {
  const { isSignedIn } = useAuth();
  const show = when === "signed-in" ? isSignedIn : !isSignedIn;
  return <>{show ? children : fallback}</>;
}
