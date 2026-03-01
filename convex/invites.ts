import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

const MAX_FREE_CONTACTS = 20;
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Finds a user by Clerk id.
 */
async function findUserByClerkId(ctx: { db: any }, clerkId: string): Promise<any | null> {
  const users = await ctx.db.query("users").collect();
  return users.find((user: any) => user.clerkId === clerkId) ?? null;
}

/**
 * Creates an invite from the inviter to an email or username.
 */
export const sendInvite = mutation({
  args: {
    inviterClerkId: v.string(),
    inviteeEmail: v.optional(v.string()),
    inviteeUsername: v.optional(v.string()),
    inviteeClerkId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    if (!args.inviteeEmail && !args.inviteeUsername && !args.inviteeClerkId) {
      throw new Error("An invite requires email, username, or clerk id.");
    }

    const inviter = await findUserByClerkId(ctx, args.inviterClerkId);

    if (!inviter) {
      throw new Error("Inviter must exist before sending invites.");
    }

    if (inviter.subscriptionTier === "free") {
      const allInvites = await ctx.db.query("invites").collect();
      const acceptedCount = allInvites.filter(
        (invite: any) => invite.inviterClerkId === args.inviterClerkId && invite.status === "accepted"
      );
      if (acceptedCount.length >= MAX_FREE_CONTACTS) {
        throw new Error("Free plan reached the 20 contact limit. Upgrade to Pro for unlimited contacts.");
      }
    }

    const allInvites = await ctx.db.query("invites").collect();
    const existing = allInvites.filter(
      (invite: any) => invite.inviterClerkId === args.inviterClerkId && invite.status === "pending"
    );

    const duplicate = existing.find(
      (invite) =>
        (args.inviteeClerkId && invite.inviteeClerkId === args.inviteeClerkId) ||
        (args.inviteeEmail && invite.inviteeEmail === args.inviteeEmail) ||
        (args.inviteeUsername && invite.inviteeUsername === args.inviteeUsername)
    );

    if (duplicate) {
      return duplicate._id;
    }

    const now = Date.now();

    return await ctx.db.insert("invites", {
      inviterClerkId: args.inviterClerkId,
      inviteeClerkId: args.inviteeClerkId,
      inviteeEmail: args.inviteeEmail,
      inviteeUsername: args.inviteeUsername,
      status: "pending",
      expiresAt: now + INVITE_TTL_MS,
      createdAt: now
    });
  }
});

/**
 * Accepts an invite and links the invitee to the inviter's inner circle.
 */
export const acceptInvite = mutation({
  args: {
    inviteId: v.id("invites"),
    inviteeClerkId: v.string()
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db.get(args.inviteId);
    if (!invite) {
      throw new Error("Invite not found.");
    }

    if (invite.status !== "pending") {
      throw new Error("Invite is no longer pending.");
    }

    if (invite.expiresAt < Date.now()) {
      await ctx.db.patch(invite._id, {
        status: "expired",
        respondedAt: Date.now()
      });
      throw new Error("Invite has expired.");
    }

    const inviter = await findUserByClerkId(ctx, invite.inviterClerkId);

    if (!inviter) {
      throw new Error("Inviter account is missing.");
    }

    if (inviter.subscriptionTier === "free") {
      const allInvites = await ctx.db.query("invites").collect();
      const acceptedCount = allInvites.filter(
        (entry: any) => entry.inviterClerkId === invite.inviterClerkId && entry.status === "accepted"
      );
      if (acceptedCount.length >= MAX_FREE_CONTACTS) {
        throw new Error("Inviter reached the free-plan contact limit.");
      }
    }

    await ctx.db.patch(invite._id, {
      status: "accepted",
      inviteeClerkId: args.inviteeClerkId,
      respondedAt: Date.now()
    });

    return { ok: true };
  }
});

/**
 * Ignores an invite without creating an inner circle link.
 */
export const ignoreInvite = mutation({
  args: {
    inviteId: v.id("invites"),
    inviteeClerkId: v.string()
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db.get(args.inviteId);
    if (!invite) {
      throw new Error("Invite not found.");
    }

    if (invite.status !== "pending") {
      return { ok: true };
    }

    if (invite.inviteeClerkId && invite.inviteeClerkId !== args.inviteeClerkId) {
      throw new Error("You are not authorized to ignore this invite.");
    }

    await ctx.db.patch(invite._id, {
      status: "ignored",
      inviteeClerkId: args.inviteeClerkId,
      respondedAt: Date.now()
    });

    return { ok: true };
  }
});

/**
 * Revokes a previously sent invite.
 */
export const revokeInvite = mutation({
  args: {
    inviteId: v.id("invites"),
    inviterClerkId: v.string()
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db.get(args.inviteId);
    if (!invite) {
      throw new Error("Invite not found.");
    }
    if (invite.inviterClerkId !== args.inviterClerkId) {
      throw new Error("You can only revoke your own invite.");
    }

    await ctx.db.patch(invite._id, {
      status: "revoked",
      respondedAt: Date.now()
    });

    return { ok: true };
  }
});

/**
 * Returns sent and received invites for a user inbox view.
 */
export const listInvitesForUser = query({
  args: {
    userClerkId: v.string(),
    email: v.optional(v.string()),
    username: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const allInvites = await ctx.db.query("invites").collect();
    const sent = allInvites.filter(
      (invite: any) => invite.inviterClerkId === args.userClerkId && invite.status === "pending"
    );
    const receivedById = allInvites.filter(
      (invite: any) => invite.inviteeClerkId === args.userClerkId && invite.status === "pending"
    );
    const receivedByEmail = args.email
      ? allInvites.filter((invite: any) => invite.inviteeEmail === args.email && invite.status === "pending")
      : [];
    const receivedByUsername = args.username
      ? allInvites.filter((invite: any) => invite.inviteeUsername === args.username && invite.status === "pending")
      : [];

    const receivedMap = new Map(
      [...receivedById, ...receivedByEmail, ...receivedByUsername].map((invite) => [invite._id, invite])
    );

    return {
      sent,
      received: Array.from(receivedMap.values())
    };
  }
});

/**
 * Expires all stale pending invites that have timed out.
 */
export const expireStaleInvites = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const allInvites = await ctx.db.query("invites").collect();
    const pending = allInvites.filter((invite) => invite.status === "pending");

    const stale = pending.filter((invite) => invite.expiresAt < now);
    await Promise.all(
      stale.map((invite) =>
        ctx.db.patch(invite._id, {
          status: "expired",
          respondedAt: now
        })
      )
    );

    return { expired: stale.length };
  }
});
