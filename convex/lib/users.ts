import type { DatabaseReader } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

/**
 * Finds a user by Clerk id using the by_clerk_id index.
 * Returns null if no user exists (e.g. not yet synced from Clerk).
 */
export async function findUserByClerkId(
  db: DatabaseReader,
  clerkId: string
): Promise<Doc<"users"> | null> {
  return await db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();
}
