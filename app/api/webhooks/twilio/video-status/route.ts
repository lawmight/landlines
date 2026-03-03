import { NextRequest, NextResponse } from "next/server";

import { forwardToConvexMutation } from "@/lib/convex-webhook";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";
import { formDataToParams, validateTwilioFormRequest, validateTwilioJsonRequest } from "@/lib/twilio-validate";
import { mapVideoWebhookToMutation, videoWebhookSchema } from "@/lib/twilio-webhook-events";

const VIDEO_WEBHOOK_RATE_LIMIT_PER_MINUTE = 240;

function normalizePayload(payload: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, Array.isArray(value) ? value.join(",") : String(value)])
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rateLimit = checkRateLimit(`video-webhook:${getRequestIp(request)}`, VIDEO_WEBHOOK_RATE_LIMIT_PER_MINUTE, 60_000);
  if (!rateLimit.ok) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  let body: Record<string, string>;

  if (contentType.includes("application/json")) {
    let rawBody = "";
    try {
      rawBody = await request.text();
    } catch {
      return NextResponse.json({ error: "Invalid video webhook payload." }, { status: 400 });
    }

    const isValid = validateTwilioJsonRequest(env.TWILIO_AUTH_TOKEN, request, rawBody);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid Twilio signature." }, { status: 401 });
    }

    try {
      body = normalizePayload(JSON.parse(rawBody) as Record<string, unknown>);
    } catch {
      return NextResponse.json({ error: "Invalid video webhook payload." }, { status: 400 });
    }
  } else {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: "Invalid video webhook payload." }, { status: 400 });
    }

    const params = formDataToParams(formData);
    const isValid = validateTwilioFormRequest(env.TWILIO_AUTH_TOKEN, request, params);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid Twilio signature." }, { status: 401 });
    }

    body = normalizePayload(params as Record<string, unknown>);
  }

  const parsed = videoWebhookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid video webhook payload." }, { status: 400 });
  }

  const mutation = mapVideoWebhookToMutation(parsed.data);
  if (mutation) {
    try {
      await forwardToConvexMutation(mutation);
    } catch (error) {
      logger.error(
        {
          mutationPath: mutation.path,
          roomName: mutation.args.roomName,
          error,
        },
        "Failed to forward Twilio video webhook to Convex."
      );
      return NextResponse.json({ error: "Failed to persist call status update." }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true });
}
