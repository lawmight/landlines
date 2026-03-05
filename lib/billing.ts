export const CHECKOUT_PLANS = ["monthly", "annual"] as const;

export type CheckoutPlan = (typeof CHECKOUT_PLANS)[number];
export type SubscriptionTier = "free" | "pro";

export function isCheckoutPlan(value: string | null | undefined): value is CheckoutPlan {
  return value === "monthly" || value === "annual";
}

export function buildCheckoutUrl(plan: CheckoutPlan): string {
  return `/api/checkout?plan=${plan}`;
}

export function resolvePriceIdForPlan(
  plan: CheckoutPlan,
  priceIds: {
    monthly?: string | null;
    annual?: string | null;
  },
): string | null {
  if (plan === "monthly") {
    return priceIds.monthly ?? null;
  }

  return priceIds.annual ?? null;
}

export function getClerkUserIdFromStripeObject(object: {
  client_reference_id?: string | null;
  metadata?: Record<string, string | undefined> | null;
}): string | null {
  return object.client_reference_id ?? object.metadata?.clerkUserId ?? null;
}

export function shouldActivateCheckoutSession(session: {
  mode?: string | null;
  payment_status?: string | null;
}): boolean {
  if (session.mode !== "subscription") {
    return false;
  }

  return session.payment_status === "paid" || session.payment_status === "no_payment_required";
}

export function subscriptionTierForStripeStatus(status: string): SubscriptionTier | null {
  if (status === "active" || status === "trialing") {
    return "pro";
  }

  if (status === "canceled" || status === "incomplete_expired" || status === "unpaid") {
    return "free";
  }

  return null;
}
