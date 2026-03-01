"use client";

import { useUser } from "@clerk/nextjs";

import { usePresence } from "@/hooks/usePresence";

interface PresenceHeartbeatProps {
  currentCallRoom?: string;
}

/**
 * Keeps signed-in user presence fresh with periodic Convex heartbeats.
 */
export function PresenceHeartbeat({ currentCallRoom }: PresenceHeartbeatProps): null {
  const { user } = useUser();
  usePresence(user?.id, currentCallRoom);
  return null;
}
