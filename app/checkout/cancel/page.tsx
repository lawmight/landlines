import Link from "next/link";

export const metadata = {
  title: "Checkout canceled",
};

export default function CheckoutCancelPage(): React.JSX.Element {
  return (
    <div className="landing min-h-screen">
      <nav className="mx-auto flex w-full max-w-[920px] items-center justify-between px-6 pt-6">
        <Link href="/" className="text-xs uppercase tracking-[0.24em] text-[var(--color-mid)]">
          Landlines
        </Link>
      </nav>

      <main id="main" className="flex flex-col items-center px-6 pt-[clamp(6rem,14vh,10rem)]">
        <p className="mb-6 text-[13px] uppercase tracking-[0.24em] text-[var(--color-mid)]">
          Checkout canceled
        </p>
        <h1 className="display-serif max-w-[660px] text-center text-[clamp(2.6rem,6vw,4.2rem)] font-light leading-[1.06] tracking-[0.02em]">
          Your line stays exactly as it was.
        </h1>
        <p className="mt-6 max-w-[480px] text-center text-[15px] leading-[1.6] text-[var(--color-mid)]">
          Nothing changed on your subscription. You can head back any time and finish checkout on Stripe&apos;s hosted
          payment page.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="landing-btn landing-btn-primary">
            Back to pricing
          </Link>
          <Link href="/settings" className="landing-btn landing-btn-ghost">
            Open settings
          </Link>
        </div>
      </main>
    </div>
  );
}
