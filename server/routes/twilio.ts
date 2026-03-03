import { Router } from "express";
import rateLimit from "express-rate-limit";

import { tokenRequestSchema } from "../lib/schemas";
import { createVideoToken, createVoiceToken, ensureVideoRoom } from "../lib/twilioClient";

export const twilioRouter = Router();

const tokenRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many token requests. Try again in a minute." }
});

twilioRouter.post("/token", tokenRateLimiter, async (req, res) => {
  const parseResult = tokenRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Invalid token request payload.",
      details: parseResult.error.flatten()
    });
  }

  try {
    const { identity, roomName, mode } = parseResult.data;

    if (mode === "video") {
      await ensureVideoRoom(roomName);
    }

    const voiceToken = createVoiceToken(identity, roomName);
    const videoToken = createVideoToken(identity, roomName);

    return res.json({
      voiceToken,
      videoToken,
      roomName
    });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Twilio token generation failed.";
    return res.status(500).json({
      error: message
    });
  }
});
