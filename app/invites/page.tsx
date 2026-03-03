import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { InvitesPanel } from "@/components/InvitesPanel";
import { PresenceHeartbeat } from "@/components/PresenceHeartbeat";

/**
 * Auth-protected invite management page.
 */
export default async function InvitesPage(): Promise<React.JSX.Element> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  return (
    <AppShell activeSection="invites" maxWidth="max-w-5xl">
      <div className="flex flex-col gap-6">
        <header className="border-b border-[var(--border)] pb-6">
          <p className="label-caps">Access requests</p>
          <h1 className="display-serif mt-2 text-[clamp(2.6rem,5vw,3.4rem)] font-light leading-[1.02] tracking-[0.01em]">
            Invites
          </h1>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Track pending invites, accept trusted contacts, and ignore unwanted requests.
          </p>
        </header>
        <PresenceHeartbeat />
        <InvitesPanel />
      </div>
    </AppShell>
  );
}
