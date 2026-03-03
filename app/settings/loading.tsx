export default function SettingsLoading(): React.JSX.Element {
  return (
    <main id="main" className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <div className="h-8 w-40 animate-pulse rounded-md bg-[var(--muted)]" />
      <div className="h-48 animate-pulse rounded-lg border border-[var(--border)] bg-[var(--card)]" />
      <div className="h-44 animate-pulse rounded-lg border border-[var(--border)] bg-[var(--card)]" />
    </main>
  );
}
