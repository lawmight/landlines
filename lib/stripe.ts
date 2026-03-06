import { cache } from "react";
import Stripe from "stripe";

import { env } from "@/lib/env";

export interface PriceTier {
  priceId: string;
  productName: string;
  amount: number;
  currency: string;
  interval: "month" | "year";
}

export interface ProPrices {
  monthly: PriceTier | null;
  annual: PriceTier | null;
}

function createStripeClient(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) {
    return null;
  }

  return new Stripe(env.STRIPE_SECRET_KEY);
}

export const stripe = createStripeClient();

export function configuredStripePriceIds(): string[] {
  return [env.STRIPE_PRO_MONTHLY_PRICE_ID, env.STRIPE_PRO_ANNUAL_PRICE_ID].filter(
    (value): value is string => Boolean(value),
  );
}

export function isConfiguredStripePriceId(priceId: string): boolean {
  return configuredStripePriceIds().includes(priceId);
}

function normalizeInterval(interval?: Stripe.Price.Recurring.Interval | null): "month" | "year" | null {
  if (interval === "month" || interval === "year") {
    return interval;
  }

  return null;
}

async function resolvePrice(priceId: string): Promise<PriceTier | null> {
  if (!stripe) {
    return null;
  }

  const price = await stripe.prices.retrieve(priceId, {
    expand: ["product"],
  });

  const interval = normalizeInterval(price.recurring?.interval);
  if (!price.active || price.unit_amount === null || !interval) {
    return null;
  }

  const productName =
    typeof price.product === "string" || price.product.deleted
      ? "Landlines Pro"
      : (price.product.name ?? "Landlines Pro");

  return {
    priceId: price.id,
    productName,
    amount: price.unit_amount / 100,
    currency: price.currency,
    interval,
  };
}

export const getProPrices = cache(async (): Promise<ProPrices> => {
  const monthlyId = env.STRIPE_PRO_MONTHLY_PRICE_ID;
  const annualId = env.STRIPE_PRO_ANNUAL_PRICE_ID;

  if (!monthlyId && !annualId) {
    return { monthly: null, annual: null };
  }

  try {
    const [monthly, annual] = await Promise.all([
      monthlyId ? resolvePrice(monthlyId) : Promise.resolve(null),
      annualId ? resolvePrice(annualId) : Promise.resolve(null),
    ]);

    return { monthly, annual };
  } catch (error) {
    console.error("Failed to fetch Stripe prices:", error);
    return { monthly: null, annual: null };
  }
});
