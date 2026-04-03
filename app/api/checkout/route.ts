import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { isCheckoutPlan, resolvePriceIdForPlan } from "@/lib/billing";
import { env, landlinesAnnualPriceId } from "@/lib/env";
import { STRIPE_MANAGED_PAYMENTS_API_VERSION, stripe } from "@/lib/stripe";

type ManagedPaymentsSessionCreateParams = {
  managed_payments: {
    enabled: true;
  };
};

export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<Response> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = request.nextUrl.searchParams.get("plan");
  if (!isCheckoutPlan(plan)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const priceId = resolvePriceIdForPlan(plan, {
    monthly: env.LANDLINES_MONTHLY_PRICE_ID,
    annual: landlinesAnnualPriceId(),
  });

  if (!priceId) {
    return NextResponse.json({ error: "Missing Stripe price configuration." }, { status: 500 });
  }

  if (!env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY." }, { status: 500 });
  }

  const successUrl = new URL("/checkout/success", request.nextUrl.origin);
  successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");

  const cancelUrl = new URL("/checkout/cancel", request.nextUrl.origin);
  cancelUrl.searchParams.set("plan", plan);

  const session = await stripe().checkout.sessions.create(
    {
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
      client_reference_id: userId,
      metadata: {
        clerkUserId: userId,
        plan,
      },
      subscription_data: {
        metadata: {
          clerkUserId: userId,
          plan,
        },
      },
      managed_payments: {
        enabled: true,
      },
    } as Stripe.Checkout.SessionCreateParams & ManagedPaymentsSessionCreateParams,
    {
      apiVersion: STRIPE_MANAGED_PAYMENTS_API_VERSION,
    },
  );

  if (!session.url) {
    return NextResponse.json({ error: "Stripe checkout URL missing." }, { status: 500 });
  }

  return NextResponse.redirect(session.url, 303);
}
