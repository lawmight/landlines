"use client";

import { useMemo } from "react";
import { useQuery, useConvexAuth } from "convex/react";

import { api } from "@/convex/_generated/api";

/**
 * Loads accepted inner-circle members enriched with live presence.
 * Uses Convex auth state so the query runs only after the Convex client has
 * the validated token (avoids Unauthorized when Clerk user is ready before token).
 */
export function useInnerCircle(): {
  members: Array<{
    clerkId: string;
    displayName: string;
    avatarUrl?: string;
    username?: string;
    presence: "home" | "away";
    canReach: boolean;
  }>;
  isLoading: boolean;
} {
  const { isAuthenticated } = useConvexAuth();

  const members = useQuery(api.users.listInnerCircle, isAuthenticated ? {} : "skip");
  const presenceRows = useQuery(
    api.presence.listByUserIds,
    members ? { userClerkIds: (members as any[]).map((member: any) => member.clerkId) } : "skip"
  );

  const merged = useMemo(() => {
    if (!members) {
      return [];
    }

    const presenceMap = new Map<string, "home" | "away">(
      (presenceRows ?? []).map((row) => [row.userClerkId, row.state as "home" | "away"])
    );

    return (members as any[]).map((member: any) => ({
      ...member,
      presence: (presenceMap.get(member.clerkId) ?? member.presence) as "home" | "away"
    }));
  }, [members, presenceRows]);

  return {
    members: merged,
    isLoading: !members
  };
}
