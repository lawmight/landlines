import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

const HEARTBEAT_WINDOW_MS = 35_000;

/**
 * Finds a user by Clerk id.
 */
async function findUserByClerkId(ctx: { db: any }, clerkId: string): Promise<any | null> {
  const users = await ctx.db.query("users").collect();
  return users.find((item: any) => item.clerkId === clerkId) ?? null;
}

/**
 * Upserts a Convex user record from Clerk profile metadata.
 */
export const ensureUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    displayName: v.string(),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await findUserByClerkId(ctx, args.clerkId);

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        displayName: args.displayName,
        username: args.username,
        avatarUrl: args.avatarUrl,
        updatedAt: now
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      username: args.username,
      displayName: args.displayName,
      avatarUrl: args.avatarUrl,
      subscriptionTier: "free",
      createdAt: now,
      updatedAt: now
    });
  }
});

/**
 * Lists accepted inner circle members for the requesting user.
 */
export const listInnerCircle = query({
  args: {
    viewerClerkId: v.string()
  },
  handler: async (ctx, args) => {
    const allInvites = await ctx.db.query("invites").collect();
    const acceptedInvites = allInvites.filter(
      (invite: any) => invite.inviterClerkId === args.viewerClerkId && invite.status === "accepted"
    );

    const members = await Promise.all(
      acceptedInvites.map(async (invite) => {
        if (!invite.inviteeClerkId) {
          return null;
        }

        const user = await findUserByClerkId(ctx, invite.inviteeClerkId as string);

        if (!user) {
          return null;
        }

        const allPresence = await ctx.db.query("presence").collect();
        const presence = allPresence.find((entry: any) => entry.userClerkId === user.clerkId) ?? null;

        const isOnline = presence ? Date.now() - presence.lastHeartbeatAt <= HEARTBEAT_WINDOW_MS : false;

        return {
          clerkId: user.clerkId,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          username: user.username,
          presence: isOnline ? "home" : "away"
        };
      })
    );

    return members.filter((member): member is NonNullable<typeof member> => member !== null);
  }
});

/**
 * Returns whether the caller is allowed to reach the callee.
 */
export const canReachUser = query({
  args: {
    callerClerkId: v.string(),
    calleeClerkId: v.string()
  },
  handler: async (ctx, args) => {
    const allInvites = await ctx.db.query("invites").collect();
    const accepted = allInvites.filter(
      (invite: any) => invite.inviterClerkId === args.calleeClerkId && invite.status === "accepted"
    );

    return accepted.some((invite) => invite.inviteeClerkId === args.callerClerkId);
  }
});

/**
 * Returns the accepted inner circle count for the given user.
 */
export const getAcceptedInnerCircleCount = query({
  args: {
    userClerkId: v.string()
  },
  handler: async (ctx, args) => {
    const allInvites = await ctx.db.query("invites").collect();
    const accepted = allInvites.filter(
      (invite: any) => invite.inviterClerkId === args.userClerkId && invite.status === "accepted"
    );

    return accepted.length;
  }
});

/**
 * Updates subscription tier for a user from billing webhooks.
 */
export const setSubscriptionTier = mutation({
  args: {
    userClerkId: v.string(),
    subscriptionTier: v.union(v.literal("free"), v.literal("pro"))
  },
  handler: async (ctx, args) => {
    const user = await findUserByClerkId(ctx, args.userClerkId);

    if (!user) {
      throw new Error("User not found.");
    }

    await ctx.db.patch(user._id, {
      subscriptionTier: args.subscriptionTier,
      updatedAt: Date.now()
    });

    return { ok: true };
  }
});
