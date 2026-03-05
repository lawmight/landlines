import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CallStatusTone = "neutral" | "accent" | "success" | "danger";

interface CallPanelProps {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

interface CallStatusChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: CallStatusTone;
}

interface CallFactProps {
  label: string;
  value: React.ReactNode;
  tone?: CallStatusTone;
}

const toneClasses: Record<CallStatusTone, string> = {
  neutral: "border-[var(--border)] bg-[var(--muted)]/60 text-[var(--foreground)]",
  accent: "border-[var(--primary)]/25 bg-[var(--primary)]/10 text-[var(--primary)]",
  success: "border-[var(--success)]/20 bg-[var(--success)]/10 text-[var(--success)]",
  danger: "border-[var(--danger)]/20 bg-[var(--danger)]/10 text-[var(--danger)]"
};

const toneTextClasses: Record<CallStatusTone, string> = {
  neutral: "text-[var(--foreground)]",
  accent: "text-[var(--primary)]",
  success: "text-[var(--success)]",
  danger: "text-[var(--danger)]"
};

/**
 * Reusable content block for incoming and active call surfaces.
 */
export function CallPanel({
  eyebrow,
  title,
  description,
  children,
  className,
  contentClassName
}: CallPanelProps): React.JSX.Element {
  return (
    <Card className={cn("rounded-[2rem] border-[var(--border)]/80 bg-[var(--card)]/95 shadow-[0_24px_70px_rgba(26,23,20,0.1)]", className)}>
      <CardHeader className="space-y-3 p-7 pb-0">
        <p className="label-caps">{eyebrow}</p>
        <CardTitle className="display-serif text-[clamp(2rem,3vw,2.7rem)] font-light leading-none tracking-[0.01em]">
          {title}
        </CardTitle>
        {description ? <CardDescription className="max-w-xl text-sm leading-6">{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className={cn("p-7 pt-6", contentClassName)}>{children}</CardContent>
    </Card>
  );
}

/**
 * Small tone-aware chip for live call state.
 */
export function CallStatusChip({
  tone = "neutral",
  className,
  ...props
}: CallStatusChipProps): React.JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em]",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

/**
 * Responsive facts grid used across the call UI.
 */
export function CallFactGrid({ className, ...props }: React.HTMLAttributes<HTMLDListElement>): React.JSX.Element {
  return <dl className={cn("grid gap-3 sm:grid-cols-2", className)} {...props} />;
}

/**
 * Single label/value item for call metadata.
 */
export function CallFact({ label, value, tone = "neutral" }: CallFactProps): React.JSX.Element {
  return (
    <div className="rounded-[1.5rem] border border-[var(--border)]/70 bg-[var(--muted)]/45 p-4">
      <dt className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{label}</dt>
      <dd className={cn("mt-3 text-sm font-medium", toneTextClasses[tone])}>{value}</dd>
    </div>
  );
}
