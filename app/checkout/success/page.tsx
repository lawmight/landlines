import Link from "next/link";

import { AuthShow } from "@/components/AuthShow";
import { UserSync } from "@/components/UserSync";

export const metadata = {
  title: "Payment Confirmed",
};

async function syncCheckoutSession(sessionId: string, viewerClerkId?: string | null): Promise<boolean> {
  if (!stripe) {
    return false;
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  const userClerkId = checkoutSessionClerkId(session);
  if (!userClerkId || (viewerClerkId && userClerkId !== viewerClerkId)) {
    return false;
  }

  const subscriptionStatus =
    typeof session.subscription === "string" ? "active" : (session.subscription?.status ?? "active");

  await syncStripeBillingState({
    userClerkId,
    subscriptionTier: subscriptionStatusToTier(subscriptionStatus),
    stripeCheckoutCompletedAt: Date.now(),
    stripeCustomerId: checkoutSessionCustomerId(session),
    stripePriceId: checkoutSessionPriceId(session),
    stripeSubscriptionId: checkoutSessionSubscriptionId(session),
    stripeSubscriptionStatus: subscriptionStatus,
  });

  return true;
}

export default async function CheckoutSuccessPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const { userId } = await auth();
  const searchParams = props.searchParams ? await props.searchParams : {};
  const sessionId = Array.isArray(searchParams.session_id)
    ? searchParams.session_id[0]
    : searchParams.session_id;

  let syncedFromReturn = false;
  if (sessionId) {
    try {
      syncedFromReturn = await syncCheckoutSession(sessionId, userId);
    } catch (error) {
      console.error("Failed to sync Stripe Checkout return:", error);
    }
  }

  return (
    <div className="landing min-h-screen">
      <nav className="mx-auto flex w-full max-w-[920px] items-center justify-between px-6 pt-6">
        <Link href="/" className="text-xs uppercase tracking-[0.24em] text-[var(--color-mid)]">
          Landlines
        </Link>
      </nav>

      <main id="main" className="flex flex-col items-center px-6 pt-[clamp(6rem,14vh,10rem)]">
        <p className="mb-6 text-[13px] uppercase tracking-[0.24em] text-[var(--color-accent)]">
          Payment confirmed
        </p>
        <h1 className="display-serif max-w-[660px] text-center text-[clamp(2.6rem,6vw,4.2rem)] font-light leading-[1.06] tracking-[0.02em]">
          Welcome to Landlines&nbsp;Pro.
        </h1>
        <p className="mt-6 max-w-[480px] text-center text-[15px] leading-[1.6] text-[var(--color-mid)]">
          {syncedFromReturn
            ? "Unlimited contacts, video calling, and priority support are now active on your account."
            : "Your Stripe checkout is complete. Subscription access will stay in sync from this return page and your webhook endpoint."}
        </p>
        <p className="mt-3 max-w-[520px] text-center text-[13px] leading-[1.7] text-[var(--color-mid)]">
          Stripe hosts the payment page itself. Brand colors, logo, typeface, and corner radius come from your
          Stripe Checkout branding settings.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <AuthShow
            when="signed-in"
            fallback={
              <Link href="/" className="landing-btn landing-btn-primary">
                Go home
              </Link>
            }
          >
            <UserSync />
            <Link href="/dashboard" className="landing-btn landing-btn-primary">
              Open Dashboard
            </Link>
            <a href="/api/billing/portal" className="landing-btn">
              Manage billing
            </a>
            <Link href="/settings" className="landing-btn landing-btn-ghost">
              View settings
            </Link>
          </AuthShow>
        </div>
      </main>
    </div>
  );
}
