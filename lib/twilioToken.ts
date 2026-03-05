/**
 * Server-only Twilio token helpers for the Next.js POST /twilio/token route.
 * Mirrors server/lib/twilioClient.ts for use on Vercel (no Express server).
 */
import "server-only";

import twilio from "twilio";
import { z } from "zod";

import { env, twilioApiKeySecret, twilioApiKeySid } from "@/lib/env";

const accountSid = env.TWILIO_ACCOUNT_SID;
const authToken = env.TWILIO_AUTH_TOKEN;
const apiKey = twilioApiKeySid();
const apiSecret = twilioApiKeySecret();
const twimlAppSid = env.TWILIO_TWIML_APP_SID;

const DEPRECATED_ROOM_TYPES = ["group-small", "peer-to-peer", "peer-to-peer-mesh"];
const roomTypeRaw = env.TWILIO_VIDEO_ROOM_TYPE ?? "group";
const roomType = DEPRECATED_ROOM_TYPES.includes(roomTypeRaw) ? "group" : roomTypeRaw || "group";

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;
const VideoGrant = AccessToken.VideoGrant;

const twilioClient = twilio(accountSid, authToken);

export const tokenRequestSchema = z.object({
  identity: z
    .string()
    .min(1)
    .max(121)
    .regex(/^[A-Za-z0-9_]+$/, "Identity must be alphanumeric or underscore."),
  roomName: z.string().min(1).max(120),
  mode: z.enum(["voice", "video"]).default("video")
});

export type TokenRequest = z.infer<typeof tokenRequestSchema>;

export function createVoiceToken(identity: string, roomName: string): string {
  const token = new AccessToken(accountSid, apiKey, apiSecret, {
    identity,
    ttl: 60 * 60
  });

  token.addGrant(
    new VoiceGrant({
      outgoingApplicationSid: twimlAppSid,
      incomingAllow: true,
      outgoingApplicationParams: {
        roomName
      }
    })
  );

  return token.toJwt();
}

export function createVideoToken(identity: string, roomName: string): string {
  const token = new AccessToken(accountSid, apiKey, apiSecret, {
    identity,
    ttl: 60 * 60
  });

  token.addGrant(new VideoGrant({ room: roomName }));
  return token.toJwt();
}

export async function ensureVideoRoom(roomName: string): Promise<void> {
  try {
    await twilioClient.video.v1.rooms.create({
      uniqueName: roomName,
      type: roomType as "group" | "peer-to-peer" | "group-small"
    });
  } catch (caught) {
    const maybeCode = (caught as { code?: number }).code;
    const roomAlreadyExists = maybeCode === 53113;

    if (!roomAlreadyExists) {
      throw caught;
    }
  }
}
