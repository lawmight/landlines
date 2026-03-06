import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isConfiguredStripePriceId, stripe } from "@/lib/stripe";
import { resolveStripeCustomerIdForUser } from "@/lib/stripe-billing";

function getPrimaryEmailAddress(user: Awaited<ReturnType<Awaited<ReturnType<typeof clerkClient>>["users"]["getUser"]>>): string | null {
  const primary = user.emailAddresses.find((address) => address.id === user.primaryEmailAddressId);
  return primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
}

export async function GET(request: Request): Promise<Response> {
  if (!stripe) {
    return new Response("Stripe Checkout is not configured yet.", {
      status: 503,
    });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/", request.url), { status: 303 });
  }

  const url = new URL(request.url);
  const priceId = url.searchParams.get("priceId");
  if (!priceId || !isConfiguredStripePriceId(priceId)) {
    return new Response("Unknown Stripe price.", {
      status: 400,
    });
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const email = getPrimaryEmailAddress(user);
  const customerId = await resolveStripeCustomerIdForUser({
    stripe,
    userClerkId: userId,
    email,
  });

  const origin = url.origin;
  const session = await stripe.checkout.sessions.create({
    allow_promotion_codes: true,
    cancel_url: `${origin}/checkout/cancel`,
    client_reference_id: userId,
    customer: customerId ?? undefined,
    customer_email: customerId ? undefined : (email ?? undefined),
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      clerkUserId: userId,
      priceId,
    },
    mode: "subscription",
    subscription_data: {
      metadata: {
        clerkUserId: userId,
        priceId,
      },
    },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  });

  if (!session.url) {
    return new Response("Stripe Checkout did not return a redirect URL.", {
      status: 502,
    });
  }

  return NextResponse.redirect(session.url, { status: 303 });
}
