import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

import { cn } from "@/lib/utils";

type AppShellSection = "dashboard" | "invites" | "settings";

interface AppShellProps {
  children: React.ReactNode;
  activeSection: AppShellSection;
  maxWidth?: string;
}

const sections: Array<{ href: `/${AppShellSection}`; label: string; key: AppShellSection }> = [
  { href: "/dashboard", label: "Dashboard", key: "dashboard" },
  { href: "/invites", label: "Invites", key: "invites" },
  { href: "/settings", label: "Settings", key: "settings" }
];

/**
 * Shared warm app frame for authenticated pages.
 */
export function AppShell({
  children,
  activeSection,
  maxWidth = "max-w-[720px]"
}: AppShellProps): React.JSX.Element {
  return (
    <div className="app-shell min-h-screen">
      <nav className="mx-auto flex w-full max-w-[920px] items-center justify-between border-b border-[var(--border)] px-6 py-6">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          Landlines
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            {sections.map((section) => (
              <Link
                key={section.key}
                href={section.href}
                className={cn(
                  "text-[11px] uppercase tracking-[0.2em] text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]",
                  section.key === activeSection && "text-[var(--foreground)]"
                )}
              >
                {section.label}
              </Link>
            ))}
          </div>
          <UserButton />
        </div>
      </nav>
      <main id="main" className={cn("mx-auto w-full px-6 py-10", maxWidth)}>
        {children}
      </main>
    </div>
  );
}
