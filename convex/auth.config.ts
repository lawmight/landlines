import { AuthConfig } from "convex/server";

/**
 * Clerk JWT issuer domain. In the Convex Dashboard (Settings → Environment Variables),
 * set either:
 * - CLERK_JWT_ISSUER_DOMAIN (Convex docs), or
 * - CLERK_FRONTEND_API_URL (Clerk Convex integration setup).
 * Both use the same value: your Clerk Frontend API URL (e.g. https://prompt-cobra-90.clerk.accounts.dev).
 * Normalized to no trailing slash so it matches JWT iss claim.
 *
 * Required: In Clerk Dashboard, activate the Convex integration so the "convex"
 * JWT template is created with audience (aud) claim "convex". Without aud, Convex
 * rejects the token with "No auth provider found matching the given token".
 */
const rawDomain =
  process.env.CLERK_JWT_ISSUER_DOMAIN ?? process.env.CLERK_FRONTEND_API_URL;
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
