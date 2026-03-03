import { Polar } from "@polar-sh/sdk";

import { env } from "@/lib/env";

if (!env.POLAR_ACCESS_TOKEN) {
  throw new Error("POLAR_ACCESS_TOKEN is required.");
}

export const polar = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: "sandbox"
});
