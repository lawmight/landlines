import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { InvitesPanel } from "@/components/InvitesPanel";
import { PresenceHeartbeat } from "@/components/PresenceHeartbeat";
import { Button } from "@/components/ui/button";

/**
 * Auth-protected invite management page.
 */
export default async function InvitesPage(): Promise<React.JSX.Element> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  return (
    <main id="main" className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Invites</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Track pending invites, accept trusted contacts, and ignore unwanted requests.
          </p>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </header>
      <PresenceHeartbeat />
      <InvitesPanel />
    </main>
  );
}
