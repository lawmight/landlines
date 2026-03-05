import Link from "next/link";
import { ArrowLeft, Phone, Video } from "lucide-react";

interface CallPageShellProps {
  roomId: string;
  mode: "voice" | "video";
  children: React.ReactNode;
}

/**
 * Warm editorial page frame for active call routes.
 */
export function CallPageShell({ roomId, mode, children }: CallPageShellProps): React.JSX.Element {
  const isVideo = mode === "video";

  return (
    <div className="app-shell min-h-screen">
      <nav className="mx-auto flex w-full max-w-[1180px] items-center justify-between border-b border-[var(--border)] px-6 py-6">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          Landlines
        </Link>
        <Link href="/dashboard" className="landing-btn landing-btn-ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Dashboard
        </Link>
      </nav>

      <main id="main" className="mx-auto flex w-full max-w-[1180px] flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-5 border-b border-[var(--border)] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="label-caps">{isVideo ? "Active video line" : "Active voice line"}</p>
            <h1 className="display-serif mt-2 text-[clamp(2.8rem,5vw,4.2rem)] font-light leading-[0.98] tracking-[0.01em]">
              {isVideo ? "Face-to-face, without losing the brand." : "A calmer voice room for every line."}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">
              The call surface now follows the same warm editorial system as the rest of Landlines while keeping the
              Twilio and Convex call lifecycle untouched underneath.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--foreground)]">
              {isVideo ? <Video className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
              {isVideo ? "Video call" : "Voice call"}
            </span>
            <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Room {roomId}
            </span>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
