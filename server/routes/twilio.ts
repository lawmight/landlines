import { Router } from "express";
import { z } from "zod";

import { createVideoToken, createVoiceToken, ensureVideoRoom } from "../lib/twilioClient";

const tokenRequestSchema = z.object({
  identity: z.string().min(1).max(121).regex(/^[A-Za-z0-9_]+$/, "Identity must be alphanumeric or underscore."),
  roomName: z.string().min(1).max(120)
});

export const twilioRouter = Router();

twilioRouter.post("/token", async (req, res) => {
  const parseResult = tokenRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Invalid token request payload.",
      details: parseResult.error.flatten()
    });
  }

  try {
    const { identity, roomName } = parseResult.data;
    await ensureVideoRoom(roomName);

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
