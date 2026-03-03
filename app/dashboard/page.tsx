import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { IncomingCallCard } from "@/components/IncomingCallCard";
import { InnerCircle } from "@/components/InnerCircle";
import { InviteModal } from "@/components/InviteModal";
import { PresenceHeartbeat } from "@/components/PresenceHeartbeat";

/**
 * Auth-protected dashboard for inner-circle management and call activity.
 */
export default async function DashboardPage(): Promise<React.JSX.Element> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  return (
    <AppShell activeSection="dashboard" maxWidth="max-w-5xl">
      <div className="flex flex-col gap-6">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-6">
          <div>
            <p className="label-caps">Inner circle controls</p>
            <h1 className="display-serif mt-2 text-[clamp(2.6rem,5vw,3.4rem)] font-light leading-[1.02] tracking-[0.01em]">
              Dashboard
            </h1>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              Reachable only by people you explicitly accepted.
            </p>
          </div>
          <InviteModal />
        </header>

        <IncomingCallCard />
        <PresenceHeartbeat />
        <InnerCircle />
      </div>
    </AppShell>
  );
}
