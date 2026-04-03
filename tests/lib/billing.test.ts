import { describe, expect, it } from "vitest";

import {
  buildCheckoutUrl,
  getClerkUserIdFromStripeObject,
  isCheckoutPlan,
  resolvePriceIdForPlan,
  shouldActivateCheckoutSession,
  subscriptionTierForStripeStatus,
} from "@/lib/billing";

describe("billing helpers", () => {
  it("validates known checkout plans", () => {
    expect(isCheckoutPlan("monthly")).toBe(true);
    expect(isCheckoutPlan("annual")).toBe(true);
    expect(isCheckoutPlan("weekly")).toBe(false);
    expect(isCheckoutPlan(null)).toBe(false);
  });

  it("builds checkout URLs from plan slugs", () => {
    expect(buildCheckoutUrl("monthly")).toBe("/api/checkout?plan=monthly");
    expect(buildCheckoutUrl("annual")).toBe("/api/checkout?plan=annual");
  });

  it("resolves the right Stripe price for each plan", () => {
    expect(
      resolvePriceIdForPlan("monthly", {
        monthly: "price_month",
        annual: "price_year",
      }),
    ).toBe("price_month");

    expect(
      resolvePriceIdForPlan("annual", {
        monthly: "price_month",
        annual: "price_year",
      }),
    ).toBe("price_year");
  });

  it("extracts the Clerk id from Stripe objects", () => {
    expect(
      getClerkUserIdFromStripeObject({
        client_reference_id: "user_123",
        metadata: {
          clerkUserId: "user_meta",
        },
      }),
    ).toBe("user_123");

    expect(
      getClerkUserIdFromStripeObject({
        metadata: {
          clerkUserId: "user_meta",
        },
      }),
    ).toBe("user_meta");

    expect(getClerkUserIdFromStripeObject({})).toBeNull();
  });

  it("activates only paid subscription checkout sessions", () => {
    expect(
      shouldActivateCheckoutSession({
        mode: "subscription",
        payment_status: "paid",
      }),
    ).toBe(true);

    expect(
      shouldActivateCheckoutSession({
        mode: "subscription",
        payment_status: "no_payment_required",
      }),
    ).toBe(true);

    expect(
      shouldActivateCheckoutSession({
        mode: "subscription",
        payment_status: "unpaid",
      }),
    ).toBe(false);

    expect(
      shouldActivateCheckoutSession({
        mode: "payment",
        payment_status: "paid",
      }),
    ).toBe(false);
  });

  it("maps Stripe subscription states to app tiers", () => {
    expect(subscriptionTierForStripeStatus("active")).toBe("pro");
    expect(subscriptionTierForStripeStatus("trialing")).toBe("pro");
    expect(subscriptionTierForStripeStatus("canceled")).toBe("free");
    expect(subscriptionTierForStripeStatus("unpaid")).toBe("free");
    expect(subscriptionTierForStripeStatus("past_due")).toBeNull();
  });
});
