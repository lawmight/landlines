import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
  display: "swap",
});

export default function HomePage(): React.JSX.Element {
  return (
    <main
      className={`${displayFont.variable} ${bodyFont.variable} landing min-h-screen`}
    >
      {/* Hero */}
      <section className="flex flex-col items-center px-6 pb-16 pt-[clamp(5rem,12vh,8.75rem)]">
        <p className="anim-1 mb-8 text-[13px] uppercase tracking-[0.24em] text-[var(--color-mid)]">
          Landlines
        </p>
        <h1 className="anim-2 display-serif max-w-[720px] text-center text-[clamp(3.5rem,8vw,6rem)] font-light leading-[1.06] tracking-[0.02em] text-balance">
          Always-on calling for the people who matter.
        </h1>
        <p className="anim-3 mt-6 max-w-[520px] text-center text-[clamp(1.0625rem,1.8vw,1.3125rem)] leading-[1.6] text-[var(--color-mid)]">
          Private, invite-only voice and video for your inner circle.
          Invisible to everyone else.
        </p>
      </section>

      {/* Feature strip */}
      <div className="anim-4 mx-auto w-full max-w-[720px] border-t border-[var(--color-wire)] px-6 py-8 text-center text-sm text-[var(--color-mid)]">
        <span className="block text-center md:inline">
          Always-on presence. No ringing into the void.
        </span>
        <span
          className="mx-3 hidden text-[var(--color-wire)] md:inline"
          aria-hidden="true"
        >
          &middot;
        </span>
        <span className="mt-2 block text-center md:mt-0 md:inline">
          Invite-only. Your circle, no one else&apos;s.
        </span>
        <span
          className="mx-3 hidden text-[var(--color-wire)] md:inline"
          aria-hidden="true"
        >
          &middot;
        </span>
        <span className="mt-2 block text-center md:mt-0 md:inline">
          Voice and video. Nothing in between.
        </span>
      </div>

      {/* CTA Card */}
      <section className="anim-5 mx-auto mt-12 w-full max-w-[720px] px-6">
        <div className="border border-[var(--color-wire)] p-6 md:p-10">
          <p className="mb-8 max-w-[480px] text-[15px] leading-[1.65] text-[var(--color-mid)]">
            Your account is reachable only by contacts you explicitly accept.
            Everyone else can&apos;t find you here.
          </p>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="landing-btn" type="button">
                Request access
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="mb-5 flex items-center gap-3">
              <UserButton afterSignOutUrl="/" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/dashboard" className="landing-btn">
                Open dashboard
              </Link>
              <Link href="/invites" className="landing-btn landing-btn-ghost">
                Manage invites
              </Link>
            </div>
          </SignedIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto mt-20 w-full max-w-[720px] px-6 pb-12 text-center">
        <p className="text-sm text-[var(--color-wire)]">
          Landlines &middot; Private by design
        </p>
      </footer>
    </main>
  );
}
