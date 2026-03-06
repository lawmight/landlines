"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useConvexAuth } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { ProPrices } from "@/lib/stripe";

interface BillingCardProps {
  prices: ProPrices;
}

function buildCheckoutUrl(priceId: string, email?: string, externalId?: string): string {
  const params = new URLSearchParams({ priceId });
  if (email) params.set("customerEmail", email);
  if (externalId) params.set("customerExternalId", externalId);
  return `/api/checkout?${params.toString()}`;
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function BillingCard({ prices }: BillingCardProps): React.JSX.Element {
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.users.getProfile, isAuthenticated ? {} : "skip");

  const email = user?.primaryEmailAddress?.emailAddress;
  const clerkId = user?.id;
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
          <div className="flex flex-wrap items-center gap-2">
            <p className="w-full text-sm text-[var(--muted-foreground)]">
              Manage your Landlines Pro subscription in Stripe&apos;s customer portal.
            </p>
            <Button asChild>
              <a href="/api/billing/portal">Manage billing</a>
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {prices.monthly && (
              <Button asChild>
                <a href={buildCheckoutUrl(prices.monthly.priceId, email ?? undefined, clerkId ?? undefined)}>
                  Subscribe — {formatPrice(monthlyAmount, currency)}/mo
                </a>
              </Button>
            )}
            {prices.annual && (
              <Button variant="outline" asChild>
                <a href={buildCheckoutUrl(prices.annual.priceId, email ?? undefined, clerkId ?? undefined)}>
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
