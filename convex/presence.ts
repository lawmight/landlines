import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import type { DatabaseReader } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { requireAuthenticatedClerkId } from "./lib/auth";

const HEARTBEAT_WINDOW_MS = 35_000;

async function findPresenceByUser(db: DatabaseReader, userClerkId: string): Promise<Doc<"presence"> | null> {
  return await db
    .query("presence")
    .withIndex("by_user_clerk_id", (q) => q.eq("userClerkId", userClerkId))
    .first();
}

/**
 * Records a presence heartbeat and marks the user as online.
 */
export const heartbeat = mutation({
  args: {
    networkQuality: v.optional(v.union(v.literal("good"), v.literal("poor"), v.literal("unknown"))),
    currentCallRoom: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const userClerkId = await requireAuthenticatedClerkId(ctx);
    const now = Date.now();
    const existing = await findPresenceByUser(ctx.db, userClerkId);

    const nextQuality = args.networkQuality ?? existing?.networkQuality ?? "unknown";

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastHeartbeatAt: now,
        state: "home",
        networkQuality: nextQuality,
        currentCallRoom: args.currentCallRoom
      });
      return { ok: true };
    }

    await ctx.db.insert("presence", {
      userClerkId,
      lastHeartbeatAt: now,
      state: "home",
      networkQuality: nextQuality,
      currentCallRoom: args.currentCallRoom
    });

    return { ok: true };
  }
});

/**
 * Marks a user as away, typically on explicit sign-out or tab unload.
 */
export const markAway = mutation({
  args: {},
  handler: async (ctx) => {
    const userClerkId = await requireAuthenticatedClerkId(ctx);
    const existing = await findPresenceByUser(ctx.db, userClerkId);

    if (!existing) {
      return { ok: true };
    }

    await ctx.db.patch(existing._id, {
      state: "away",
      currentCallRoom: undefined
    });

    return { ok: true };
  }
});

/**
 * Returns a single user's live presence snapshot.
 */
export const getPresence = query({
  args: {
    userClerkId: v.string()
  },
  handler: async (ctx, args) => {
    const existing = await findPresenceByUser(ctx.db, args.userClerkId);

    if (!existing) {
      return {
        userClerkId: args.userClerkId,
        state: "away" as const,
        networkQuality: "unknown" as const,
        isOnline: false,
        lastHeartbeatAt: 0,
        currentCallRoom: null
      };
    }

    const isOnline = Date.now() - existing.lastHeartbeatAt <= HEARTBEAT_WINDOW_MS;

    return {
      userClerkId: existing.userClerkId,
      state: isOnline ? "home" : "away",
      networkQuality: existing.networkQuality,
      isOnline,
      lastHeartbeatAt: existing.lastHeartbeatAt,
      currentCallRoom: existing.currentCallRoom ?? null
    };
  }
});

/**
 * Returns live presence snapshots for a list of users.
 */
export const listByUserIds = query({
  args: {
    userClerkIds: v.array(v.string())
  },
  handler: async (ctx, args) => {
    if (args.userClerkIds.length === 0) {
      return [];
    }

    const rows = await ctx.db.query("presence").collect();
    const requested = new Set(args.userClerkIds);

    return rows
      .filter((row: any) => requested.has(row.userClerkId))
      .map((row) => {
        const isOnline = Date.now() - row.lastHeartbeatAt <= HEARTBEAT_WINDOW_MS;
        return {
          userClerkId: row.userClerkId,
          state: isOnline ? "home" : "away",
          networkQuality: row.networkQuality,
          lastHeartbeatAt: row.lastHeartbeatAt,
          currentCallRoom: row.currentCallRoom ?? null
        };
      });
  }
});

/**
 * Marks stale users as away when heartbeat freshness is exceeded.
 */
export const markStaleAsAway = mutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - HEARTBEAT_WINDOW_MS;
    const allPresence = await ctx.db.query("presence").collect();

    const stale = allPresence.filter((item) => item.lastHeartbeatAt < cutoff && item.state === "home");
    await Promise.all(
      stale.map((item) =>
        ctx.db.patch(item._id, {
          state: "away",
          currentCallRoom: undefined
        })
      )
    );

    return { updated: stale.length };
  }
});
