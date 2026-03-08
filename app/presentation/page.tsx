import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";

import styles from "./presentation.module.css";

const innerCircle = [
  { name: "Maya", note: "Founder line", status: "Available now" },
  { name: "Andre", note: "Inner circle", status: "On video" },
  { name: "Leila", note: "Family", status: "Voice only" },
];

const trustPoints = [
  "Invite-only reachability",
  "Presence instead of interruptions",
  "Voice and video for people you trust",
];

function PresenterAvatar(): React.JSX.Element {
  return (
    <svg viewBox="0 0 320 320" aria-hidden="true" className="h-full w-full">
      <defs>
        <linearGradient id="ll-bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#f4e5d8" />
          <stop offset="100%" stopColor="#d7b7a1" />
        </linearGradient>
        <linearGradient id="ll-blazer" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#2f2d38" />
          <stop offset="100%" stopColor="#15141a" />
        </linearGradient>
        <linearGradient id="ll-shirt" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#fffaf5" />
          <stop offset="100%" stopColor="#f2e6dd" />
        </linearGradient>
        <radialGradient id="ll-skin" cx="45%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#f6cfb6" />
          <stop offset="100%" stopColor="#cf9a7b" />
        </radialGradient>
      </defs>

      <rect width="320" height="320" rx="160" fill="url(#ll-bg)" />
      <ellipse cx="160" cy="120" rx="92" ry="104" fill="#2a2024" />
      <path
        d="M95 300c8-53 41-86 65-97 24-11 47-11 71 0 28 13 56 45 63 97H95Z"
        fill="url(#ll-blazer)"
      />
      <path
        d="M143 208h34c8 0 15 7 15 15v39h-64v-39c0-8 7-15 15-15Z"
        fill="url(#ll-skin)"
      />
      <path
        d="M121 301c12-42 37-69 71-69s58 27 70 69H121Z"
        fill="url(#ll-shirt)"
      />
      <ellipse cx="160" cy="135" rx="68" ry="84" fill="url(#ll-skin)" />
      <path
        d="M229 136c0-66-27-95-69-95-47 0-74 40-74 98 0 17 3 31 8 44-17-17-27-42-27-70 0-62 41-111 95-111 57 0 96 44 96 113 0 29-9 54-29 73 0 0 0-22 0-52Z"
        fill="#2a2024"
      />
      <path d="M111 132c8-10 21-17 37-18" fill="none" stroke="#3c2e34" strokeWidth="6" strokeLinecap="round" />
      <path d="M171 114c15 1 27 7 36 18" fill="none" stroke="#3c2e34" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="137" cy="149" rx="7" ry="8" fill="#20181b" />
      <ellipse cx="185" cy="149" rx="7" ry="8" fill="#20181b" />
      <path
        d="M159 151c-5 8-9 18-9 26 0 5 3 8 9 8"
        fill="none"
        stroke="#ad765b"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M140 188c12 10 31 10 42 0"
        fill="none"
        stroke="#a65055"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M160 96c35 1 57 16 68 44" fill="none" stroke="#47353c" strokeWidth="10" strokeLinecap="round" />
      <circle cx="123" cy="175" r="9" fill="#e1aa8f" opacity="0.55" />
      <circle cx="197" cy="175" r="9" fill="#e1aa8f" opacity="0.55" />
    </svg>
  );
}

