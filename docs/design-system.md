# Design System Reference

Token and component contract for the DÉCADA OUSADA platform, and the
handoff specification (values, states, breakpoints, motion) for anyone
continuing the work. Token names follow the Web Blueprint; values are the
DÉCADA OUSADA identity. Additions to the Blueprint set: `DECISIONS.md`.

Rule for every section below: components use the **semantic tokens** (or
their Tailwind aliases from `src/styles/tailwind.css`, listed in
`docs/stack.md`), never the raw ramp or a hex value.

## Tokens (`src/styles/tokens.css`)

### Color

| Token (Tailwind alias) | Value | Role |
|---|---|---|
| `--color-background` (`page`) | `#f6f6f3` | Page background (light warm grey) |
| `--color-surface` (`panel`) / `--color-surface-alt` (`panel-alt`) | `#ffffff` / `#f6f6f3` | Cards, inputs / subtle boxes inside cards |
| `--color-surface-sunken` (`panel-sunken`) | `#ededea` | Skeletons, segmented controls, neutral chips, disabled buttons |
| `--color-surface-dark` (`panel-dark`) | `#121315` | Header, footer, TVDE bands, dark buttons, TVDE card |
| `--color-scrim` (`overlay`) | `rgb(11 12 13 / 0.45)` | Drawer backdrop |
| `--color-border` (`line`) / `--color-border-strong` (`line-strong`) | `#e4e4e0` / `#c9c9c4` | Hairlines and card edges (decorative, not control boundaries) |
| `--color-border-control` (`line-control`) | `#8a8a84` | Input, select and textarea outline (3.47:1 on white, WCAG 1.4.11) |
| `--color-text-primary` / `-secondary` / `-muted` (`copy`, `copy-secondary`, `copy-muted`) | `#121315` / `#3b3e44` / `#6b7079` | Text hierarchy |
| `--color-text-on-primary` / `-on-dark` (`on-brand`, `on-dark`) | `#ffffff` | Text on brand / dark surfaces |
| `--color-primary` / `-hover` / `-active` / `-surface` (`brand*`) | Continente `#b00000` / `#8c0000` / `#730000` / `#fbeaea`. Açores `#0b7a00` / `#086100` / `#064c00` / `#e8f6e5` | **Action** only (primary button, links) and identity |
| `--color-selection` / `-surface` (`selected*`) | `#121315` / `#f6f6f3` | Selected options (asphalt border + check mark); never the brand colour |
| `--color-focus-ring` (`focus`) | `#121315` | Focus outline, so focus never reads as error or brand |
| `--color-success` / `-warning` / `-error` / `-information` (`positive`, `caution`, `negative`, `info`) + `-surface` | `#157a3c` / `#9a6200` / `#9f1239` / `#1d4f91` | Feedback. Error is kept far from the brand red (ΔE 34.6) |
| `--color-illustration-*`, `--color-paint-*` | see file | Vehicle illustration while WeGest has no photo |

Region: `[data-region="azores"]` on `<html>` swaps only `--color-primary*`.

**Measured contrast (WCAG 2.1):**

| Pair | Ratio | Use allowed |
|---|---|---|
| White on Continente red / on Açores green | 7.38 / 5.53 | Primary buttons, `SlantTag` |
| Continente red / Açores green as text on white | 7.38 / 5.53 | Links |
| Continente red / Açores green as text on page background | 6.81 / 5.11 | Links |
| Brand hover on brand surface (`Badge tone="brand"`) | 8.54 / 6.89 | Badge |
| Text muted on page background / on white | 4.60 / 4.98 | Secondary copy, captions |
| Feedback colours on their surfaces | 4.62 (warning) to 7.03 | `Notice`, `Badge` |
| Control outline on white / page background | 3.47 / 3.21 | Input boundaries |
| Continente red / Açores green **on the dark surface** | 2.52 / 3.36 | **Decorative only** (confirmation icon, footer line, logo lines). Never text or a control on dark |

