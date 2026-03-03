import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PresenceHeartbeat } from "@/components/PresenceHeartbeat";

/**
 * Auth-protected settings page for profile and subscription controls.
 */
export default async function SettingsPage(): Promise<React.JSX.Element> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  return (
    <main id="main" className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Manage profile, security, and billing.</p>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </header>

      <Card>
        <PresenceHeartbeat />
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Managed by Clerk.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-[var(--muted-foreground)]">Open your Clerk profile to update account details.</p>
          <UserButton />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Landlines Pro</CardTitle>
          <CardDescription>Unlock unlimited contacts and video-first workflows.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="secondary">Current tier: Free</Badge>
          <Button asChild>
            <Link href="https://docs.polar.sh" target="_blank" rel="noreferrer">
              Configure Polar checkout
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
