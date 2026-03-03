import { AppShell } from "@/components/AppShell";

export default function InvitesLoading(): React.JSX.Element {
  return (
    <AppShell activeSection="invites" maxWidth="max-w-5xl">
      <div className="flex flex-col gap-6">
        <div className="h-8 w-48 animate-pulse bg-[var(--muted)]" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-72 animate-pulse border border-[var(--border)] bg-[var(--card)]" />
          <div className="h-72 animate-pulse border border-[var(--border)] bg-[var(--card)]" />
        </div>
      </div>
    </AppShell>
  );
}
