import { clerkClient } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import type Stripe from "stripe";

import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export interface StripeBillingMetadata {
  stripeCheckoutCompletedAt?: number | null;
  stripeCustomerId?: string | null;
  stripePriceId?: string | null;
  stripeSubscriptionId?: string | null;
  stripeSubscriptionStatus?: string | null;
}

interface StripeBillingState extends StripeBillingMetadata {
  subscriptionTier: "free" | "pro";
  userClerkId: string;
}

function asMetadata(value: unknown): StripeBillingMetadata {
  if (!value || typeof value !== "object") {
    return {};
  }

  return value as StripeBillingMetadata;
}

export function subscriptionStatusToTier(status?: string | null): "free" | "pro" {
  switch (status) {
    case "active":
    case "past_due":
    case "trialing":
      return "pro";
    default:
      return "free";
  }
}

export function checkoutSessionClerkId(session: Stripe.Checkout.Session): string | null {
  return session.client_reference_id ?? session.metadata?.clerkUserId ?? null;
}

export function primarySubscriptionPriceId(subscription: Stripe.Subscription): string | null {
  return subscription.items.data[0]?.price.id ?? null;
}

export function checkoutSessionCustomerId(session: Stripe.Checkout.Session): string | null {
  if (!session.customer) {
    return null;
  }

  return typeof session.customer === "string" ? session.customer : session.customer.id;
}

export function checkoutSessionSubscriptionId(session: Stripe.Checkout.Session): string | null {
  if (!session.subscription) {
    return null;
  }

  return typeof session.subscription === "string" ? session.subscription : session.subscription.id;
}

export function checkoutSessionPriceId(session: Stripe.Checkout.Session): string | null {
  if (session.metadata?.priceId) {
    return session.metadata.priceId;
  }

  if (session.subscription && typeof session.subscription !== "string") {
    return primarySubscriptionPriceId(session.subscription);
  }

  return null;
}

export async function getStripeBillingMetadata(userClerkId: string): Promise<StripeBillingMetadata> {
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userClerkId);
  return asMetadata(user.privateMetadata);
}

export async function persistStripeBillingMetadata(
  userClerkId: string,
  patch: StripeBillingMetadata,
): Promise<void> {
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userClerkId);
  const current = asMetadata(user.privateMetadata);

  await clerk.users.updateUserMetadata(userClerkId, {
    privateMetadata: {
      ...current,
      ...patch,
    },
  });
}

export async function syncStripeBillingState(state: StripeBillingState): Promise<void> {
  await convex.mutation(api.users.setSubscriptionTier, {
    userClerkId: state.userClerkId,
    subscriptionTier: state.subscriptionTier,
  });

  await persistStripeBillingMetadata(state.userClerkId, {
    stripeCheckoutCompletedAt: state.subscriptionTier === "pro" ? Date.now() : null,
    stripeCustomerId: state.stripeCustomerId ?? null,
    stripePriceId: state.stripePriceId ?? null,
    stripeSubscriptionId: state.stripeSubscriptionId ?? null,
    stripeSubscriptionStatus: state.stripeSubscriptionStatus ?? null,
  });
}

export async function resolveStripeCustomerIdForUser(input: {
  stripe: Stripe;
  userClerkId: string;
  email?: string | null;
}): Promise<string | null> {
  const metadata = await getStripeBillingMetadata(input.userClerkId);
  if (metadata.stripeCustomerId) {
    return metadata.stripeCustomerId;
  }

  if (!input.email) {
    return null;
  }

  const customers = await input.stripe.customers.list({
    email: input.email,
    limit: 10,
  });

  const match = customers.data.find((customer) => {
    if (customer.deleted) {
      return false;
    }

    return customer.email === input.email;
  });

  return match?.id ?? null;
}
