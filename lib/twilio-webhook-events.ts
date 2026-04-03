import { z } from "zod";

export const voiceWebhookSchema = z.object({
  CallSid: z.string().optional(),
  CallStatus: z.string().optional(),
  ConferenceSid: z.string().optional(),
  ErrorCode: z.string().optional(),
  FriendlyName: z.string().optional(),
  ParticipantCallStatus: z.string().optional(),
  ReasonConferenceEnded: z.string().optional(),
  ReasonParticipantLeft: z.string().optional(),
  RoomName: z.string().optional(),
  StatusCallbackEvent: z.string().optional(),
  To: z.string().optional(),
  From: z.string().optional(),
});

export const videoWebhookSchema = z.object({
  StatusCallbackEvent: z.string().optional(),
  RoomName: z.string().optional(),
  RoomSid: z.string().optional(),
  ParticipantIdentity: z.string().optional(),
  StatusCallbackError: z.string().optional(),
});

export type ConvexWebhookMutation =
  | { path: "calls:internalEndCallByRoom"; args: { roomName: string; reason: string } }
  | { path: "calls:internalFailCallByRoom"; args: { roomName: string; reason: string } };

function normalizeEvent(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function mapVoiceWebhookToMutation(payload: z.infer<typeof voiceWebhookSchema>): ConvexWebhookMutation | null {
  const roomName = payload.RoomName ?? payload.FriendlyName;
  if (!roomName) {
    return null;
  }

  const callbackEvent = normalizeEvent(payload.StatusCallbackEvent);
  const participantCallStatus = normalizeEvent(payload.ParticipantCallStatus);
  if (callbackEvent === "conference-end") {
    return {
      path: "calls:internalEndCallByRoom",
      args: {
        roomName,
        reason: payload.ReasonConferenceEnded
          ? `voice_${payload.ReasonConferenceEnded.replaceAll("_", "-")}`
          : "voice_conference-end",
      },
    };
  }

  if (callbackEvent === "participant-leave") {
    if (participantCallStatus === "failed" || participantCallStatus === "busy" || participantCallStatus === "canceled") {
      return {
        path: "calls:internalFailCallByRoom",
        args: {
          roomName,
          reason: `voice_${participantCallStatus}`,
        },
      };
    }

    if (participantCallStatus === "completed" || participantCallStatus === "no-answer") {
      return {
        path: "calls:internalEndCallByRoom",
        args: {
          roomName,
          reason: payload.ReasonParticipantLeft
            ? `voice_${payload.ReasonParticipantLeft}`
            : participantCallStatus === "no-answer"
              ? "no_answer"
              : "voice_completed",
        },
      };
    }
  }

  const status = normalizeEvent(payload.CallStatus);

  if (status === "failed" || status === "busy" || status === "canceled") {
    return {
      path: "calls:internalFailCallByRoom",
      args: {
        roomName,
        reason: `voice_${status || "failed"}`,
      },
    };
  }

  if (status === "completed" || status === "no-answer") {
    return {
      path: "calls:internalEndCallByRoom",
      args: {
        roomName,
        reason: status === "no-answer" ? "no_answer" : `voice_${status}`,
      },
    };
  }

  return null;
}

export function mapVideoWebhookToMutation(payload: z.infer<typeof videoWebhookSchema>): ConvexWebhookMutation | null {
  const roomName = payload.RoomName;
  if (!roomName) {
    return null;
  }

  const event = normalizeEvent(payload.StatusCallbackEvent);
  if (!event) {
    return null;
  }

  if (event.includes("failed") || event.includes("error")) {
    return {
      path: "calls:internalFailCallByRoom",
      args: {
        roomName,
        reason: `video_${event.replaceAll(" ", "_")}`,
      },
    };
  }

  if (event === "room-ended" || event === "room-completed") {
    return {
      path: "calls:internalEndCallByRoom",
      args: {
        roomName,
        reason: `video_${event.replaceAll(" ", "_")}`,
      },
    };
  }

  return null;
}
