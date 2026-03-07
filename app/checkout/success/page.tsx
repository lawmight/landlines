import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

import { UserSync } from "@/components/UserSync";

export const metadata = {
  title: "Payment Confirmed",
};

export default function CheckoutSuccessPage(): React.JSX.Element {
  return (
    <div className="landing min-h-screen">
      <nav className="mx-auto flex w-full max-w-[920px] items-center justify-between px-6 pt-6">
        <Link href="/" className="text-xs uppercase tracking-[0.24em] text-[var(--color-mid)]">
          Landlines
        </Link>
      </nav>

      <main id="main" className="flex flex-col items-center px-6 pt-[clamp(6rem,14vh,10rem)]">
        <p className="mb-6 text-[13px] uppercase tracking-[0.24em] text-[var(--color-accent)]">
          Payment confirmed
        </p>
        <h1 className="display-serif max-w-[660px] text-center text-[clamp(2.6rem,6vw,4.2rem)] font-light leading-[1.06] tracking-[0.02em]">
          Welcome to Landlines&nbsp;Pro.
        </h1>
        <p className="mt-6 max-w-[480px] text-center text-[15px] leading-[1.6] text-[var(--color-mid)]">
          Unlimited contacts, video calling, and priority support are now active on your account.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <SignedIn>
            <UserSync />
            <Link href="/dashboard" className="landing-btn landing-btn-primary">
              Open Dashboard
            </Link>
            <Link href="/settings" className="landing-btn landing-btn-ghost">
              View settings
            </Link>
          </SignedIn>
          <SignedOut>
            <Link href="/" className="landing-btn landing-btn-primary">
              Go home
            </Link>
          </SignedOut>
        </div>
      </main>
    </div>
  );
}
