export default function DashboardLoading(): React.JSX.Element {
  return (
    <main id="main" className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="h-8 w-56 animate-pulse rounded-md bg-[var(--muted)]" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-44 animate-pulse rounded-lg border border-[var(--border)] bg-[var(--card)]" />
        <div className="h-44 animate-pulse rounded-lg border border-[var(--border)] bg-[var(--card)]" />
      </div>
      <div className="h-64 animate-pulse rounded-lg border border-[var(--border)] bg-[var(--card)]" />
    </main>
  );
}
