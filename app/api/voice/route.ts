import { NextRequest, NextResponse } from "next/server";

const ROOM_NAME_MIN_LENGTH = 1;
const ROOM_NAME_MAX_LENGTH = 120;

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
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return twimlResponse(
      '<Response><Say>Invalid request.</Say><Hangup/></Response>',
      400
    );
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
