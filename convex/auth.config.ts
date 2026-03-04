import { AuthConfig } from "convex/server";

/**
 * Clerk JWT issuer domain. Set CLERK_JWT_ISSUER_DOMAIN in the Convex Dashboard
 * (Settings → Environment Variables) for each deployment (dev/prod).
 * Get the value from Clerk Dashboard → Convex integration or API keys (Frontend API URL).
 * Normalized to no trailing slash so it matches JWT iss claim.
 */
const rawDomain = process.env.CLERK_JWT_ISSUER_DOMAIN;
const clerkDomain =
  typeof rawDomain === "string" && rawDomain.length > 0 ? rawDomain.replace(/\/$/, "") : undefined;

export default {
  providers: [
    {
      domain: clerkDomain!,
      applicationID: "convex"
    }
  ]
} satisfies AuthConfig;
