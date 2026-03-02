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
