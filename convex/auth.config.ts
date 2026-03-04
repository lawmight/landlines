import { AuthConfig } from "convex/server";

/**
 * Clerk JWT issuer domain. Set CLERK_JWT_ISSUER_DOMAIN in the Convex Dashboard
 * (Settings → Environment Variables) for each deployment (dev/prod).
 * Get the value from Clerk Dashboard → Convex integration or API keys (Frontend API URL).
 */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex"
    }
  ]
} satisfies AuthConfig;
