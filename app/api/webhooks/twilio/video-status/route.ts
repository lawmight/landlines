import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";
import { formDataToParams, validateTwilioFormRequest, validateTwilioJsonRequest } from "@/lib/twilio-validate";
import { handleMappedTwilioWebhook, normalizeWebhookPayload } from "@/lib/twilio-webhook-route";
import { mapVideoWebhookToMutation, videoWebhookSchema } from "@/lib/twilio-webhook-events";

const VIDEO_WEBHOOK_RATE_LIMIT_PER_MINUTE = 240;

export async function POST(request: NextRequest): Promise<NextResponse> {
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
      body = normalizeWebhookPayload(JSON.parse(rawBody) as Record<string, unknown>);
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

    body = normalizeWebhookPayload(params as Record<string, unknown>);
  }

  return handleMappedTwilioWebhook({
    body,
    schema: videoWebhookSchema,
    rateLimitKeyPrefix: "video-webhook",
    rateLimitPerMinute: VIDEO_WEBHOOK_RATE_LIMIT_PER_MINUTE,
    mapMutation: mapVideoWebhookToMutation,
    invalidPayloadMessage: "Invalid video webhook payload.",
    forwardFailureMessage: "Failed to forward Twilio video webhook to Convex."
  });
}
