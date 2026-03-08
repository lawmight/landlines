"use client";

import { useQuery, useConvexAuth } from "convex/react";
import { useState } from "react";

import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buildCheckoutUrl } from "@/lib/billing";

import type { ProPrices } from "@/lib/stripe";

interface BillingCardProps {
  prices: ProPrices;
  /** When true, show the "Redeem code" section (set from server when LANDLINES_REDEEM_CODES is configured). */
  redeemEnabled?: boolean;
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function BillingCard({ prices, redeemEnabled = false }: BillingCardProps): React.JSX.Element {
  const { isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.users.getProfile, isAuthenticated ? {} : "skip");

  const tier = (profile as any)?.subscriptionTier ?? "free";
  const isPro = tier === "pro";

  const [redeemCode, setRedeemCode] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  const handleRedeem = async () => {
    setRedeemError(null);
    setRedeemSuccess(false);
    if (!redeemCode.trim()) return;
    setRedeemLoading(true);
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: redeemCode.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRedeemError(typeof data?.error === "string" ? data.error : "Something went wrong.");
        return;
      }
      setRedeemCode("");
      setRedeemSuccess(true);
    } catch {
      setRedeemError("Something went wrong.");
    } finally {
      setRedeemLoading(false);
    }
  };

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
          <>
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
            {redeemEnabled && (
              <div className="flex flex-col gap-2 border-t pt-4">
                <p className="text-sm font-medium text-[var(--muted-foreground)]">Redeem code</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Enter code"
                    value={redeemCode}
                    onChange={(e) => {
                      setRedeemCode(e.target.value);
                      setRedeemError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
                    className="max-w-[200px]"
                    disabled={redeemLoading}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleRedeem}
                    disabled={redeemLoading || !redeemCode.trim()}
                  >
                    {redeemLoading ? "Applying…" : "Redeem"}
                  </Button>
                </div>
                {redeemError && (
                  <p className="text-sm text-destructive">{redeemError}</p>
                )}
                {redeemSuccess && (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Code applied. Your plan is now Pro.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
