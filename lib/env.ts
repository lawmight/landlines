import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const nonEmptyString = z.string().min(1);

export const env = createEnv({
  server: {
    CLERK_SECRET_KEY: nonEmptyString,
    CONVEX_DEPLOY_KEY: nonEmptyString,
    CORS_ORIGIN: z.string().url().optional(),
    POLAR_ACCESS_TOKEN: nonEmptyString.optional(),
    SIGNALING_PORT: z.coerce.number().int().positive().optional(),
    TWILIO_ACCOUNT_SID: nonEmptyString,
    TWILIO_API_KEY: nonEmptyString.optional(),
    TWILIO_API_KEY_SECRET: nonEmptyString.optional(),
    TWILIO_API_KEY_SID: nonEmptyString.optional(),
    TWILIO_API_SECRET: nonEmptyString.optional(),
    TWILIO_AUTH_TOKEN: nonEmptyString,
    TWILIO_TWIML_APP_SID: nonEmptyString,
    TWILIO_VIDEO_ROOM_TYPE: nonEmptyString.optional(),
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: nonEmptyString,
    NEXT_PUBLIC_CONVEX_URL: z.string().url(),
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: nonEmptyString.optional(),
    NEXT_PUBLIC_SIGNALING_BASE_URL: z.string().url(),
  },
  runtimeEnv: {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CONVEX_DEPLOY_KEY: process.env.CONVEX_DEPLOY_KEY,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    NEXT_PUBLIC_SIGNALING_BASE_URL: process.env.NEXT_PUBLIC_SIGNALING_BASE_URL,
    POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
    SIGNALING_PORT: process.env.SIGNALING_PORT,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY: process.env.TWILIO_API_KEY,
    TWILIO_API_KEY_SECRET: process.env.TWILIO_API_KEY_SECRET,
    TWILIO_API_KEY_SID: process.env.TWILIO_API_KEY_SID,
    TWILIO_API_SECRET: process.env.TWILIO_API_SECRET,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_TWIML_APP_SID: process.env.TWILIO_TWIML_APP_SID,
    TWILIO_VIDEO_ROOM_TYPE: process.env.TWILIO_VIDEO_ROOM_TYPE,
  },
  emptyStringAsUndefined: true,
});

function missing(name: string): never {
  throw new Error(`Missing required environment variable: ${name}`);
}

export function twilioApiKeySid(): string {
  return env.TWILIO_API_KEY_SID ?? env.TWILIO_API_KEY ?? missing("TWILIO_API_KEY_SID (or TWILIO_API_KEY)");
}

export function twilioApiKeySecret(): string {
  return env.TWILIO_API_KEY_SECRET ?? env.TWILIO_API_SECRET ?? missing("TWILIO_API_KEY_SECRET (or TWILIO_API_SECRET)");
}
