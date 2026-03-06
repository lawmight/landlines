import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import {
  checkoutSessionClerkId,
  checkoutSessionCustomerId,
  checkoutSessionPriceId,
  checkoutSessionSubscriptionId,
  primarySubscriptionPriceId,
  subscriptionStatusToTier,
  syncStripeBillingState,
} from "@/lib/stripe-billing";

async function syncCompletedCheckout(session: Stripe.Checkout.Session): Promise<void> {
  const userClerkId = checkoutSessionClerkId(session);
  if (!userClerkId) {
    return;
  }

  await syncStripeBillingState({
    userClerkId,
    subscriptionTier: "pro",
    stripeCheckoutCompletedAt: Date.now(),
    stripeCustomerId: checkoutSessionCustomerId(session),
    stripePriceId: checkoutSessionPriceId(session),
    stripeSubscriptionId: checkoutSessionSubscriptionId(session),
    stripeSubscriptionStatus: "active",
  });
}

async function syncSubscription(subscription: Stripe.Subscription): Promise<void> {
  const userClerkId = subscription.metadata?.clerkUserId;
  if (!userClerkId) {
    return;
  }

  await syncStripeBillingState({
    userClerkId,
    subscriptionTier: subscriptionStatusToTier(subscription.status),
    stripeCheckoutCompletedAt: Date.now(),
    stripeCustomerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
    stripePriceId: primarySubscriptionPriceId(subscription),
    stripeSubscriptionId: subscription.id,
    stripeSubscriptionStatus: subscription.status,
  });
}

async function syncInvoice(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionRef = invoice.parent?.subscription_details?.subscription;
  if (!stripe || !subscriptionRef) {
    return;
  }

  const subscriptionId = typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef.id;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await syncSubscription(subscription);
}

export async function POST(request: Request): Promise<Response> {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Stripe webhook secret is not configured.", {
      status: 503,
    });
  }

  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header.", {
      status: 400,
    });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Stripe webhook error.";
    return new Response(message, {
      status: 400,
    });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await syncCompletedCheckout(event.data.object as Stripe.Checkout.Session);
      break;
    case "customer.subscription.created":
    case "customer.subscription.deleted":
    case "customer.subscription.updated":
      await syncSubscription(event.data.object as Stripe.Subscription);
      break;
    case "invoice.paid":
    case "invoice.payment_failed":
      await syncInvoice(event.data.object as Stripe.Invoice);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
