import { Router } from "express";
import { z } from "zod";

const voiceWebhookSchema = z.object({
  CallSid: z.string().optional(),
  CallStatus: z.string().optional(),
  To: z.string().optional(),
  From: z.string().optional()
});

const videoWebhookSchema = z.object({
  StatusCallbackEvent: z.string().optional(),
  RoomName: z.string().optional(),
  RoomSid: z.string().optional(),
  ParticipantIdentity: z.string().optional()
});

export const webhookRouter = Router();

webhookRouter.post("/twilio/voice-status", (req, res) => {
  const parsed = voiceWebhookSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid voice webhook payload." });
  }

  // TODO: Forward voice status updates to Convex `calls` mutations.
  return res.status(200).json({ ok: true });
});

webhookRouter.post("/twilio/video-status", (req, res) => {
  const parsed = videoWebhookSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid video webhook payload." });
  }

  // TODO: Forward video status updates to Convex `calls` mutations.
  return res.status(200).json({ ok: true });
});
