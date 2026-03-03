"use client";

import { useEffect, useMemo } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

type NetworkQuality = "good" | "poor" | "unknown";

const HEARTBEAT_INTERVAL_MS = 30_000;

/**
 * Keeps the current user presence alive with a 30-second heartbeat.
 */
export function usePresence(userClerkId?: string, currentCallRoom?: string): {
  isOnline: boolean;
  state: "home" | "away";
  networkQuality: NetworkQuality;
} {
  const { isAuthenticated } = useConvexAuth();
  const heartbeat = useMutation(api.presence.heartbeat);
  const markAway = useMutation(api.presence.markAway);
  const snapshot = useQuery(api.presence.getPresence, userClerkId ? { userClerkId } : "skip");

  const inferredNetworkQuality = useMemo<NetworkQuality>(() => {
    const maybeConnection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
    const effectiveType = maybeConnection?.effectiveType;

    if (!effectiveType) {
      return "unknown";
    }

    if (effectiveType.includes("2g") || effectiveType === "slow-2g") {
      return "poor";
    }

    return "good";
  }, []);

  useEffect(() => {
    if (!userClerkId || !isAuthenticated) {
      return;
    }

    const sendHeartbeat = (): void => {
      void heartbeat({
        currentCallRoom,
        networkQuality: inferredNetworkQuality
      });
    };

    sendHeartbeat();
    const timer = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
      void markAway({});
    };
  }, [currentCallRoom, heartbeat, inferredNetworkQuality, isAuthenticated, markAway, userClerkId]);

  return {
    isOnline: snapshot?.isOnline ?? false,
    state: (snapshot?.state ?? "away") as "home" | "away",
    networkQuality: (snapshot?.networkQuality ?? inferredNetworkQuality) as NetworkQuality
  };
}
