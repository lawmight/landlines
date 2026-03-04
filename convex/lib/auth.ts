import type { QueryCtx } from "../_generated/server";

/**
 * Context type that exposes auth. Use for shared helpers that need identity.
 * Compatible with both query and mutation context.
 */
type AuthCtx = Pick<QueryCtx, "auth">;

/**
 * Clerk identity from Convex auth. subject is the Clerk user ID (sub claim).
 */
export type ClerkIdentity = { subject: string; email?: string; [key: string]: unknown };

/**
 * Returns the current user's Clerk ID (JWT sub). Throws if not authenticated.
 * Use in queries/mutations that require a signed-in user.
 */
export async function requireAuthenticatedClerkId(ctx: AuthCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.subject) {
    throw new Error("Unauthorized");
  }
  return identity.subject as string;
}

/**
 * Returns the current user's identity or null if not authenticated.
 * Use when you need optional auth (e.g. show different UI for anon vs logged-in).
 */
export async function getOptionalIdentity(ctx: AuthCtx): Promise<ClerkIdentity | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.subject) return null;
  return identity as ClerkIdentity;
}
