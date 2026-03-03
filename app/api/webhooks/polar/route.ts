import { Webhooks } from "@polar-sh/nextjs";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function setTier(
  payload: { data: { customer: { externalId?: string | null } } },
  tier: "free" | "pro",
): Promise<void> {
  const externalId = payload.data.customer.externalId;
  if (!externalId) return;

  await convex.mutation(api.users.setSubscriptionTier, {
    userClerkId: externalId,
    subscriptionTier: tier,
  });
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onSubscriptionActive: async (payload) => setTier(payload as any, "pro"),
  onSubscriptionCanceled: async (payload) => setTier(payload as any, "free"),
  onSubscriptionRevoked: async (payload) => setTier(payload as any, "free"),
});
