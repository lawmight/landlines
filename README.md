# Landlines

Private, invite-only voice and video calling built with Next.js App Router, Clerk, Convex, Twilio, and Polar.

## Stack

- Next.js 16 + TypeScript (strict)
- Tailwind CSS v4 + shadcn/ui-style components
- Clerk v6 auth
- Convex for realtime data, call state, invites, and presence
- Twilio Voice SDK 2.x + Twilio Video SDK
- Express signaling server (`/server`)
- Polar subscription scaffolding

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Fill `.env.local` and provide Twilio/Clerk/Convex/Polar credentials.

3. Start app + signaling + Convex:

   ```bash
   npm run dev:all
   ```

## Important Notes

- Run `npx convex dev` once to regenerate `convex/_generated/*` with strongly typed API references.
- Presence heartbeat runs every 30 seconds through `usePresence`.
- Invite acceptance enforces the free-tier max of 20 contacts at mutation level.
