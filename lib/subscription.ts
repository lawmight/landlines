import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { redirect } from "next/navigation";

import { api } from "@/convex/_generated/api";
import type { SubscriptionTier } from "@/lib/billing";
import { env } from "@/lib/env";

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

/**
 * Returns the current user's subscription tier from Convex, or null if unauthenticated
 * or the user is not yet synced to Convex (no profile).
 */
export async function getSubscriptionTierForRequest(): Promise<SubscriptionTier | null> {
  const { userId, getToken } = await auth();
  if (!userId) {
    return null;
  }

  const token = await getToken({ template: "convex" });
  if (!token) {
    return null;
  }

  convex.setAuth(token);
  const profile = await convex.query(api.users.getProfile, {});

  if (!profile) {
    return null;
  }

  return profile.subscriptionTier;
}

/**
 * Ensures the current user has a Pro subscription. If not (free, unauthenticated, or
 * no Convex profile), redirects to /settings so they can upgrade via BillingCard.
 * Call from Server Components only (uses redirect()).
 */
export async function requirePro(): Promise<void> {
  const tier = await getSubscriptionTierForRequest();
  if (tier !== "pro") {
    redirect("/settings");
  }
}
