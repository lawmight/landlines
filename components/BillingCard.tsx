"use client";

import { useQuery, useConvexAuth } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildCheckoutUrl } from "@/lib/billing";

import type { ProPrices } from "@/lib/stripe";

interface BillingCardProps {
  prices: ProPrices;
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function BillingCard({ prices }: BillingCardProps): React.JSX.Element {
  const { isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.users.getProfile, isAuthenticated ? {} : "skip");

  const tier = (profile as any)?.subscriptionTier ?? "free";
  const isPro = tier === "pro";

  const monthlyAmount = prices.monthly?.amount ?? 9;
  const annualAmount = prices.annual?.amount ?? 99;
  const currency = prices.monthly?.currency ?? prices.annual?.currency ?? "eur";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>
          {isPro
            ? "Your Pro subscription is active. Unlimited contacts and video calling."
            : "Subscribe to unlock unlimited contacts and video calling."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Badge variant={isPro ? "success" : "outline"} className="w-fit">
          {isPro ? "Pro — Active" : "No active subscription"}
        </Badge>

        {isPro ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Managed through Stripe Checkout. Contact support if you need billing help.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {prices.monthly && (
              <Button asChild>
                <a href={buildCheckoutUrl("monthly")}>
                  Subscribe — {formatPrice(monthlyAmount, currency)}/mo
                </a>
              </Button>
            )}
            {prices.annual && (
              <Button variant="outline" asChild>
                <a href={buildCheckoutUrl("annual")}>
                  {formatPrice(annualAmount, currency)}/yr
                </a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
