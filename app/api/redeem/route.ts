import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";
import { env } from "@/lib/env";

const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(request: Request): Promise<Response> {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Code is required." }, { status: 400 });
  }

  const raw = body?.code;
  if (typeof raw !== "string" || !raw.trim()) {
    return Response.json({ error: "Code is required." }, { status: 400 });
  }

  const code = raw.trim();
  const allowed = (env.LANDLINES_REDEEM_CODES ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  if (allowed.length === 0) {
    return Response.json(
      { error: "Redeem codes are not configured." },
      { status: 400 }
    );
  }

  const match = allowed.some((c) => c.toLowerCase() === code.toLowerCase());
  if (!match) {
    return Response.json(
      { error: "Invalid or expired code." },
      { status: 400 }
    );
  }

  try {
    await convex.mutation(api.users.setSubscriptionTier, {
      userClerkId: userId,
      subscriptionTier: "pro",
    });
  } catch (err) {
    console.error("Redeem code: setSubscriptionTier failed:", err);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return Response.json({ success: true });
}
