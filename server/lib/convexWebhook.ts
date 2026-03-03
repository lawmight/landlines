import { serverEnv } from "./env";

interface MutationPayload {
  path: string;
  args: Record<string, unknown>;
}

export async function forwardToConvexMutation({ path, args }: MutationPayload): Promise<void> {
  const response = await fetch(`${serverEnv.NEXT_PUBLIC_CONVEX_URL}/api/mutation`, {
    method: "POST",
    headers: {
      Authorization: `Convex ${serverEnv.CONVEX_DEPLOY_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path,
      format: "convex_encoded_json",
      args: [args],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Convex mutation ${path} failed: ${response.status} ${text}`);
  }

  const payload = (await response.json()) as { status?: string; errorMessage?: string };
  if (payload.status === "error") {
    throw new Error(payload.errorMessage ?? `Convex mutation ${path} returned an error.`);
  }
}