### Typography

| Token (Tailwind) | Size | Family / weight | Line height | Use |
|---|---|---|---|---|
| `--font-size-display` (`text-display`) | 48 to 72 px (fluid) | Anton, `.display` (uppercase, +0.01em) | 0.95 | Homepage title |
| `--font-size-h1` (`text-h1`) | 36 to 56 px (fluid) | Anton `.display`, or Archivo bold | 0.95 / 1.2 | Page and confirmation titles |
| `--font-size-h2` (`text-h2`) | 28 to 40 px (fluid) | Anton `.display` or Archivo bold | 1.2 | Section titles, prices on cards |
| `--font-size-h3` / `-h4` (`text-h3`, `text-h4`) | 24 / 20 px | Archivo bold | 1.2 | Step titles, totals |
| `--font-size-body-large` (`text-body-large`) | 18 px | Archivo | 1.6 | Intros, card names |
| `--font-size-body` (`text-body`) | 15 px | Archivo regular / medium | 1.6 | Default text, inputs |
| `--font-size-body-small` (`text-body-small`) | 14 px | Archivo | 1.6 | Labels, meta, buttons `sm` |
| `--font-size-caption` (`text-caption`) | 12 px | Archivo | 1.6 | Notes under prices, badges |

Fonts are self-hosted with `next/font` (`font-display: swap`). Prices and
references use `.tabular` (tabular figures). No uppercase eyebrows above
headings; uppercase is only `.display` and the footer column titles.

### Space, radius, shadow, z-index, layout

| Scale | Values |
|---|---|
| `--space-*` | `3xs` 4; `2xs` 8; `xs` 12; `sm` 16; `md` 24; `lg` 32 px; `xl` 32 to 48, `2xl` 44 to 72, `3xl` 56 to 96 px (fluid). Tailwind numeric spacing is kept (override in `DECISIONS.md`) |
| Radius (`rounded-*`) | Per region (same family, different shape). Continente, angular: `control` 3; `card` 4; `panel` 6; `feature` 8 px; `button` 2 px. Açores, rounded: `control` 12; `card` 16; `panel` 22; `feature` 28 px; `button` pill. `pill` is always round |
| Shadow (`shadow-*`) | `low` (sm); `raised` (md); `floating` (lg, search card); `overlay` (xl, drawer, mobile bar) |
| z-index (`z-*`) | `sticky` 200 (mobile action bar); `header` 300; `overlay` 400; `modal` 500 (drawer); `toast` 600 (skip link) |
| Containers | `narrow` 736; `standard` 1280; `wide` 1472 px + gutter 16 to 32 px |
| Section padding | `compact` 24 to 44; `normal` 36 to 68; `spacious` 56 to 100 px |

Layout utilities (`src/styles/tailwind.css`):

| Utility | Token | Use |
|---|---|---|
| `h-header` | `--layout-header` 64, `-sm` 72, `-lg` 80 px | Site header height; the same tokens set `scroll-padding-top` on `html` |
| `sticky-panel` | `--layout-header-lg` | Side panel stuck under the header, never taller than the screen (own scroll). Every sticky aside uses it |
| `tap-target` | `--layout-tap` (44 px) | Minimum touch target without changing type size; `max-md:tap-target` on text links |
| `max-w-field-short` | `--layout-field-short` (160 px) | CVV, card expiry, postal code |
| `data-action-bar` (attribute) | `--layout-action-bar` (144 px) | A fixed bottom bar reserves room at the end of the page, after the footer |
| `grid-main-aside`, `grid-nav-main`, `grid-filters-main`, `grid-label-value`, `grid-search`, `grid-search-bar` | `--layout-aside` 384, `-nav` 220, `-filters` 260, `-label` 168 px | Page grids (always paired with `grid-cols-1` below their breakpoint) |

### Breakpoints

