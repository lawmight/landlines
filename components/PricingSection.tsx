"use client";

import { useUser, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";

import type { ProPrices } from "@/lib/polar";

interface PricingSectionProps {
  prices: ProPrices;
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

function buildCheckoutUrl(productId: string, email?: string, externalId?: string): string {
  const params = new URLSearchParams({ products: productId });
  if (email) params.set("customerEmail", email);
  if (externalId) params.set("customerExternalId", externalId);
  return `/api/checkout?${params.toString()}`;
}

export function PricingSection({ prices }: PricingSectionProps): React.JSX.Element {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const clerkId = user?.id;

  const monthlyAmount = prices.monthly?.amount ?? 9;
  const annualAmount = prices.annual?.amount ?? 99;
  const currency = prices.monthly?.currency ?? prices.annual?.currency ?? "eur";

  const annualSaving = Math.round((1 - annualAmount / (monthlyAmount * 12)) * 100);

  return (
    <section className="mx-auto mt-20 w-full max-w-[720px] px-6">
      <p className="anim-1 text-center text-[13px] uppercase tracking-[0.24em] text-[var(--color-mid)]">
        Pricing
      </p>
      <h2 className="anim-2 display-serif mt-4 text-center text-[clamp(2.4rem,5vw,3.6rem)] font-light leading-[1.06] tracking-[0.02em]">
        Pick your line.
      </h2>
      <p className="anim-3 mt-4 text-center text-[15px] leading-[1.6] text-[var(--color-mid)]">
        No free trials. No gimmicks. Just private calling.
      </p>

      <div className="anim-4 mt-12 grid gap-6 md:grid-cols-2">
        {/* Monthly */}
        <div className="flex flex-col border border-[var(--color-wire)] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-mid)]">Monthly</p>
          <p className="display-serif mt-4 text-[3rem] font-light leading-none tracking-tight">
            {formatPrice(monthlyAmount, currency)}
          </p>
          <p className="mt-1 text-sm text-[var(--color-mid)]">per month</p>

          <ul className="mt-8 flex-1 space-y-3 text-[14px] leading-normal text-[var(--color-mid)]">
            <li className="flex items-start gap-2">
              <span className="mt-[2px] text-[var(--color-accent)]">&bull;</span>
              Unlimited contacts
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-[2px] text-[var(--color-accent)]">&bull;</span>
              Voice &amp; video calling
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-[2px] text-[var(--color-accent)]">&bull;</span>
              Always-on presence
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-[2px] text-[var(--color-accent)]">&bull;</span>
              Priority support
            </li>
          </ul>

          <div className="mt-8">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="landing-btn w-full" type="button">
                  Get started
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              {prices.monthly ? (
                <a
                  href={buildCheckoutUrl(prices.monthly.productId, email ?? undefined, clerkId ?? undefined)}
                  className="landing-btn block w-full text-center"
                >
                  Subscribe monthly
                </a>
              ) : (
                <span className="landing-btn block w-full cursor-not-allowed text-center opacity-50">
                  Unavailable
                </span>
              )}
            </SignedIn>
          </div>
        </div>

        {/* Annual */}
        <div className="flex flex-col border-2 border-[var(--color-ink)] p-6 md:p-8">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-mid)]">Annual</p>
            {annualSaving > 0 && (
              <span className="text-xs font-medium text-[var(--color-accent)]">
                Save {annualSaving}%
              </span>
            )}
          </div>
          <p className="display-serif mt-4 text-[3rem] font-light leading-none tracking-tight">
            {formatPrice(annualAmount, currency)}
          </p>
          <p className="mt-1 text-sm text-[var(--color-mid)]">per year</p>

          <p className="mt-8 flex-1 text-[14px] leading-normal text-[var(--color-mid)]">
            Don&apos;t hang up every month — commit to a full year, or more.
          </p>

          <div className="mt-8">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="landing-btn landing-btn-primary w-full" type="button">
                  Get started
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              {prices.annual ? (
                <a
                  href={buildCheckoutUrl(prices.annual.productId, email ?? undefined, clerkId ?? undefined)}
                  className="landing-btn landing-btn-primary block w-full text-center"
                >
                  Subscribe annually
                </a>
              ) : (
                <span className="landing-btn landing-btn-primary block w-full cursor-not-allowed text-center opacity-50">
                  Unavailable
                </span>
              )}
            </SignedIn>
          </div>
        </div>
      </div>
    </section>
  );
}
