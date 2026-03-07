const DEPRECATED_ROOM_TYPES = new Set(["group-small", "peer-to-peer", "peer-to-peer-mesh"]); // pragma: allowlist secret

export function normalizeTwilioVideoRoomType(roomTypeRaw?: string): string {
  const normalized = roomTypeRaw?.trim() || "group";
  return DEPRECATED_ROOM_TYPES.has(normalized) ? "group" : normalized;
}
