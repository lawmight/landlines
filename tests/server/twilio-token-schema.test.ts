import { describe, expect, it } from "vitest";

import { tokenRequestSchema } from "@/server/lib/schemas";

describe("tokenRequestSchema", () => {
  it("accepts valid identity, room name, and mode", () => {
    const parsed = tokenRequestSchema.safeParse({
      identity: "alice_123",
      mode: "video",
      roomName: "room-1"
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects invalid identity characters", () => {
    const parsed = tokenRequestSchema.safeParse({
      identity: "alice@example.com",
      mode: "video",
      roomName: "room-1"
    });

    expect(parsed.success).toBe(false);
  });

  it("defaults mode to video", () => {
    const parsed = tokenRequestSchema.parse({
      identity: "alice_123",
      roomName: "room-1"
    });

    expect(parsed.mode).toBe("video");
  });
});
