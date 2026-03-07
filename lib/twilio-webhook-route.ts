import { NextResponse } from "next/server";
import type { ZodType } from "zod";

import { forwardToConvexMutation } from "@/lib/convex-webhook";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ConvexWebhookMutation } from "@/lib/twilio-webhook-events";

type AccountScopedWebhookPayload = {
  AccountSid?: string;
};

export function normalizeWebhookPayload(payload: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, Array.isArray(value) ? value.join(",") : String(value)])
  );
}

interface HandleMappedTwilioWebhookOptions<T extends AccountScopedWebhookPayload> {
  body: Record<string, string>;
  schema: ZodType<T>;
  rateLimitKeyPrefix: string;
  rateLimitPerMinute: number;
  mapMutation: (payload: T) => ConvexWebhookMutation | null;
  invalidPayloadMessage: string;
  forwardFailureMessage: string;
}

export async function handleMappedTwilioWebhook<T extends AccountScopedWebhookPayload>({
  body,
  schema,
  rateLimitKeyPrefix,
  rateLimitPerMinute,
  mapMutation,
  invalidPayloadMessage,
  forwardFailureMessage
}: HandleMappedTwilioWebhookOptions<T>): Promise<NextResponse> {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: invalidPayloadMessage }, { status: 400 });
  }

  const accountSid = parsed.data.AccountSid?.trim() || "unknown-account";
  const rateLimit = checkRateLimit(`${rateLimitKeyPrefix}:${accountSid}`, rateLimitPerMinute, 60_000);
  if (!rateLimit.ok) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const mutation = mapMutation(parsed.data);
  if (!mutation) {
    return NextResponse.json({ ok: true });
  }

  try {
    await forwardToConvexMutation(mutation);
  } catch (error) {
    logger.error(
      {
        mutationPath: mutation.path,
        roomName: mutation.args.roomName,
        error
      },
      forwardFailureMessage
    );
    return NextResponse.json({ error: "Failed to persist call status update." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
