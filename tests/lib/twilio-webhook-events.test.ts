import { describe, expect, it } from "vitest";

import {
  mapVideoWebhookToMutation,
  mapVoiceWebhookToMutation,
  videoWebhookSchema,
  voiceWebhookSchema
} from "@/lib/twilio-webhook-events";

describe("twilio webhook schema + mutation mapping", () => {
  it("maps terminal voice statuses to end/fail mutations", () => {
    const endPayload = voiceWebhookSchema.parse({
      CallStatus: "completed",
      RoomName: "abc123"
    });
    const failPayload = voiceWebhookSchema.parse({
      CallStatus: "failed",
      RoomName: "abc123"
    });

    expect(mapVoiceWebhookToMutation(endPayload)).toEqual({
      path: "calls:internalEndCallByRoom",
      args: {
        roomName: "abc123",
        reason: "voice_completed"
      }
    });
    expect(mapVoiceWebhookToMutation(failPayload)).toEqual({
      path: "calls:internalFailCallByRoom",
      args: {
        roomName: "abc123",
        reason: "voice_failed"
      }
    });
  });

  it("maps video failure and completion events", () => {
    const failPayload = videoWebhookSchema.parse({
      RoomName: "room_7",
      StatusCallbackEvent: "participant-connect-failed"
    });
    const endPayload = videoWebhookSchema.parse({
      RoomName: "room_7",
      StatusCallbackEvent: "room-ended"
    });

    expect(mapVideoWebhookToMutation(failPayload)).toEqual({
      path: "calls:internalFailCallByRoom",
      args: {
        roomName: "room_7",
        reason: "video_participant-connect-failed"
      }
    });
    expect(mapVideoWebhookToMutation(endPayload)).toEqual({
      path: "calls:internalEndCallByRoom",
      args: {
        roomName: "room_7",
        reason: "video_room-ended"
      }
    });
  });

  it("returns null when no room name is provided", () => {
    const parsed = videoWebhookSchema.parse({
      StatusCallbackEvent: "room-ended"
    });

    expect(mapVideoWebhookToMutation(parsed)).toBeNull();
  });
});
