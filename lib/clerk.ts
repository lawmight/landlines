import { auth } from "@clerk/nextjs/server";

/**
 * Ensures the current request is authenticated and returns the user id.
 */
export async function requireAuthUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}
