import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";
import { formDataToParams, validateTwilioFormRequest } from "@/lib/twilio-validate";
import { handleMappedTwilioWebhook, normalizeWebhookPayload } from "@/lib/twilio-webhook-route";
import { mapVoiceWebhookToMutation, voiceWebhookSchema } from "@/lib/twilio-webhook-events";

const VOICE_WEBHOOK_RATE_LIMIT_PER_MINUTE = 240;

export async function POST(request: NextRequest): Promise<NextResponse> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid voice webhook payload." }, { status: 400 });
  }

  const params = formDataToParams(formData);
  const isValid = validateTwilioFormRequest(env.TWILIO_AUTH_TOKEN, request, params);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid Twilio signature." }, { status: 401 });
  }

  return handleMappedTwilioWebhook({
    body: normalizeWebhookPayload(params as Record<string, unknown>),
    schema: voiceWebhookSchema,
    rateLimitKeyPrefix: "voice-webhook",
    rateLimitPerMinute: VOICE_WEBHOOK_RATE_LIMIT_PER_MINUTE,
    mapMutation: mapVoiceWebhookToMutation,
    invalidPayloadMessage: "Invalid voice webhook payload.",
    forwardFailureMessage: "Failed to forward Twilio voice webhook to Convex."
  });
}
