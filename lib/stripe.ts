import Stripe from "stripe";
import { cache } from "react";

import { env, landlinesAnnualPriceId } from "@/lib/env";

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe {
  if (stripeClient) {
    return stripeClient;
  }

  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is required.");
  }

  stripeClient = new Stripe(env.STRIPE_SECRET_KEY);
  return stripeClient;
}

export interface PriceTier {
  amount: number;
  currency: string;
  interval: "month" | "year";
}

export interface ProPrices {
  monthly: PriceTier | null;
  annual: PriceTier | null;
}

function mapPriceTier(
  price: Stripe.Price,
  fallbackInterval: "month" | "year",
): PriceTier | null {
  if (price.unit_amount === null) {
    return null;
  }

  return {
    amount: price.unit_amount / 100,
    currency: price.currency,
    interval:
      price.recurring?.interval === "year"
        ? "year"
        : price.recurring?.interval === "month"
          ? "month"
          : fallbackInterval,
  };
}

export const getProPrices = cache(async (): Promise<ProPrices> => {
  const monthlyId = env.LANDLINES_MONTHLY_PRICE_ID;
  const annualId = landlinesAnnualPriceId();

  if (!env.STRIPE_SECRET_KEY || (!monthlyId && !annualId)) {
    return { monthly: null, annual: null };
  }

  try {
    const stripe = getStripeClient();
    const [monthlyPrice, annualPrice] = await Promise.all([
      monthlyId ? stripe.prices.retrieve(monthlyId) : Promise.resolve(null),
      annualId ? stripe.prices.retrieve(annualId) : Promise.resolve(null),
    ]);

    return {
      monthly: monthlyPrice ? mapPriceTier(monthlyPrice, "month") : null,
      annual: annualPrice ? mapPriceTier(annualPrice, "year") : null,
    };
  } catch (error) {
    console.error("Failed to fetch Stripe prices:", error);
    return { monthly: null, annual: null };
  }
});

export function stripe(): Stripe {
  return getStripeClient();
}

export const STRIPE_MANAGED_PAYMENTS_API_VERSION = "2026-03-04.preview";
