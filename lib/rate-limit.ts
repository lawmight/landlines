import type { NextRequest } from "next/server";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

const PRUNE_INTERVAL_MS = 60_000;
let lastPruneAt = Date.now();

function pruneBuckets(now: number): void {
  if (now - lastPruneAt < PRUNE_INTERVAL_MS) {
    return;
  }
  lastPruneAt = now;
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function getRequestIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export function checkRateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  pruneBuckets(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { ok: true, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return {
    ok: true,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}
