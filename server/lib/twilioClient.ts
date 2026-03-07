import twilio from "twilio";

import { normalizeTwilioVideoRoomType } from "../../lib/twilio-room-type";
import { serverEnv, serverTwilioApiKeySecret, serverTwilioApiKeySid } from "./env";

const accountSid = serverEnv.TWILIO_ACCOUNT_SID;
const authToken = serverEnv.TWILIO_AUTH_TOKEN;
const apiKey = serverTwilioApiKeySid();
const apiSecret = serverTwilioApiKeySecret();
const twimlAppSid = serverEnv.TWILIO_TWIML_APP_SID;
const roomType = normalizeTwilioVideoRoomType(serverEnv.TWILIO_VIDEO_ROOM_TYPE);

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;
const VideoGrant = AccessToken.VideoGrant;

export const twilioClient = twilio(accountSid, authToken);

function getVideoStatusCallbackUrl(): string | null {
  return serverEnv.TWILIO_STATUS_CALLBACK_BASE_URL
    ? `${serverEnv.TWILIO_STATUS_CALLBACK_BASE_URL}/api/webhooks/twilio/video-status`
    : null;
}

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
  const statusCallback = getVideoStatusCallbackUrl();
  try {
    await twilioClient.video.v1.rooms.create({
      uniqueName: roomName,
      type: roomType as any,
      ...(statusCallback
        ? {
            statusCallback,
            statusCallbackMethod: "POST" as const
          }
        : {})
    });
  } catch (caught) {
    const maybeCode = (caught as { code?: number }).code;
    const roomAlreadyExists = maybeCode === 53113;

    if (!roomAlreadyExists) {
      throw caught;
    }
  }
}
