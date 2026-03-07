import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

import { PricingSection } from "@/components/PricingSection";
import { UserSync } from "@/components/UserSync";
import { getProPrices } from "@/lib/stripe";

export default async function HomePage(): Promise<React.JSX.Element> {
  const prices = await getProPrices();

  return (
    <div className="landing min-h-screen">
      <nav className="mx-auto flex w-full max-w-[920px] items-center justify-between px-6 pt-6">
        <Link href="/" className="text-xs uppercase tracking-[0.24em] text-[var(--color-mid)]">
          Landlines
        </Link>
        <div className="flex items-center gap-2">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="landing-btn" type="button">
                Sign in
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </nav>

      <main id="main">
        <Show when="signed-in">
          <UserSync />
        </Show>

        <section className="flex flex-col items-center px-6 pb-16 pt-[clamp(4.5rem,10vh,7.5rem)]">
          <p className="anim-1 mb-8 text-[13px] uppercase tracking-[0.24em] text-[var(--color-mid)]">
            Private by design
          </p>
          <h1 className="anim-2 display-serif max-w-[760px] text-center text-[clamp(3.3rem,8vw,6rem)] font-light leading-[1.06] tracking-[0.02em] text-balance">
            Always-on calling for <span className="text-[var(--color-accent)]">the people who matter.</span>
          </h1>
          <p className="anim-3 mt-6 max-w-[560px] text-center text-[clamp(1.0625rem,1.8vw,1.3125rem)] leading-[1.6] text-[var(--color-mid)]">
            Private, invite-only voice and video for your inner circle.
            Invisible to everyone else.
          </p>
          <p className="anim-4 mt-8 text-center text-sm text-[var(--color-mid)]">
            Trusted by close-knit teams and families who keep communication intentional.
          </p>
        </section>

        <section className="mx-auto w-full max-w-[720px] border-t border-[var(--color-wire)] px-6 py-8 text-center text-sm text-[var(--color-mid)]">
          <span className="block text-center md:inline">
            Always-on presence. No ringing into the void.
          </span>
          <span className="mx-3 hidden text-[var(--color-wire)] md:inline" aria-hidden="true">
            &middot;
          </span>
          <span className="mt-2 block text-center md:mt-0 md:inline">
            Invite-only. Your circle, no one else&apos;s.
          </span>
          <span className="mx-3 hidden text-[var(--color-wire)] md:inline" aria-hidden="true">
            &middot;
          </span>
          <span className="mt-2 block text-center md:mt-0 md:inline">
            Voice and video. Nothing in between.
          </span>
        </section>

        <PricingSection prices={prices} />

        <section className="anim-5 mx-auto mt-16 w-full max-w-[720px] px-6">
          <div className="border border-[var(--color-wire)] p-6 md:p-10">
            <p className="mb-8 max-w-[480px] text-[15px] leading-[1.65] text-[var(--color-mid)]">
              Your account is reachable only by contacts you explicitly accept.
              Everyone else can&apos;t find you here.
            </p>

            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="landing-btn" type="button">
                  Request access
                </button>
              </SignInButton>
            </Show>

            <Show when="signed-in">
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/dashboard" className="landing-btn landing-btn-primary">
                  Open Dashboard
                </Link>
                <Link href="/invites" className="landing-btn landing-btn-ghost">
                  Manage invites
                </Link>
              </div>
            </Show>
          </div>
        </section>
      </main>

      <footer className="mx-auto mt-20 w-full max-w-[720px] px-6 pb-12 text-center">
        <p className="text-sm text-[var(--color-wire)]">Landlines &middot; Private by design</p>
      </footer>
    </div>
  );
}
