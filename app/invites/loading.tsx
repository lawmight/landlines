export default function InvitesLoading(): React.JSX.Element {
  return (
    <main id="main" className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="h-8 w-48 animate-pulse rounded-md bg-[var(--muted)]" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-lg border border-[var(--border)] bg-[var(--card)]" />
        <div className="h-72 animate-pulse rounded-lg border border-[var(--border)] bg-[var(--card)]" />
      </div>
    </main>
  );
}
