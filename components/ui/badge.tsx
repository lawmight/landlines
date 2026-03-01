import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[var(--primary)] text-[var(--primary-foreground)]",
        secondary: "border-transparent bg-[var(--muted)] text-[var(--foreground)]",
        success: "border-transparent bg-[var(--success)]/20 text-[var(--success)]",
        destructive: "border-transparent bg-[var(--danger)]/20 text-[var(--danger)]",
        outline: "border-[var(--border)] text-[var(--foreground)]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

/**
 * Small status badge for call/presence state.
 */
export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>): React.JSX.Element {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
