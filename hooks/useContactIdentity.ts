"use client";

import { useMemo } from "react";

import { useInnerCircle } from "@/hooks/useInnerCircle";

interface ContactIdentity {
  displayName: string;
  avatarUrl?: string;
  initials: string;
  isKnown: boolean;
}

function deriveInitials(displayName: string): string {
  const parts = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "LL";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function getFallbackName(userClerkId?: string): string {
  return userClerkId ? "Reachable contact" : "Remote line";
}

/**
 * Resolves a presentable identity for inner-circle contacts used throughout call surfaces.
 */
export function useContactIdentity(userClerkId?: string): ContactIdentity {
  const { members } = useInnerCircle();

  const member = useMemo(
    () => (userClerkId ? members.find((candidate) => candidate.clerkId === userClerkId) : undefined),
    [members, userClerkId]
  );

  const displayName = member?.displayName ?? getFallbackName(userClerkId);

  return {
    displayName,
    avatarUrl: member?.avatarUrl,
    initials: deriveInitials(displayName),
    isKnown: Boolean(member)
  };
}
