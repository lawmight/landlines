import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";
import { formDataToParams, validateTwilioFormRequest } from "@/lib/twilio-validate";

const ROOM_NAME_MIN_LENGTH = 1;
const ROOM_NAME_MAX_LENGTH = 120;
const VOICE_WEBHOOK_RATE_LIMIT_PER_MINUTE = 120;

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function twimlResponse(xml: string, status = 200): NextResponse {
  return new NextResponse(xml, {
    status,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
    },
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rateLimit = checkRateLimit(`voice-webhook:${getRequestIp(request)}`, VOICE_WEBHOOK_RATE_LIMIT_PER_MINUTE, 60_000);
  if (!rateLimit.ok) {
    return twimlResponse('<Response><Say>Too many requests.</Say><Hangup/></Response>', 429);
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/x-www-form-urlencoded")) {
    return twimlResponse('<Response><Say>Invalid content type.</Say><Hangup/></Response>', 400);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return twimlResponse(
      '<Response><Say>Invalid request.</Say><Hangup/></Response>',
      400
    );
  }

  const params = formDataToParams(formData);
  const isSignatureValid = validateTwilioFormRequest(env.TWILIO_AUTH_TOKEN, request, params);
  if (!isSignatureValid) {
    logger.warn(
      {
        route: "/api/voice",
        hasSignature: Boolean(request.headers.get("x-twilio-signature")),
      },
      "Rejected Twilio webhook with invalid signature."
    );
    return twimlResponse('<Response><Say>Unauthorized request.</Say><Hangup/></Response>', 401);
  }

  const roomNameRaw = formData.get("roomName");
  const roomName =
    typeof roomNameRaw === "string" ? roomNameRaw.trim() : "";

  if (
    roomName.length < ROOM_NAME_MIN_LENGTH ||
    roomName.length > ROOM_NAME_MAX_LENGTH
  ) {
    return twimlResponse(
      '<Response><Say>Invalid room.</Say><Hangup/></Response>',
      400
    );
  }

  const safeRoomName = escapeXml(roomName);
  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Dial><Conference>${safeRoomName}</Conference></Dial></Response>`;

  return twimlResponse(twiml);
}