export default function PresentationPage(): React.JSX.Element {
  return (
    <main className="landing min-h-screen px-4 py-6 md:px-8 md:py-10">
      <section className={styles.canvas}>
        <div className={styles.glow} aria-hidden="true" />

        <header className="relative z-[1] flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-wire)]/70 pb-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-mid)]">Landlines</p>
            <h1 className="display-serif mt-2 text-2xl font-light tracking-[0.02em] md:text-3xl">
              Private line presentation
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--color-mid)]">
            <span className={styles.pill}>Invite-only</span>
            <span className={styles.pill}>Always-on presence</span>
            <span className={styles.pill}>Voice + video</span>
          </div>
        </header>

        <div className="relative z-[1] mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.06fr)_minmax(430px,0.94fr)] lg:items-center">
          <div className={styles.copyColumn}>
            <div className={styles.eyebrow}>
              <Sparkles className="h-4 w-4" />
              Private by design
            </div>

            <h2 className="display-serif mt-6 max-w-[12ch] text-[clamp(3rem,6vw,5.6rem)] font-light leading-[0.97] tracking-[0.02em]">
              The private line for your inner circle.
            </h2>

            <p className="mt-6 max-w-[58ch] text-[1.05rem] leading-[1.75] text-[var(--color-mid)] md:text-[1.15rem]">
              Landlines keeps voice and video open for the people you intentionally accept.
              No directory. No random reachability. Just a calm, always-on line for the handful
              of people who matter.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <article className={styles.metricCard}>
                <LockKeyhole className="h-5 w-5 text-[var(--color-accent)]" />
                <p className={styles.metricValue}>Invite-only</p>
                <p className={styles.metricLabel}>Reachable only by approved contacts.</p>
              </article>

              <article className={styles.metricCard}>
                <PhoneCall className="h-5 w-5 text-[var(--color-accent)]" />
                <p className={styles.metricValue}>Always-on</p>
                <p className={styles.metricLabel}>Presence instead of missed calls.</p>
              </article>

              <article className={styles.metricCard}>
                <Video className="h-5 w-5 text-[var(--color-accent)]" />
                <p className={styles.metricValue}>Voice + video</p>
                <p className={styles.metricLabel}>Two modes, one trusted circle.</p>
              </article>
            </div>

            <div className={styles.quoteCard}>
              <div className={styles.quoteAccent} aria-hidden="true" />
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-mid)]">
                Presenter line
              </p>
              <p className="mt-3 text-lg leading-[1.6] text-[var(--color-ink)] md:text-[1.35rem]">
                “You don&apos;t post your availability to the whole internet. Landlines gives your
                closest people a direct line that still feels intentional.”
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/" className="landing-btn landing-btn-primary">
                Open product site
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <span className="text-sm text-[var(--color-mid)]">Built for families, founders, and tight-knit teams.</span>
            </div>
          </div>

          <div className={styles.stage}>
            <div className={styles.presenterBubble}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-mid)]">
                    Maya presents
                  </p>
                  <p className="mt-2 text-xl leading-tight text-[var(--color-ink)]">
                    “Private calling should feel warm, not public.”
                  </p>
                </div>
                <div className={styles.voiceBars} aria-hidden="true">
                  <span className={styles.bar} />
                  <span className={styles.bar} />
                  <span className={styles.bar} />
                  <span className={styles.bar} />
                </div>
              </div>
            </div>

            <div className={styles.avatarOrb}>
              <PresenterAvatar />
            </div>

            <article className={`${styles.mockCard} ${styles.circleCard}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-mid)]">
                    Inner circle
                  </p>
                  <p className="mt-2 text-xl text-[var(--color-ink)]">Available now</p>
                </div>
                <div className={styles.greenDot} aria-hidden="true" />
              </div>

              <div className="mt-5 space-y-3">
                {innerCircle.map((person) => (
                  <div key={person.name} className={styles.listRow}>
                    <div className={styles.listAvatar}>{person.name.charAt(0)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--color-ink)]">{person.name}</p>
                      <p className="truncate text-sm text-[var(--color-mid)]">{person.note}</p>
                    </div>
                    <span className={styles.statusPill}>{person.status}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className={`${styles.mockCard} ${styles.callCard}`}>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-mid)]">
                Incoming video request
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className={styles.ringAvatar}>M</div>
                <div>
                  <p className="text-lg text-[var(--color-ink)]">Maya is calling</p>
                  <p className="mt-1 text-sm text-[var(--color-mid)]">Private room ready • camera + mic</p>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <div className={`${styles.actionPill} ${styles.acceptPill}`}>Accept</div>
                <div className={styles.actionPill}>Hold</div>
              </div>
            </article>

            <article className={`${styles.mockCard} ${styles.signalCard}`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-mid)]">
                    Live room
                  </p>
                  <p className="mt-2 text-xl text-[var(--color-ink)]">Voice and video, no lobby.</p>
                </div>
                <ShieldCheck className="h-6 w-6 text-[var(--color-accent)]" />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {trustPoints.map((point) => (
                  <div key={point} className={styles.trustTile}>
                    <CheckCircle2 className="h-4 w-4 text-[var(--color-accent)]" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>

        <footer className="relative z-[1] mt-8 border-t border-[var(--color-wire)]/70 pt-5">
          <div className={styles.ticker} aria-hidden="true">
            <div className={styles.tickerTrack}>
              <span>Private by design</span>
              <span>Invite-only presence</span>
              <span>Landlines for your inner circle</span>
              <span>Voice and video without the noise</span>
              <span>Private by design</span>
              <span>Invite-only presence</span>
              <span>Landlines for your inner circle</span>
              <span>Voice and video without the noise</span>
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}
