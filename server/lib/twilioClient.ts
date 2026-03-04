import twilio from "twilio";

import { serverEnv, serverTwilioApiKeySecret, serverTwilioApiKeySid } from "./env";

const accountSid = serverEnv.TWILIO_ACCOUNT_SID;
const authToken = serverEnv.TWILIO_AUTH_TOKEN;
const apiKey = serverTwilioApiKeySid();
const apiSecret = serverTwilioApiKeySecret();
const twimlAppSid = serverEnv.TWILIO_TWIML_APP_SID;
// Twilio deprecated group-small and other legacy types (Oct 2024). Use "group" for Group Rooms.
const DEPRECATED_ROOM_TYPES = ["group-small", "peer-to-peer", "peer-to-peer-mesh"];
const roomTypeRaw = serverEnv.TWILIO_VIDEO_ROOM_TYPE ?? "group";
const roomType = DEPRECATED_ROOM_TYPES.includes(roomTypeRaw) ? "group" : roomTypeRaw || "group";

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;
const VideoGrant = AccessToken.VideoGrant;

export const twilioClient = twilio(accountSid, authToken);

/**
 * Creates a Twilio Voice access token for browser clients.
 */
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

/**
 * Creates a Twilio Video access token scoped to a room.
 */
export function createVideoToken(identity: string, roomName: string): string {
  const token = new AccessToken(accountSid, apiKey, apiSecret, {
    identity,
    ttl: 60 * 60
  });

  token.addGrant(new VideoGrant({ room: roomName }));
  return token.toJwt();
}

/**
 * Ensures a Twilio Video room exists for the provided room name.
 */
export async function ensureVideoRoom(roomName: string): Promise<void> {
  try {
    await twilioClient.video.v1.rooms.create({
      uniqueName: roomName,
      type: roomType as any
    });
  } catch (caught) {
    const maybeCode = (caught as { code?: number }).code;
    const roomAlreadyExists = maybeCode === 53113;

    if (!roomAlreadyExists) {
      throw caught;
    }
  }
}
