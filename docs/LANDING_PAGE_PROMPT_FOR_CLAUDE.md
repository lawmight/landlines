# Prompt for Claude Code: Generate Landlines Landing Page Design Brief

Use the text below when you send a request to **Claude Code** (e.g. in Cursor or Claude.ai). **Attach your mood board images** in the same message. Claude Code will then produce a **single, full design prompt** that you can copy and use in a follow-up session with the **frontend-design skill** to build the actual landing page.

---

## What to send to Claude Code (copy everything below this line)

---

You are an expert design strategist and prompt architect. I will attach **mood board images** for a product landing page. Your job is to produce **one complete, ready-to-paste design brief** that I will give to another AI (with the frontend-design skill) to implement the landing page in code.

**Product context**

- **Product name:** Landlines  
- **Tagline:** Always-on calling for the people who matter.  
- **One-liner:** Private, invite-only voice and video for your inner circle. Invisible to everyone else.  
- **Core value:** Private, invite-only voice and video calling — only people you explicitly accept can reach you; everyone else doesn't see you as available.  
- **Tech stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn-style components, Clerk auth. The page must fit this stack and remain a single landing page (hero, value prop, CTA, optional short feature list).  
- **Primary CTA:** Sign in / request access (Clerk). Secondary: "Open dashboard" and "Manage invites" for signed-in users.

**What I need from you**

1. **Analyze the attached mood board images.**  
   Extract: overall aesthetic (e.g. minimal, maximalist, retro, editorial, dark/light), color direction, typography feel, layout patterns, motion/atmosphere, and any specific UI patterns (cards, gradients, type hierarchy, spacing).

2. **Write one consolidated design brief** that another AI can use with the "frontend-design" skill to implement the page. The brief must be **self-contained** and include:

   - **Who & what (role and deliverable)**  
     e.g. "You are a senior front-end designer. Produce the Landlines public landing page as a single Next.js page component using Tailwind v4 and shadcn-style primitives."

   - **Product and audience**  
     One short paragraph: what Landlines is, who it's for (people who want private, always-on calling for a small circle), and the key message (privacy, invite-only, "people who matter").

   - **Exact copy to use**  
     - Headline: "Always-on calling for the people who matter."  
     - Subhead: "Private, invite-only voice and video for your inner circle. Invisible to everyone else."  
     - Any short supporting line for the CTA card (e.g. "Your account is reachable only by contacts you explicitly accept.").  
     You may refine wording slightly for flow, but keep the same meaning and tone.

   - **Aesthetic direction (from the mood board)**  
     Describe:  
     - Tone (e.g. calm, premium, editorial, brutalist, soft).  
     - Color palette (dominant + accents; suggest CSS variable names if helpful).  
     - Typography (display vs body; avoid generic choices like Inter, Roboto, Arial).  
     - Layout (e.g. centered hero, asymmetry, grid, density vs whitespace).  
     - Backgrounds and atmosphere (gradients, texture, grain, depth).  
     - Motion (e.g. subtle page-load stagger, hover states, scroll or no).

   - **Frontend-design skill alignment**  
     Explicitly remind the implementing AI to:  
     - Use the frontend-design skill guidelines: distinctive typography, cohesive color system (e.g. CSS variables), intentional motion, non-generic layout.  
     - Avoid generic AI aesthetics: no purple-on-white clichés, no Inter/Roboto/Space Grotesk unless the mood board clearly suggests them.  
     - Match complexity to the chosen aesthetic (restraint for minimal, richer code for maximal).

   - **Sections and structure**  
     List the sections to implement in order, e.g.:  
     1. Hero (logo/wordmark, headline, subhead).  
     2. Optional short value/feature strip (2–3 bullets or one line each).  
     3. CTA card: invite-only explanation + Sign in / Dashboard / Manage invites.  
     4. Optional footer (minimal: e.g. "Landlines" + legal or link if needed).

   - **Technical constraints**  
     - One main landing page component (e.g. `app/page.tsx`).  
     - Use existing UI primitives (Button, Card, etc.) and Clerk components (SignInButton, SignedIn, SignedOut, UserButton).  
     - Responsive, accessible, production-ready markup.

   - **Output format**  
     "Return a single, complete design brief (in clear sections) that I can paste into a new chat with the frontend-design skill to generate the Landlines landing page. No code in this brief — only the brief itself."

3. **Output only the design brief.**  
   Do not add meta-commentary before or after. The entire reply should be the brief that can be copied and pasted into the next AI session with the frontend-design skill.

Use the attached mood board images as the single source of visual direction; the brief should read as if a designer wrote it after looking at those references.

---

## After you get the design brief from Claude Code

1. Copy the full design brief from Claude Code's reply.  
2. Open a new chat (or session) where the **frontend-design skill** is available.  
3. Paste the brief and add one line such as: "Implement this landing page in our Next.js app: replace or update `app/page.tsx` to match this brief. Keep Clerk and existing UI components; use Tailwind v4 and our current stack."  
4. If you have a link to the repo or the current `app/page.tsx`, you can attach it or paste the file so the AI can align with your exact structure and imports.

---

## References used to build this meta-prompt

- **Frontend-design skill:** Distinctive typography, cohesive color (CSS variables), intentional motion, non-generic layout; avoid Inter/Roboto, purple-on-white, and cookie-cutter patterns.  
- **WIRE+FRAME (Smashing Magazine):** Who/What, Input context, Rules, Expected output, Flow, Reference style, Clarification, Memory, Evaluate.  
- **Landing page design brief (Docsbot):** Business overview, services/objectives, design elements, UX, output format.  
- **Product:** README and `app/page.tsx` for Landlines (private invite-only voice/video calling).
