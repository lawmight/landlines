"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

import { env } from "@/lib/env";

const DEBUG_LOG_ENDPOINT = "http://127.0.0.1:7307/ingest/9b972a57-2611-4afd-ba02-1fd234763dc7";
const SESSION_ID = "814185";

function decodeJwtPayload(token: string): { iss?: string; aud?: string | string[] } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    ) as { iss?: string; aud?: string | string[] };
    return payload;
  } catch {
    return null;
  }
}

/**
 * Logs Convex auth debug info (JWT iss/aud, Convex URL) when signed in.
 * Wrapped in #region so it can be removed after debugging.
 */
export function AuthDebugLogger(): React.JSX.Element | null {
  const { isSignedIn, getToken } = useAuth();
  const logged = useRef(false);

  useEffect(() => {
    if (!isSignedIn || logged.current) return;
    let cancelled = false;

    (async () => {
      try {
        // #region agent log
        const token = await getToken({ template: "convex" });
        if (cancelled) return;
        if (!token) {
          fetch(DEBUG_LOG_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Debug-Session-Id": SESSION_ID
            },
            body: JSON.stringify({
              sessionId: SESSION_ID,
              location: "AuthDebugLogger:getToken",
              message: "Convex token missing",
              data: { hasToken: false },
              timestamp: Date.now(),
              hypothesisId: "D"
            })
          }).catch(() => {});
          return;
        }
        const payload = decodeJwtPayload(token);
        const convexUrl = env.NEXT_PUBLIC_CONVEX_URL ?? "(missing)";
        const logData = {
          iss: payload?.iss ?? "(decode failed)",
          aud: payload?.aud,
          audType: typeof payload?.aud,
          audIsArray: Array.isArray(payload?.aud),
          audString: typeof payload?.aud === "string" ? payload.aud : JSON.stringify(payload?.aud),
          convexUrl: convexUrl.replace(/^https?:\/\//, "").split("/")[0]
        };
        if (typeof window !== "undefined") {
          console.log("[Convex auth debug]", logData);
        }
        fetch(DEBUG_LOG_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": SESSION_ID
          },
          body: JSON.stringify({
            sessionId: SESSION_ID,
            location: "AuthDebugLogger:token",
            message: "Convex JWT and Convex URL",
            data: logData,
            timestamp: Date.now(),
            hypothesisId: "A"
          })
        }).catch(() => {});
        logged.current = true;
        // #endregion
      } catch (_) {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, getToken]);

  return null;
}
