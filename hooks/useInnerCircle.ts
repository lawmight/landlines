"use client";

import { useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

/**
 * Loads accepted inner-circle members enriched with live presence.
 */
export function useInnerCircle(): {
  members: Array<{
    clerkId: string;
    displayName: string;
    avatarUrl?: string;
    username?: string;
    presence: "home" | "away";
  }>;
  isLoading: boolean;
} {
  const { user } = useUser();

  const members = useQuery(api.users.listInnerCircle, user ? { viewerClerkId: user.id } : "skip");
  const presenceRows = useQuery(
    api.presence.listByUserIds,
    members ? { userClerkIds: (members as any[]).map((member: any) => member.clerkId) } : "skip"
  );

  const merged = useMemo(() => {
    if (!members) {
      return [];
    }

    const presenceMap = new Map((presenceRows ?? []).map((row: { userClerkId: string; state: "home" | "away" }) => [row.userClerkId, row.state]));

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
