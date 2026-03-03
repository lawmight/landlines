export default function CallRoomLoading(): React.JSX.Element {
  return (
    <main id="main" className="mx-auto flex min-h-[70vh] w-full max-w-5xl items-center justify-center px-6 py-10">
      <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--muted-foreground)] border-t-transparent" />
        Connecting...
      </div>
    </main>
  );
}
