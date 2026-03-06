import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { resolveStripeCustomerIdForUser } from "@/lib/stripe-billing";

function getPrimaryEmailAddress(user: Awaited<ReturnType<Awaited<ReturnType<typeof clerkClient>>["users"]["getUser"]>>): string | null {
  const primary = user.emailAddresses.find((address) => address.id === user.primaryEmailAddressId);
  return primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
}

export async function GET(request: Request): Promise<Response> {
  if (!stripe) {
    return new Response("Stripe Billing Portal is not configured yet.", {
      status: 503,
    });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/", request.url), { status: 303 });
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const email = getPrimaryEmailAddress(user);

  const customerId = await resolveStripeCustomerIdForUser({
    stripe,
    userClerkId: userId,
    email,
  });

  if (!customerId) {
    return NextResponse.redirect(new URL("/settings?billing=missing-customer", request.url), { status: 303 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: new URL("/settings", request.url).toString(),
  });

  return NextResponse.redirect(session.url, { status: 303 });
}
