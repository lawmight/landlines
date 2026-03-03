import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const nonEmptyString = z.string().min(1);

export const serverEnv = createEnv({
  server: {
    CONVEX_DEPLOY_KEY: nonEmptyString,
    CORS_ORIGIN: z.string().url().optional(),
    NEXT_PUBLIC_CONVEX_URL: z.string().url(),
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
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

function missing(name: string): never {
  throw new Error(`Missing required environment variable: ${name}`);
}

export function serverTwilioApiKeySid(): string {
  return serverEnv.TWILIO_API_KEY_SID ?? serverEnv.TWILIO_API_KEY ?? missing("TWILIO_API_KEY_SID (or TWILIO_API_KEY)");
}

export function serverTwilioApiKeySecret(): string {
  return serverEnv.TWILIO_API_KEY_SECRET ?? serverEnv.TWILIO_API_SECRET ?? missing("TWILIO_API_KEY_SECRET (or TWILIO_API_SECRET)");
}
