import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { BillingCard } from "@/components/BillingCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PresenceHeartbeat } from "@/components/PresenceHeartbeat";
import { getProPrices } from "@/lib/polar";

export default async function SettingsPage(): Promise<React.JSX.Element> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const prices = await getProPrices();

  return (
    <AppShell activeSection="settings" maxWidth="max-w-4xl">
      <div className="flex flex-col gap-6">
        <header className="border-b border-[var(--border)] pb-6">
          <p className="label-caps">Account controls</p>
          <h1 className="display-serif mt-2 text-[clamp(2.6rem,5vw,3.4rem)] font-light leading-[1.02] tracking-[0.01em]">
            Settings
          </h1>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">Manage profile, security, and billing.</p>
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

        <BillingCard prices={prices} />
      </div>
    </AppShell>
  );
}
