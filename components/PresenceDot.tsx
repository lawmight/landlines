"use client";

import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

interface PresenceDotProps {
  userClerkId: string;
}

/**
 * Presence indicator powered by Convex reactive queries.
 */
export function PresenceDot({ userClerkId }: PresenceDotProps): React.JSX.Element {
  const presence = useQuery(api.presence.getPresence, { userClerkId });
  const isHome = presence?.state === "home";

  return (
    <span className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
      <span
        className={cn(
          "inline-flex h-2.5 w-2.5 rounded-full",
          isHome ? "bg-[var(--success)] shadow-[0_0_12px_rgba(16,185,129,0.8)]" : "bg-[var(--muted-foreground)]"
        )}
      />
      {isHome ? "Home" : "Away"}
    </span>
  );
}
