const DEFAULT_LOOPBACK_ORIGIN = "http://localhost:3000";
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1"]);

function normalizeOrigin(origin: string): string | null {
  try {
    return new URL(origin).origin;
  } catch {
    return null;
  }
}

function getLoopbackEquivalentOrigins(origin: string): string[] {
  const parsed = new URL(origin);
  if (!LOOPBACK_HOSTS.has(parsed.hostname)) {
    return [];
  }

  return Array.from(
    new Set(
      ["localhost", "127.0.0.1"].map((hostname) => {
        const url = new URL(origin);
        url.hostname = hostname;
        return url.origin;
      })
    )
  );
}

export function getAllowedCorsOrigins(configuredOrigin?: string): string[] {
  const configured = normalizeOrigin(configuredOrigin ?? "") ?? DEFAULT_LOOPBACK_ORIGIN;
  return Array.from(new Set([configured, ...getLoopbackEquivalentOrigins(configured)]));
}

export function resolveCorsOrigin(requestOrigin: string | undefined, configuredOrigin?: string): string | null {
  const normalizedRequestOrigin = normalizeOrigin(requestOrigin ?? "");
  if (!normalizedRequestOrigin) {
    return null;
  }

  return getAllowedCorsOrigins(configuredOrigin).includes(normalizedRequestOrigin) ? normalizedRequestOrigin : null;
}
