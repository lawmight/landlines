import { z } from "zod";

import { env } from "@/lib/env";

const tokenSchema = z.object({
  voiceToken: z.string(),
  videoToken: z.string(),
  roomName: z.string()
});

export type TwilioTokenPayload = z.infer<typeof tokenSchema>;

/**
 * Requests Twilio voice/video access tokens from the signaling server.
 * @param mode - "voice" skips Video room creation; "video" ensures the room exists.
 */
export async function fetchTwilioTokens(
  identity: string,
  roomName: string,
  mode: "voice" | "video" = "video"
): Promise<TwilioTokenPayload> {
  const response = await fetch(`${env.NEXT_PUBLIC_SIGNALING_BASE_URL}/twilio/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ identity, roomName, mode })
  });

  if (!response.ok) {
    throw new Error(`Token request failed with status ${response.status}.`);
  }

  const payload: unknown = await response.json();
  return tokenSchema.parse(payload);
}

/**
 * Maps browser media permission errors into user-readable call messages.
 */
export function mapMediaError(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === "NotFoundError") {
      return "No camera or microphone was found. Check your device settings.";
    }
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
      return "Camera access was blocked. Allow permissions to join video calls.";
    }
    if (error.name === "NotReadableError") {
      return "Camera is currently in use by another app.";
    }
    return error.message;
  }

  return "Unable to initialize camera/microphone.";
}
