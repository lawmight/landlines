import { Polar } from "@polar-sh/sdk";
import { cache } from "react";

import { env } from "@/lib/env";

function createPolarClient(): Polar {
  if (!env.POLAR_ACCESS_TOKEN) {
    throw new Error("POLAR_ACCESS_TOKEN is required.");
  }
  return new Polar({
    accessToken: env.POLAR_ACCESS_TOKEN,
    server: "production",
  });
}

export const polar = createPolarClient();

export interface PriceTier {
  productId: string;
  amount: number;
  currency: string;
  interval: "month" | "year";
}

export interface ProPrices {
  monthly: PriceTier | null;
  annual: PriceTier | null;
}

/**
 * Fetches Pro product prices from the Polar API.
 * Matches products by the IDs stored in env vars, then reads the first
 * fixed price from each matched product. Deduplicates within a single
 * React server-component render via `cache()`.
 */
export const getProPrices = cache(async (): Promise<ProPrices> => {
  const monthlyId = env.POLAR_PRO_MONTHLY_PRICE_ID;
  const annualId = env.POLAR_PRO_ANNUALLY_PRICE_ID;

  if (!monthlyId && !annualId) {
    return { monthly: null, annual: null };
  }

  try {
    const { result } = await polar.products.list({});
    let monthly: PriceTier | null = null;
    let annual: PriceTier | null = null;

    for (const product of result.items) {
      const p = product as any;
      const firstPrice = p.prices?.[0];
      const amount =
        firstPrice && "priceAmount" in firstPrice
          ? firstPrice.priceAmount / 100
          : null;
      const currency =
        firstPrice && "priceCurrency" in firstPrice
          ? firstPrice.priceCurrency
          : "usd";

      if (amount === null) continue;

      const isMatch = (id: string | undefined) =>
        id &&
        (p.id === id ||
          p.prices?.some((pr: any) => pr.id === id));

      if (isMatch(monthlyId)) {
        monthly = {
          productId: p.id,
          amount,
          currency,
          interval: p.recurringInterval === "year" ? "year" : "month",
        };
      }

      if (isMatch(annualId)) {
        annual = {
          productId: p.id,
          amount,
          currency,
          interval: p.recurringInterval === "month" ? "month" : "year",
        };
      }
    }

    return { monthly, annual };
  } catch (error) {
    console.error("Failed to fetch Polar prices:", error);
    return { monthly: null, annual: null };
  }
});
