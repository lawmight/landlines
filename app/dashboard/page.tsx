import Link from "next/link";
import { Home } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { IncomingCallCard } from "@/components/IncomingCallCard";
import { InnerCircle } from "@/components/InnerCircle";
import { InviteModal } from "@/components/InviteModal";
import { PresenceHeartbeat } from "@/components/PresenceHeartbeat";
import { Button } from "@/components/ui/button";

/**
 * Auth-protected dashboard for inner-circle management and call activity.
 */
export default async function DashboardPage(): Promise<React.JSX.Element> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  return (
    <main id="main" className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Reachable only by people you explicitly accepted.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" aria-hidden />
              Home
            </Link>
          </Button>
          <InviteModal />
          <Button variant="secondary" asChild>
            <Link href="/settings">Settings</Link>
          </Button>
        </div>
      </header>

      <IncomingCallCard />
      <PresenceHeartbeat />
      <InnerCircle />
    </main>
  );
}
