# Landlines

Private, invite-only voice/video calling app. See `README.md` for stack overview and quick-start.

## Cursor Cloud specific instructions

### Services

| Service | Port | Start command |
|---|---|---|
| Next.js frontend | 3000 | `npm run dev` |
| Express signaling server | 4000 | `npm run server:dev` |
| Convex real-time backend | — | `npm run convex:dev` (requires `CONVEX_DEPLOY_KEY`) |

All three can be started together with `npm run dev:all`.

### Lint / Typecheck / Build

- **Lint:** `npx eslint . --ext .ts,.tsx` (ESLint 9 flat config in `eslint.config.mjs`)
- **Typecheck:** `npx tsc --noEmit`
- **Build:** `npm run build` (requires Convex generated files)

### Environment variables

All credentials live in `.env.local`. Clerk and Convex keys must be present for the app to render protected pages. Twilio keys are required only for actual voice/video calls. Stripe keys are optional unless you are testing billing/subscriptions.

### Stripe Managed Payments

- **Required in `.env.local` for checkout:** `STRIPE_SECRET_KEY`, `LANDLINES_MONTHLY_PRICE_ID`, and either `LANDLINES_ANNUALY_PRICE_ID` or `LANDLINES_ANNUAL_PRICE_ID`.
- **Required for webhook sync:** `STRIPE_WEBHOOK_SECRET`.
- The checkout route uses Stripe Hosted Checkout with `managed_payments.enabled = true` and the preview API version `2026-03-04.preview`.
- The webhook endpoint is `POST /api/webhooks/stripe` and updates Convex `users.subscriptionTier` between `free` and `pro`.

### Subscription gating

- Dashboard, Invites, and Call room require an active Pro subscription. Free or unauthenticated users are redirected to `/settings` where they can upgrade via BillingCard.
- `POST /api/twilio/token` returns `403` with `{ error: "Active subscription required for calling." }` when the user is not Pro, so voice/video tokens cannot be obtained without a subscription.
- Enforcement is server-side only via `lib/subscription.ts` (`getSubscriptionTierForRequest`, `requirePro`), using Clerk auth and Convex `api.users.getProfile`. Ensure the Clerk Dashboard has a JWT template named `"convex"` with audience `convex` for Convex auth.

### Gotchas

- The `convex/_generated/*` files are scaffolding placeholders. Running `npx convex dev` regenerates them with strongly-typed API references. Without this, runtime call/invite/presence features will fail.
- The ESLint config uses flat config format (`eslint.config.mjs`), so the `--ext` flag is needed when running ESLint from the CLI.
- Next.js may warn about `experimental.typedRoutes` being moved to `typedRoutes` — this is cosmetic and does not affect functionality.
- The signaling server exposes a `GET /health` endpoint that returns `{"ok":true}`.
- Clerk signup in Development mode requires email verification (6-digit code). Creating a new test account interactively requires access to the target email inbox.
- Sending invites requires the user's profile to exist in the Convex `users` table. The app syncs Clerk → Convex automatically when you load Dashboard, Invites, or Settings (`UserSync` component). If you see "Inviter must exist before sending invites", open one of those pages while signed in so the sync runs. To sync multiple accounts manually: sign in as account A, open Dashboard (or Invites/Settings); sign out, sign in as account B, open Dashboard again. Each account is upserted on first load.

### Twilio (voice/video)

- **Required in `.env.local`:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_TWIML_APP_SID`, and either `TWILIO_API_KEY_SID` + `TWILIO_API_KEY_SECRET` or `TWILIO_API_KEY` + `TWILIO_API_SECRET`.
- **Optional:** `TWILIO_VIDEO_ROOM_TYPE` — defaults to `group` (Twilio deprecated `group-small` in Oct 2024; the app maps deprecated values to `group`).
- **TwiML App:** In Twilio Console, create a TwiML App and set its **Voice URL** to your app's voice webhook (e.g. `https://your-domain.com/api/voice`) so incoming/outgoing voice calls get the correct conference TwiML.
- **Test:** Run `npm run test:twilio` (loads `.env.local` and checks token creation + video room creation).
