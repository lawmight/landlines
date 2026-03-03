import { AppShell } from "@/components/AppShell";

export default function SettingsLoading(): React.JSX.Element {
  return (
    <AppShell activeSection="settings" maxWidth="max-w-4xl">
      <div className="flex flex-col gap-6">
        <div className="h-8 w-40 animate-pulse bg-[var(--muted)]" />
        <div className="h-48 animate-pulse border border-[var(--border)] bg-[var(--card)]" />
        <div className="h-44 animate-pulse border border-[var(--border)] bg-[var(--card)]" />
      </div>
    </AppShell>
  );
}
