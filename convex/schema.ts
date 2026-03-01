import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    username: v.optional(v.string()),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    subscriptionTier: v.union(v.literal("free"), v.literal("pro")),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_username", ["username"]),

  invites: defineTable({
    inviterClerkId: v.string(),
    inviteeClerkId: v.optional(v.string()),
    inviteeEmail: v.optional(v.string()),
    inviteeUsername: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("ignored"),
      v.literal("revoked"),
      v.literal("expired")
    ),
    expiresAt: v.number(),
    createdAt: v.number(),
    respondedAt: v.optional(v.number())
  })
    .index("by_inviter_status", ["inviterClerkId", "status"])
    .index("by_invitee_status", ["inviteeClerkId", "status"])
    .index("by_invitee_email_status", ["inviteeEmail", "status"])
    .index("by_invitee_username_status", ["inviteeUsername", "status"]),

  calls: defineTable({
    roomName: v.string(),
    type: v.union(v.literal("voice"), v.literal("video")),
    status: v.union(
      v.literal("ringing"),
      v.literal("active"),
      v.literal("ended"),
      v.literal("failed"),
      v.literal("missed")
    ),
    callerClerkId: v.string(),
    calleeClerkId: v.string(),
    createdAt: v.number(),
    ringingUntil: v.number(),
    acceptedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    endReason: v.optional(v.string())
  })
    .index("by_callee_status", ["calleeClerkId", "status"])
    .index("by_caller_status", ["callerClerkId", "status"])
    .index("by_room_name", ["roomName"]),

  presence: defineTable({
    userClerkId: v.string(),
    lastHeartbeatAt: v.number(),
    state: v.union(v.literal("home"), v.literal("away")),
    networkQuality: v.union(v.literal("good"), v.literal("poor"), v.literal("unknown")),
    currentCallRoom: v.optional(v.string())
  }).index("by_user_clerk_id", ["userClerkId"])
});
