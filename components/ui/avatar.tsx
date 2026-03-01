import * as React from "react";

import { cn } from "@/lib/utils";

interface AvatarContextValue {
  fallback: string;
}

const AvatarContext = React.createContext<AvatarContextValue>({ fallback: "?" });

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  fallback: string;
}

/**
 * Lightweight avatar wrapper used by shadcn-style consumers.
 */
export function Avatar({ className, fallback, ...props }: AvatarProps): React.JSX.Element {
  return (
    <AvatarContext.Provider value={{ fallback }}>
      <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />
    </AvatarContext.Provider>
  );
}

/**
 * Avatar image element.
 */
export function AvatarImage({ className, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>): React.JSX.Element {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={cn("aspect-square h-full w-full object-cover", className)} alt={alt ?? "Avatar"} {...props} />;
}

/**
 * Avatar fallback shown when image is unavailable.
 */
export function AvatarFallback({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  const { fallback } = React.useContext(AvatarContext);

  return (
    <div className={cn("flex h-full w-full items-center justify-center rounded-full bg-[var(--muted)]", className)} {...props}>
      {children ?? fallback}
    </div>
  );
}
