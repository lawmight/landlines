import { Router, type Request } from "express";
import rateLimit from "express-rate-limit";

import { logger } from "../../lib/logger";
import {
  mapVideoWebhookToMutation,
  mapVoiceWebhookToMutation,
  videoWebhookSchema,
  voiceWebhookSchema
} from "../../lib/twilio-webhook-events";
import { forwardToConvexMutation } from "../lib/convexWebhook";
import { serverEnv } from "../lib/env";
import { validateTwilioSignature } from "../lib/validateTwilioSignature";

export const webhookRouter = Router();

const webhookRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many webhook requests." }
});

function normalizePayload(payload: Record<string, unknown> | undefined): Record<string, string> {
  if (!payload) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, Array.isArray(value) ? value.join(",") : String(value)])
  );
}

async function forwardMutationIfPresent(
  mutation: ReturnType<typeof mapVoiceWebhookToMutation> | ReturnType<typeof mapVideoWebhookToMutation>
): Promise<void> {
  if (!mutation) {
    return;
  }
  await forwardToConvexMutation(mutation);
}

webhookRouter.post("/twilio/voice-status", webhookRateLimiter, async (req, res) => {
  const isValid = validateTwilioSignature(req as Request & { rawBody?: string }, serverEnv.TWILIO_AUTH_TOKEN);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid Twilio signature." });
  }

  const parsed = voiceWebhookSchema.safeParse(normalizePayload(req.body as Record<string, unknown>));
  const voiceMutation = parsed.success ? mapVoiceWebhookToMutation(parsed.data) : null;

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid voice webhook payload." });
  }

  try {
    await forwardMutationIfPresent(voiceMutation);
  } catch (error) {
    logger.error({ error, payload: parsed.data }, "Failed to forward Twilio voice webhook to Convex.");
    return res.status(502).json({ error: "Failed to persist call status update." });
  }

  return res.status(200).json({ ok: true });
});

webhookRouter.post("/twilio/video-status", webhookRateLimiter, async (req, res) => {
  const isValid = validateTwilioSignature(req as Request & { rawBody?: string }, serverEnv.TWILIO_AUTH_TOKEN);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid Twilio signature." });
  }

  const parsed = videoWebhookSchema.safeParse(normalizePayload(req.body as Record<string, unknown>));
  const videoMutation = parsed.success ? mapVideoWebhookToMutation(parsed.data) : null;

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid video webhook payload." });
  }

  try {
    await forwardMutationIfPresent(videoMutation);
  } catch (error) {
    logger.error({ error, payload: parsed.data }, "Failed to forward Twilio video webhook to Convex.");
    return res.status(502).json({ error: "Failed to persist call status update." });
  }

  return res.status(200).json({ ok: true });
});
