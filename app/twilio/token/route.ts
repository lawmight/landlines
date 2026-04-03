import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

import {
  createVideoToken,
  createVoiceToken,
  ensureVideoRoom,
  tokenRequestSchema
} from "@/lib/twilioToken";
import { getSubscriptionTierForRequest } from "@/lib/subscription";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tier = await getSubscriptionTierForRequest();
  if (tier !== "pro") {
    return Response.json(
      { error: "Active subscription required for calling." },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid token request payload.", details: "Invalid JSON" },
      { status: 400 }
    );
  }

  const parseResult = tokenRequestSchema.safeParse(body);
  if (!parseResult.success) {
    console.error("Token request validation failed", parseResult.error.flatten());
    return Response.json(
      {
        error: "Invalid token request payload.",
        details: parseResult.error.flatten()
      },
      { status: 400 }
    );
  }

  const { identity, roomName, mode } = parseResult.data;
  if (identity !== userId) {
    return Response.json(
      { error: "Identity must match the authenticated user." },
      { status: 403 }
    );
  }

  try {
    if (mode === "video") {
      await ensureVideoRoom(roomName);
    }

    const voiceToken = createVoiceToken(identity, roomName);
    const videoToken = createVideoToken(identity, roomName);

    return Response.json({
      voiceToken,
      videoToken,
      roomName
    });
  } catch (caught) {
    const message =
      caught instanceof Error ? caught.message : "Twilio token generation failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
