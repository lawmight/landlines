import { AppShell } from "@/components/AppShell";

export default function DashboardLoading(): React.JSX.Element {
  return (
    <AppShell activeSection="dashboard" maxWidth="max-w-5xl">
      <div className="flex flex-col gap-6">
        <div className="h-8 w-56 animate-pulse bg-[var(--muted)]" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-44 animate-pulse border border-[var(--border)] bg-[var(--card)]" />
          <div className="h-44 animate-pulse border border-[var(--border)] bg-[var(--card)]" />
        </div>
        <div className="h-64 animate-pulse border border-[var(--border)] bg-[var(--card)]" />
      </div>
    </AppShell>
  );
}
