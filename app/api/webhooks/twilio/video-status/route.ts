import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const videoWebhookSchema = z.object({
  StatusCallbackEvent: z.string().optional(),
  RoomName: z.string().optional(),
  RoomSid: z.string().optional(),
  ParticipantIdentity: z.string().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: Record<string, string>;
  try {
    const formData = await request.formData();
    body = Object.fromEntries(
      Array.from(formData.entries()).map(([k, v]) => [k, String(v)])
    ) as Record<string, string>;
  } catch {
    return NextResponse.json(
      { error: "Invalid video webhook payload." },
      { status: 400 }
    );
  }

  const parsed = videoWebhookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid video webhook payload." },
      { status: 400 }
    );
  }

  // TODO: Forward video status updates to Convex `calls` mutations.
  return NextResponse.json({ ok: true });
}