| Name | Min width | What changes |
|---|---|---|
| (base) | 0 | One column, mobile checkout bar, drawers, `tap-target` on text links, inactive step names `sr-only` |
| `sm` | 640 px | Two-column form grids, header 72 px, step names visible |
| `md` | 768 px | Touch-target padding off, search card in two columns, homepage search after the service cards |
| `lg` | 1024 px | Desktop nav, side panels (`grid-main-aside`, filters), sticky panels, checkout bar hidden, results search in one row, header 80 px |
| `xl` / `2xl` | 1280 / 1536 px | Results grid goes to three columns at `xl` (the homepage grids already at `lg`); content stays inside `Container` |

Checked by `npm run qa:layout` at 375, 560, 768, 880, 1024, 1200, 1280,
1440 and 1920 px in both regions. Rules: `docs/responsive.md`.

### Motion

| Token | Value | Applies to |
|---|---|---|
| `--duration-fast` | 120 ms | Default for every Tailwind `transition-*` (theme `--default-transition-duration`), skip link |
| `--duration-normal` / `--duration-slow` | 220 / 400 ms | Reserved; no component uses them yet |
| `--easing-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default Tailwind transition easing |
| `--easing-emphasized` | `cubic-bezier(0.2, 0, 0, 1)` | Reserved |

| Element | Trigger | Animation |
|---|---|---|
| Buttons, links, inputs, Rent a Car card border | hover, focus | `transition-colors` (fast, standard) |
| TVDE card ring, homepage TVDE card | hover | `transition-shadow` |
| Disclosure chevrons (mobile summary, TVDE summary line) | open / close | `rotate-180`, `transition-transform` |
| Skip links | focus | slide in from top (`top`, fast) |
| `Spinner` (buttons with `loading`, uploads) | while busy | `animate-spin` |
| `Skeleton` | while loading | `animate-pulse` |
| Checkout step change | step button | scroll to the step top, smooth; instant with reduced motion |

`prefers-reduced-motion: reduce` cuts every CSS animation and transition to
0.01 ms (`globals.css`); JavaScript scrolling checks the same media query.

## Components (`src/components`)

### Layout (`shared/ui.tsx`)

- `Container` (`variant`: `standard` | `narrow` | `wide`): the only place
  page width is decided.
- `Section` (`variant`: `normal` | `compact` | `spacious`, `surface`):
  the only place vertical rhythm between page blocks is decided.
- `PageHeader` (`shared/page-header.tsx`): `tone="light"` (default: Rent a
  Car, institutional) or `tone="dark"` (TVDE only); `lines` shows the logo
  lines crisp and complete (TVDE landing only). `PageSkeleton tone`.
- `SiteHeader`, `SiteFooter`, `MobileMenu` (`layout/`). `RegionSwitch`
  (`layout/region-switch.tsx`): segmented "Continente / Açores", current region
  marked, the other a link, each with its region colour dot (`bg-region-mainland`,
  `bg-region-azores`); hrefs come from the server.
- `Hero` (`shared/hero.tsx`): BV pattern. `region`, `images` (from
  `REGION_IMAGERY[region]`; more than one cross-fade every 6 s with dots, pause
  and the photo's place as caption, still for reduced motion), `title`,
  `description`, `crumbs`, `above`, `side` (search card on the right from `lg`,
  `grid-hero`), children under the copy; `size` `large` or `medium`. Veil
  `hero-veil` keeps white text AA on any photo. `RegionLines` decorates it:
  diagonal lines (Continente) or wavy lines (Açores), in the brand colour.
- `HeroSearch` (`shared/hero-search.tsx`): search card. Without `only`: big ARIA
  tabs Rent a Car (brand colour, ao dia) and TVDE (asphalt, à semana), each with
  who it is for and how it works; arrows, Home and End move between tabs. With
  `only="rentacar" | "tvde"`: that service only, header in its colour. CTAs name
  the destination ("Ver viaturas Rent a Car", "Ver viaturas TVDE"). Both panels
  share one grid cell and the inactive one is `invisible` and `inert`, so the
  card keeps the height of the taller panel and never jumps when switching.
  Inside `ServiceSelectionProvider` (`shared/service-selection.tsx`, homepage)
  the chosen tab is shared, and `ForService` shows the matching section under
  the hero: Rent a Car categories or the TVDE band. The TVDE panel is shorter than
  the Rent a Car one; its extra height goes to a "Como funciona" box (`flex-1`,
  the three steps and the note that the deposit is not an approval), so the card
  never shows an empty area.
- `CategoryGrid` (`rentacar/category-grid.tsx`) with `rentACarCategories()`:
  category cards (cover photo, name, model count, "desde" per day from the API),
  the whole card links to `/rent-a-car/viaturas?categoria=`. `dense` = four per
  row (homepage); default three (Rent a Car page, grouped by family). No row is
  left with empty space: `fillSpans()` (`lib/grid.ts`) makes the first cards span
  two columns (or one card the whole row) and those cards turn horizontal, photo
  whole (never cropped) and sized to the row height, text stacked on the right.
- Gap-free grids (rule): a grid of cards never ends a row with empty space.
  Fixed lists (categories, pickup points) use `fillSpans()` / `fillSpanClasses()`;
  vehicle lists end with `GridFiller` (`shared/grid-filler.tsx`), a dashed card
  that takes exactly the columns left at each width (hidden when the row is full
  and on mobile) and must carry something useful (see all, help, FAQ). An odd
  last extra in the booking wizard spans the row. `npm run qa:layout` check 4
  fails any box row that does not reach the grid's full width.
- Intentional overlaps (documented in `DECISIONS.md`): the search form rises
  24 px over the Rent a Car page header; the account navigation bleeds to the
  screen edge with its own horizontal scroll on mobile.

### Primitives (`shared/`)

- `Button` / `ButtonLink` / `buttonClass` (`variant`: `primary` | `dark` |
  `outline` | `ghost` | `light`; `size`: `sm` | `md` | `lg`; `loading`).
  Disabled is neutral (`panel-sunken`); while `loading` (aria-busy) the
  colour stays. `disabledButtonClass(size)` for a link-styled action that is
  not available yet.
- `Badge` (`tone`), `SlantTag` (logo banner shape, used for the category
  label on cards), `Card`, `SectionHeading` (title and description, no
  uppercase eyebrow), `Skeleton`, `Spinner`, `Stepper`.
- Options in a card (coverage, payment method, pickup location, dynamic
  form radios): `border-selected bg-selected-surface` plus a check icon when
  chosen, and a visible focus outline through `has-[:focus-visible]`.
- Forms (`form.tsx`): `Field` (label, help, error wired with
  `aria-describedby`; the error is not a live region), `Input`, `Select`,
  `Textarea`, `Checkbox`, `Label`, `ErrorSummary` (one announced message
  per submit, "Há N campos por corrigir."). Empty field copy: "Indique ...".
- Overlays (drawer, mobile menu): `useFocusTrap` (`lib/use-focus-trap.ts`).
- `TrackEvent` (`track-event.tsx`) and `track()` (`lib/analytics.ts`):
  funnel events with the brief §106 names; no sending yet.
- States (`states.tsx`): `EmptyState`, `ErrorState` (timeout variant,
  retry and contact actions), `Notice` (`info` | `warn` | `ok` | `danger`).
- `Pending` / `ContactValue` (`pending.tsx`): visible placeholder for
  client content not yet provided. Never replace it with invented text.
- `PriceDisplay`: shows API values only, never recalculates.

### States

| Component | State | Specification |
|---|---|---|
| `Button` | sizes | `sm` 36 px high, 14 px text (desktop only or with `h-11` on mobile); `md` 44 px; `lg` 52 px; radius `control`; weight semibold |
| | `primary` | `brand` background, white text; hover `brand-hover`; one primary action per step or panel |
| | `outline` / `ghost` / `dark` / `light` | outline: `copy/15` border on `panel`, hover `copy/40`; ghost: no border, hover `panel-sunken`; dark: `panel-dark`; light: `panel` on dark bands |
| | focus | global `:focus-visible`: 2 px `focus` outline, 2 px offset |
| | disabled | `panel-sunken` background, `copy-muted` text, no shadow, `cursor-not-allowed`; never brand colour at reduced opacity |
| | loading | `aria-busy`, spinner before the label, colour kept, not clickable; label says what is happening ("A processar…") |
| `Input`, `Select`, `Textarea` | default | 44 px high (textarea min 96 px), `line-control` outline, `panel` fill, 15 px text, placeholder `copy-muted/70`; `Select` keeps 36 px right padding for the arrow |
| | focus | `focus` border plus 2 px `focus/20` ring |
| | invalid | `aria-invalid="true"`: `negative` border and ring; message under the field in `negative`, linked by `aria-describedby` |
| | disabled | `panel-alt` fill |
| Option card (radio card) | default / hover / selected / focus | `line` border, hover `copy/20`; selected: 2 px `selected` border, `selected-surface`, check icon; focus: outline on the card through `has-[:focus-visible]` |
| `Checkbox` | default / mobile | 18 px native box, `accent-selected`; the whole label is the target, at least 44 px high below `md` |
| `VehicleCard` Rent a Car | hover / focus | border to `copy`; whole card is the link; focus is a double ring (asphalt + white) on the card |
| `VehicleCard` TVDE | hover / focus | ring `on-dark/10` to `on-dark/40`; same double focus ring |
| `Badge` | tones | `neutral`, `brand`, `ok`, `warn`, `danger`, `info`, `dark`; 12 px semibold on the matching surface |
| `Notice` | tones | `info`, `warn`, `ok` (`role="status"`), `danger` (`role="alert"`); title optional |
| `Stepper` | done / current / next | done: `panel-dark` circle with check; current: `brand` circle, label visible, `aria-current="step"`; next: `panel-sunken` number; names of inactive steps are `sr-only` below `sm` |
| `Skeleton` | loading | `panel-sunken`, pulse, `aria-hidden`; takes the size of the content it replaces |
| Text links | default / hover | `brand` text with underline offset 4 px, or `copy-secondary` to `copy` on hover for secondary links |

### Domain components

- Vehicles: `VehicleCard` picks the product card (brief §127).
  Rent a Car: price the customer pays in Anton (total for the period when
  dates exist, otherwise per day), whole card is a stretched link,
  availability only when it is an exception. TVDE ("receipt"): dark card
  with "Sinal (pago agora)" and "Por semana", conditions in one line. Both
  show a double focus ring (asphalt and white) that reads on light and dark
  backgrounds. `VehicleImage` (`surface` light | dark; WeGest URLs unoptimized because they expire, Unsplash URLs through a CDN loader), `CarIllustration`
  (`body` sedan | suv | van, paint by name, logo line as ground, outline on
  dark surfaces), `VehicleGallery` (no thumbnails when there is only the
  illustration), `VehicleSpecs`, `VehicleOverview` (mobile order: gallery,
  decision panel, details; desktop: decision panel sticky on the right;
  TVDE hides conditions already in the panel), `VehicleResults` (filters
  only for values present in the data).
- Rent a Car: `RentACarSearchForm` (`variant` `card` | `bar` (full page
  width only) | `stack` (narrow columns such as the vehicle panel),
  `embedded` (the card grid inside another card, e.g. the hero tabs),
  `collapsible` on mobile; vehicle type first, radio pair "Carros" /
  "Comerciais" sent as `?tipo=passageiros|comerciais` and preselecting the
  "Tipo" filter; the return-location field is always shown: while
  "Devolver no mesmo local" is ticked it is disabled and shows the pickup point,
  so the form never changes height),
  `BookingWizard` (steps "Proteção e extras",
  "Dados", "Pagamento"; mobile bottom bar with total, summary toggle and
  the step action; restores choices from `extras`/`cobertura`/`passo`),
  `BookingSummary`,
  `CustomerForm`, `ReservationStatus`.
- TVDE: `TvdeSearchForm` (location, start date and time; leads to
  `/tvde/viaturas?local=&inicio=`), `PickupSelector` (re-checks availability on
  every change; `initialLocationId` and `initialPickupAt` from the search),
  `DynamicWeGestForm`, `DocumentUploader`, `ApplicationStatusBadge`,
  `ApplicationTimeline` (vertical on mobile, step state in text, payment
  step from the real payment), `ApplicationChecklist` ("Vai precisar de",
  from the API form), `ApplicationCard`, `TvdeSummary`, step
  components in `application-steps.tsx`.
- Payment: `PaymentForm` (UI only; card data never leaves the browser,
  the provider token is what reaches the server). `PendingPayment`:
  Multibanco reference or MB WAY request still to be paid.
- Mileage: always `formatMileage(offer)` ("6000 km por mês"), never a
  hard-coded unit.
- Account: `AccountShell`, `AccountNav`, auth forms, `ProfileForm`,
  `CancelBooking`, `BookingListItem`. `AuthShell` (`region`, `title`,
  `description`; sign in, register, recover password): one card, region photo
  with the veil, region lines and what the account gives on the left (desktop
  only), form on the right; on mobile only the form, under a brand-colour top
  border. Password fields have a show/hide button (`aria-pressed`). Sign in:
  "Esqueci-me da password" under the password, then "Ainda não tem conta?" with
  an outline "Criar conta" button.

## Content and edge cases

| Case | Behaviour |
|---|---|
| Client content missing (contacts, policies) | `Pending` / `ContactValue` chip "a confirmar"; never invented text |
| No vehicle photo in WeGest | `CarIllustration` by body type and paint, labelled "Imagem ilustrativa" |
| Stock photo of the model (demo data) | Photo flagged `illustrative`, same "Imagem ilustrativa" label; Unsplash CDN serves the width the screen needs (up to 3840 px), already 5:3 around a focal point on the car; `object-contain`, never cropped. A photo whose original cuts the car is not used |
| Long vehicle or location names | Wrap; no truncation of names, prices or references. Prices never split from their unit (no-break space before "€") |
| Empty results | `EmptyState` with the reason and the next action ("Limpar filtros", "Ver viaturas TVDE") |
| WeGest error or timeout | `ErrorState` with "Tentar novamente" and "Contactar-nos"; browser requests time out after 20 s (45 s for payment) |
| Loading | Route-level `PageSkeleton` and `Skeleton` blocks the size of the final content; buttons switch to `loading` |
| Vehicle taken during checkout | Message with what happened to the money and "Ver viaturas para as mesmas datas" |
| Session expired during checkout | "Entrar" link that returns to the same step with the same choices |
| Pending Multibanco / MB WAY | `PendingPayment` block on the confirmation and the booking page |
| Demo data | No site-wide banner (override 2026-10-08, see `DECISIONS.md`). Notices stay where they change what the user does: test card on the payment form, "Imagem ilustrativa" on stock photos |

## Accessibility (baseline: `docs/accessibility.md`)

- Focus: 2 px asphalt outline on every interactive element; never removed
  without a replacement. `scroll-padding-top` keeps focused elements below
  the sticky header.
- Focus order follows the DOM. Known, documented divergence: homepage on
  mobile shows the search before the service cards (CSS `order`).
- Each checkout step moves focus to its heading; drawers and the mobile
  menu trap focus, close on Esc and return focus to their trigger.
- Skip links: "Saltar para o conteúdo" (every page) and "Saltar para os
  resultados" (desktop filters).
- Errors: one announced summary per submit, focus on the first invalid
  field, each field error linked with `aria-describedby`.
- Touch targets at least 44 x 44 px below 768 px.
- Live regions: totals that change (`aria-live="polite"`), result counts,
  `Notice` (`status` / `alert`).
