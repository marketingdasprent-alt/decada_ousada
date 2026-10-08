# AGENTS.md: DÉCADA OUSADA (Web Blueprint project)

Source of truth for developers and AI agents (Claude, Codex, Cursor,
etc.) working in this repository. This file is the fast-scan entry
point; `BLUEPRINT.md` is the full structural contract and always wins
if the two ever disagree. Project-specific overrides of the Blueprint
live in `DECISIONS.md`.

This is a project built on Web Blueprint, not the foundation itself.
The main structural difference (Next.js instead of Vite) is recorded as
an override in `DECISIONS.md`.

## Stack (current)

Next.js 16 (App Router, Cache Components, `proxy.ts`) + React 19 +
TypeScript (strict) + Tailwind CSS v4 with the Blueprint token aliases.
`.tsx` for components, `.ts` for hooks/data/helpers. Full detail:
`docs/stack.md`. Do not silence a type error with `any`/`@ts-ignore`;
fix the actual contract.

Next.js 16 has breaking changes from older versions: read the relevant
guide in `node_modules/next/dist/docs/` before writing framework code.

## Non-negotiable rules

1. **Reuse before create.** Check `src/components/`,
   `src/styles/tokens.css`, and `docs/design-system.md` for an existing
   component/token/utility before adding a new one.
2. **Rule of Permanence.** A change scoped to one component or doc
   must not touch unrelated components, tokens, or docs. See
   `docs/agent-protocol.md`.
3. **No arbitrary values.** Colors, type sizes, radius, shadows and
   z-index come from tokens through the aliases in
   `src/styles/tailwind.css`. No `#hex`, `text-[15px]` or
   `shadow-[...]` in components. Add to the scale, with a
   `DECISIONS.md` entry, if it's genuinely missing.
4. **No fabricated content.** Never invent contacts, prices, policies,
   deadlines or company facts. Missing client content is shown with
   `<Pending>` / `<ContactValue>` (`src/components/shared/pending.tsx`).
   Demo data is only acceptable behind the demo banner
   (`WEGEST_MODE=mock`).
5. **No AI-tell writing.** No em-dash used as a clause separator, no
   "not X, it's Y" construction, no filler triplets. Full list:
   `docs/content-style.md`. `npm run qa` catches most of this.
6. **No dependency without a stated reason** in `DECISIONS.md`.
7. **Don't default into a visual pattern.** Run new visual decisions
   through the test in `docs/anti-ai.md`.
8. **Document exceptions, don't silently break a rule.** Use the
   Override System in `DECISIONS.md`.
9. **No commit, push, or publish without explicit authorization.**

## Project rules (from the client brief)

- WeGest is the source of truth. Pages only read the internal model in
  `src/domain`; all operational data goes through `src/services/wegest`.
- Prices, totals, deposits and availability come from the API and are
  never recalculated in the browser.
- Availability is re-checked at checkout and when creating a booking.
- Payment success never means TVDE application approval.
- Secrets stay on the server (`import "server-only"`); never use a
  `NEXT_PUBLIC_` prefix for WeGest or payment keys.
- Language: `pt-PT` for all site copy.

## Before declaring a task done

1. `npm run check` (lint + typecheck + production build) passes clean.
2. `npm run qa` reports no failures.
3. Anything visual or interactive was exercised in the browser at a
   mobile and a desktop width (`docs/responsive.md`), in both regions
   (`?regiao=acores` in development).
4. Anything interactive is keyboard-reachable with a visible focus
   state (`docs/accessibility.md`).
5. State exactly what changed, in the scope terms of the request.

## Where to look next

| Question | Doc |
| --- | --- |
| What token/component exists and what's its contract? | `docs/design-system.md` |
| How do Next.js, TypeScript and Tailwind fit together here? | `docs/stack.md` |
| How do I connect the real WeGest API? | `docs/wegest/integracao.md` |
| What does the WeGest API not cover? | `docs/wegest/analise-gaps.md` |
| What breakpoints, and when does a media query earn its place? | `docs/responsive.md` |
| What's the accessibility baseline? | `docs/accessibility.md` |
| What visual pattern should I avoid defaulting into? | `docs/anti-ai.md` |
| How do I write copy/docs without AI writing tells? | `docs/content-style.md` |
| What structural decisions were already made, and why? | `DECISIONS.md` |
