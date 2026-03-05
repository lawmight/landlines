import { ConvexHttpClient } from "convex/browser";
import Stripe from "stripe";

import { api } from "@/convex/_generated/api";
import {
  getClerkUserIdFromStripeObject,
  shouldActivateCheckoutSession,
  subscriptionTierForStripeStatus,
  type SubscriptionTier,
} from "@/lib/billing";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

export const runtime = "nodejs";

async function setTier(userClerkId: string, subscriptionTier: SubscriptionTier): Promise<void> {
  await convex.mutation(api.users.setSubscriptionTier, {
    userClerkId,
    subscriptionTier,
  });
}

async function setTierFromCheckoutSession(
  session: Stripe.Checkout.Session,
  subscriptionTier: SubscriptionTier,
): Promise<void> {
  const clerkUserId = getClerkUserIdFromStripeObject(session);
  if (!clerkUserId) {
    return;
  }

  await setTier(clerkUserId, subscriptionTier);
}

async function setTierFromSubscription(
  subscription: Stripe.Subscription,
  subscriptionTier: SubscriptionTier | null,
): Promise<void> {
  if (!subscriptionTier) {
    return;
  }

  const clerkUserId = subscription.metadata?.clerkUserId;
  if (!clerkUserId) {
    return;
  }

  await setTier(clerkUserId, subscriptionTier);
}

export async function POST(request: Request): Promise<Response> {
  if (!env.STRIPE_SECRET_KEY) {
    return Response.json({ error: "Missing STRIPE_SECRET_KEY." }, { status: 500 });
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: "Missing STRIPE_WEBHOOK_SECRET." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing Stripe signature header." }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook payload.";
    return Response.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (shouldActivateCheckoutSession(session)) {
          await setTierFromCheckoutSession(session, "pro");
        }
        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        await setTierFromCheckoutSession(session, "pro");
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await setTierFromCheckoutSession(session, "free");
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await setTierFromSubscription(
          subscription,
          subscriptionTierForStripeStatus(subscription.status),
        );
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await setTierFromSubscription(subscription, "free");
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Stripe webhook processing failed:", error);
    return Response.json({ error: "Webhook processing failed." }, { status: 500 });
  }

  return Response.json({ received: true });
}
