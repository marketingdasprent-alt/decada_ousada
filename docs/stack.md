# Next.js, TypeScript and Tailwind

Project version of the Blueprint `docs/stack.md`. Why the stack differs
from the Blueprint default: `DECISIONS.md` (first override).

## Stack

Next.js 16 (App Router, Cache Components, Partial Prefetching) + React
19 + TypeScript (strict) + Tailwind CSS v4. `.tsx` for components, `.ts`
for hooks/data/helpers. Do not silence errors with `any`, `@ts-ignore`
or disabled strictness.

- `npm run typecheck`: types only.
- `npm run check`: lint, typecheck and production build.
- `npm run qa`: Blueprint static audit (content, tokens, a11y, SEO).

Next.js 16 changes a lot from older versions (proxy.ts instead of
middleware, Cache Components, async params). Read the guide in
`node_modules/next/dist/docs/` before writing framework code.

## Rendering model

- `cacheComponents: true`. Catalogue reads (`listVehicles`,
  `listLocations`, `listExtras`, `listCoverages`) use `"use cache"` with
  `cacheLife("minutes")`, which matches the 5 minute cache WeGest allows.
- Everything that depends on the request (session, search params,
  availability, quotes, bookings, applications) calls `connection()` in
  the service layer and renders inside `<Suspense>` with a skeleton.
- Pages read `params`/`searchParams` inside a `<Suspense>` child, so the
  static shell is always instant.

## Regions

`src/proxy.ts` rewrites every request to `/{mainland|azores}/...` based
on the host (`acores.*` is Açores). The segment never appears in public
URLs. In development use `acores.localhost:3000` or `?regiao=acores`
(stored in a cookie; `?regiao=continente` to go back). Route Handlers
receive the region in the `x-do-region` header (`regionFromRequest`).

## Styling

Tailwind utilities with the Blueprint aliases from
`src/styles/tailwind.css`. All visual values live in
`src/styles/tokens.css`.

- Colors: `page`, `panel`, `panel-alt`, `panel-sunken`, `panel-dark`,
  `overlay`, `brand`, `brand-hover`, `brand-active`, `brand-surface`,
  `copy`, `copy-secondary`, `copy-muted`, `on-brand`, `on-dark`, `line`,
  `line-strong`, `positive`, `caution`, `negative`, `info` (+ `-surface`).
- Type: `text-display`, `text-h1` to `text-h4`, `text-body-large`,
  `text-body`, `text-body-small`, `text-caption`, `text-label`. Headline
  sizes are fluid, so no responsive pair is needed.
- Radius: `rounded-control`, `-card`, `-panel`, `-feature`, `-pill`.
- Shadows: `shadow-low`, `-raised`, `-floating`, `-overlay`.
- Layout utilities: `grid-main-aside`, `grid-nav-main`,
  `grid-filters-main`, `grid-label-value`, `grid-search`,
  `grid-search-bar`, `grid-date-time`, `aspect-vehicle`, `w-drawer`,
  `z-header`, `z-overlay`, `z-modal`, `z-toast`.
- Spacing and sizing use Tailwind's numeric 4px scale (override recorded
  in `DECISIONS.md`). No `tw:` prefix.
- Component classes in `src/app/globals.css` (`@layer components`):
  `.layout-container`, `.layout-section`, `.display`, `.slant`,
  `.tabular`, `.select-control`, `.skip-link`.

Use static, complete class names; never build them from strings.

## Server boundary

Anything that touches WeGest, payments, sessions or the local store
starts with `import "server-only"`. The browser talks only to
`src/app/api/*` through `apiFetch` (`src/lib/fetcher.ts`), which always
has a timeout.
