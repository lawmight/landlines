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

All credentials live in `.env.local`. Clerk and Convex keys must be present for the app to render protected pages. Twilio keys are required only for actual voice/video calls. Polar keys are optional (billing/subscriptions).

### Gotchas

- The `convex/_generated/*` files are scaffolding placeholders. Running `npx convex dev` regenerates them with strongly-typed API references. Without this, runtime call/invite/presence features will fail.
- The ESLint config uses flat config format (`eslint.config.mjs`), so the `--ext` flag is needed when running ESLint from the CLI.
- Next.js may warn about `experimental.typedRoutes` being moved to `typedRoutes` — this is cosmetic and does not affect functionality.
- The signaling server exposes a `GET /health` endpoint that returns `{"ok":true}`.
- Clerk signup in Development mode requires email verification (6-digit code). Creating a new test account interactively requires access to the target email inbox.
- Sending invites requires the user's profile to exist in the Convex `users` table. A newly created Clerk account that hasn't been synced to Convex will get `"Inviter must exist before sending invites"`. This sync happens via Convex's auth integration when `npx convex dev` is running.

### Twilio (voice/video)

- **Required in `.env.local`:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_TWIML_APP_SID`, and either `TWILIO_API_KEY_SID` + `TWILIO_API_KEY_SECRET` or `TWILIO_API_KEY` + `TWILIO_API_SECRET`.
- **Optional:** `TWILIO_VIDEO_ROOM_TYPE` — defaults to `group` (Twilio deprecated `group-small` in Oct 2024; the app maps deprecated values to `group`).
- **TwiML App:** In Twilio Console, create a TwiML App and set its **Voice URL** to your app's voice webhook (e.g. `https://your-domain.com/api/voice`) so incoming/outgoing voice calls get the correct conference TwiML.
- **Test:** Run `npm run test:twilio` (loads `.env.local` and checks token creation + video room creation).
