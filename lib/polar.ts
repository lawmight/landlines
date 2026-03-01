import { Polar } from "@polar-sh/sdk";

const polarAccessToken = process.env.POLAR_ACCESS_TOKEN;

if (!polarAccessToken) {
  throw new Error("POLAR_ACCESS_TOKEN is required.");
}

export const polar = new Polar({
  accessToken: polarAccessToken,
  server: "sandbox"
});
