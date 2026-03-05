"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useConvexAuth } from "convex/react";

import { api } from "@/convex/_generated/api";

/**
 * Syncs the current Clerk user into the Convex users table (upsert) when
 * the user is signed in and Convex auth is ready. Runs once per session
 * per user so invites and other features that require a Convex user work.
 */
export function UserSync(): null {
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const ensureUser = useMutation(api.users.ensureUser);
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }
    if (syncedRef.current === user.id) {
      return;
    }

    const primaryEmail = user.primaryEmailAddress?.emailAddress ?? "";
    const displayName =
      user.fullName?.trim() ||
      user.username ||
      primaryEmail ||
      "User";
    const username = user.username ?? undefined;
    const avatarUrl = user.imageUrl ?? undefined;

    ensureUser({
      email: primaryEmail,
      displayName,
      username,
      avatarUrl
    })
      .then(() => {
        syncedRef.current = user.id;
      })
      .catch(() => {
        // Ignore errors (e.g. network); will retry on next mount/navigation
      });
  }, [isAuthenticated, user, ensureUser]);

  return null;
}
