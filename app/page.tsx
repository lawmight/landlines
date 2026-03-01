import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Public landing page for the invite-only Landlines product.
 */
export default function HomePage(): React.JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 py-16">
      <div className="mb-10 w-full max-w-3xl text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]">Landlines</p>
        <h1 className="mb-4 text-4xl font-semibold md:text-6xl">
          Always-on calling for the people who matter.
        </h1>
        <p className="text-base text-[var(--muted-foreground)] md:text-lg">
          Private, invite-only voice and video for your inner circle. Invisible to everyone else.
        </p>
      </div>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Invite-only access</CardTitle>
          <CardDescription>
            Your account is reachable only by contacts you explicitly accept into your inner circle.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <Button>Sign in to request access</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Button asChild>
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
            <div className="rounded-md border border-[var(--border)] p-2">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          <Button variant="secondary" asChild>
            <Link href="/invites">Manage invites</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
