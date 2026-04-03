import { z } from "zod";

import { env } from "@/lib/env";

const tokenSchema = z.object({
  voiceToken: z.string(),
  videoToken: z.string(),
  roomName: z.string()
});

export type TwilioTokenPayload = z.infer<typeof tokenSchema>;

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1"]);

function getSignalingBaseUrl(): string {
  const baseUrl = new URL(env.NEXT_PUBLIC_SIGNALING_BASE_URL);

  if (typeof window === "undefined") {
    return baseUrl.origin;
  }

  const currentHostname = window.location.hostname;
  if (LOOPBACK_HOSTS.has(baseUrl.hostname) && LOOPBACK_HOSTS.has(currentHostname)) {
    baseUrl.hostname = currentHostname;
  }

  return baseUrl.origin;
}

/**
 * Requests Twilio voice/video access tokens from the signaling server.
 * @param mode - "voice" skips Video room creation; "video" ensures the room exists.
 */
export async function fetchTwilioTokens(
  identity: string,
  roomName: string,
  mode: "voice" | "video" = "video"
): Promise<TwilioTokenPayload> {
  if (typeof identity !== "string" || identity.trim() === "") {
    throw new Error("Cannot get call token: user not ready.");
  }
  if (typeof roomName !== "string" || roomName.trim() === "") {
    throw new Error("Cannot get call token: room not ready.");
  }

  const response = await fetch(`${getSignalingBaseUrl()}/twilio/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ identity, roomName, mode })
  });

  if (!response.ok) {
    let message = `Token request failed with status ${response.status}.`;
    try {
      const body = (await response.json()) as { error?: string; details?: string | object };
      if (body?.error) {
        message = body.error;
        if (body.details !== undefined) {
          const detailsStr =
            typeof body.details === "string"
              ? body.details
              : JSON.stringify(body.details);
          message += ` ${detailsStr}`;
        }
      }
    } catch {
      // response body was not JSON or already consumed
    }
    throw new Error(message);
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
