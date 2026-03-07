import { describe, expect, it } from "vitest";

import { normalizeTwilioVideoRoomType } from "@/lib/twilio-room-type";

describe("normalizeTwilioVideoRoomType", () => {
  it("maps deprecated room types to group", () => {
    expect(normalizeTwilioVideoRoomType("group-small")).toBe("group"); // pragma: allowlist secret
    expect(normalizeTwilioVideoRoomType("peer-to-peer")).toBe("group");
    expect(normalizeTwilioVideoRoomType("peer-to-peer-mesh")).toBe("group");
  });

  it("keeps supported room types unchanged", () => {
    expect(normalizeTwilioVideoRoomType("group")).toBe("group");
    expect(normalizeTwilioVideoRoomType("go")).toBe("go");
  });

  it("defaults empty input to group", () => {
    expect(normalizeTwilioVideoRoomType()).toBe("group");
    expect(normalizeTwilioVideoRoomType("")).toBe("group");
  });
});
