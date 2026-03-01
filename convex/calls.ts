import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

const RING_TIMEOUT_MS = 45_000;

/**
 * Creates a new call request and sets it to ringing.
 */
export const initiateCall = mutation({
  args: {
    callerClerkId: v.string(),
    calleeClerkId: v.string(),
    type: v.union(v.literal("voice"), v.literal("video"))
  },
  handler: async (ctx, args) => {
    if (args.callerClerkId === args.calleeClerkId) {
      throw new Error("Cannot call yourself.");
    }

    const allInvites = await ctx.db.query("invites").collect();
    const permissionLinks = allInvites.filter(
      (invite: any) => invite.inviterClerkId === args.calleeClerkId && invite.status === "accepted"
    );
    const canReach = permissionLinks.some((invite) => invite.inviteeClerkId === args.callerClerkId);

    if (!canReach) {
      throw new Error("You can only reach users who explicitly accepted you in their inner circle.");
    }

    const now = Date.now();
    const callId = await ctx.db.insert("calls", {
      roomName: "pending",
      type: args.type,
      status: "ringing",
      callerClerkId: args.callerClerkId,
      calleeClerkId: args.calleeClerkId,
      createdAt: now,
      ringingUntil: now + RING_TIMEOUT_MS
    });

    const roomName = String(callId);
    await ctx.db.patch(callId, { roomName });

    return { callId, roomName };
  }
});

/**
 * Returns the current incoming ringing call for a callee.
 */
export const getIncomingCall = query({
  args: {
    calleeClerkId: v.string()
  },
  handler: async (ctx, args) => {
    const allCalls = await ctx.db.query("calls").collect();
    const ringing = allCalls.filter(
      (call: any) => call.calleeClerkId === args.calleeClerkId && call.status === "ringing"
    );

    const now = Date.now();
    const valid = ringing
      .filter((call) => call.ringingUntil > now)
      .sort((a, b) => b.createdAt - a.createdAt);

    return valid[0] ?? null;
  }
});

/**
 * Returns recent calls for a user sorted newest-first.
 */
export const listCallsForUser = query({
  args: {
    userClerkId: v.string()
  },
  handler: async (ctx, args) => {
    const allCalls = await ctx.db.query("calls").collect();
    const callerCalls = allCalls.filter((call: any) => call.callerClerkId === args.userClerkId && call.status === "active");
    const calleeCalls = allCalls.filter((call: any) => call.calleeClerkId === args.userClerkId && call.status === "active");
    const ringingCalls = allCalls.filter(
      (call: any) => call.calleeClerkId === args.userClerkId && call.status === "ringing"
    );
    const completedCallerCalls = allCalls.filter(
      (call: any) => call.callerClerkId === args.userClerkId && call.status === "ended"
    );
    const completedCalleeCalls = allCalls.filter(
      (call: any) => call.calleeClerkId === args.userClerkId && call.status === "ended"
    );

    return [...callerCalls, ...calleeCalls, ...ringingCalls, ...completedCallerCalls, ...completedCalleeCalls].sort(
      (a, b) => b.createdAt - a.createdAt
    );
  }
});

/**
 * Transitions a ringing call to active after the callee accepts.
 */
export const acceptCall = mutation({
  args: {
    callId: v.id("calls"),
    calleeClerkId: v.string()
  },
  handler: async (ctx, args) => {
    const call = await ctx.db.get(args.callId);
    if (!call) {
      throw new Error("Call not found.");
    }
    if (call.calleeClerkId !== args.calleeClerkId) {
      throw new Error("Only the callee can accept this call.");
    }
    if (call.status !== "ringing") {
      throw new Error("Call is not in ringing state.");
    }
    if (call.ringingUntil < Date.now()) {
      await ctx.db.patch(call._id, {
        status: "missed",
        endedAt: Date.now(),
        endReason: "no_answer"
      });
      throw new Error("Call timed out.");
    }

    await ctx.db.patch(call._id, {
      status: "active",
      acceptedAt: Date.now()
    });

    return { ok: true, roomName: call.roomName };
  }
});

/**
 * Marks a ringing call as missed when the callee ignores it.
 */
export const ignoreCall = mutation({
  args: {
    callId: v.id("calls"),
    calleeClerkId: v.string()
  },
  handler: async (ctx, args) => {
    const call = await ctx.db.get(args.callId);
    if (!call) {
      return { ok: true };
    }
    if (call.calleeClerkId !== args.calleeClerkId) {
      throw new Error("Only the callee can ignore this call.");
    }

    if (call.status === "ringing") {
      await ctx.db.patch(call._id, {
        status: "missed",
        endedAt: Date.now(),
        endReason: "ignored"
      });
    }

    return { ok: true };
  }
});

/**
 * Ends an active or ringing call for either participant.
 */
export const endCall = mutation({
  args: {
    callId: v.id("calls"),
    actorClerkId: v.string(),
    reason: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const call = await ctx.db.get(args.callId);
    if (!call) {
      return { ok: true };
    }
    const isParticipant = call.callerClerkId === args.actorClerkId || call.calleeClerkId === args.actorClerkId;
    if (!isParticipant) {
      throw new Error("Only call participants can end a call.");
    }

    await ctx.db.patch(call._id, {
      status: "ended",
      endedAt: Date.now(),
      endReason: args.reason ?? "hangup"
    });

    return { ok: true };
  }
});

/**
 * Marks a call failed due to network interruption or media errors.
 */
export const failCall = mutation({
  args: {
    callId: v.id("calls"),
    actorClerkId: v.string(),
    reason: v.string()
  },
  handler: async (ctx, args) => {
    const call = await ctx.db.get(args.callId);
    if (!call) {
      return { ok: true };
    }

    const isParticipant = call.callerClerkId === args.actorClerkId || call.calleeClerkId === args.actorClerkId;
    if (!isParticipant) {
      throw new Error("Only call participants can fail a call.");
    }

    await ctx.db.patch(call._id, {
      status: "failed",
      endedAt: Date.now(),
      endReason: args.reason
    });

    return { ok: true };
  }
});

/**
 * Converts timed-out ringing calls into missed calls.
 */
export const markMissedRingingCalls = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const allCalls = await ctx.db.query("calls").collect();
    const staleRinging = allCalls.filter((call) => call.status === "ringing" && call.ringingUntil < now);

    await Promise.all(
      staleRinging.map((call) =>
        ctx.db.patch(call._id, {
          status: "missed",
          endedAt: now,
          endReason: "no_answer"
        })
      )
    );

    return { marked: staleRinging.length };
  }
});
