# Changelog

All notable changes to the DÉCADA OUSADA platform.
Format: `MAJOR.MINOR.PATCH` (see `BLUEPRINT.md#versioning`).

## [0.8.0]: 2026-10-08

Second revision from team feedback (references: BV Seguros, Sixt, Localrent).

### Changed

- Hero in the BV pattern: region photos cross-fading (with pause), text on the
  left, search card on the right.
- Search card with big service tabs: Rent a Car in the brand colour, TVDE in
  asphalt, each saying who it is for and how it works, CTA naming the
  destination. Product pages show the card of their service.
- Homepage: the "Rent a Car ou TVDE?" cards are removed; two labelled chips
  under the title.
- Region switch with each region's colour.
- Regional shape: Continente angular (square buttons, diagonal lines), Açores
  rounded (pill buttons, wavy lines).
- Hero photos are automotive (car keys, cars on the road, driver at the wheel),
  chosen so the car shows between the copy and the search card.

## [0.7.0]: 2026-10-08

Revision from team feedback (references: Localiza, DASP RENT).

### Added

- Photo hero per region on the homepage, Rent a Car and TVDE pages, with the
  availability search inside it; homepage search with Rent a Car and TVDE tabs.
- TVDE search by location and start date; results filtered by location and the
  pickup carried to the vehicle page.
- "Rent a Car ou TVDE?" comparison on the homepage.
- Segmented region switch in the header, mobile menu and homepage hero.

### Changed

- Rent a Car entry is the categories page (photo, models, "desde" per category);
  a category opens the results already filtered.
- Region identity beyond colour and logo: own photos and homepage title per region.
- TVDE page opens with the photo hero; the 5 steps follow in their own section.

## [0.6.0]: 2026-10-08

Ready for Vercel.

### Added

- `vercel.json` (functions in Paris, `cdg1`) and `docs/deploy-vercel.md`
  (project, environment variables, domains, demo limitation).

### Changed

- Region switch with `?regiao=` works on any host other than the live domain
  (including `*.vercel.app`); the live domain still decides by host.
- `robots.txt` blocks indexing while `APP_URL` is not set.

## [0.5.2]: 2026-10-08

### Added

- Demo vehicle photos: one free Unsplash photo per model (17 of 22 vehicles,
  exact model checked), served by the Unsplash CDN at the width each screen
  needs, up to 3840 px, already cut to 5:3 around the car so no photo is
  cropped in its frame (`object-contain` as a safeguard). Labelled "Imagem
  ilustrativa". Renault Trafic and Kangoo (no free photo of the exact model)
  and Toyota Yaris Hybrid, Peugeot 5008 and Citroën SpaceTourer (car cut in
  the original photo) keep the illustration.

## [0.5.1]: 2026-10-08

Design handoff, phase 3 of `PROMPT-MASTER-DESIGN.md`.

### Added

- `docs/design-system.md` is now the full specification: token values with
  measured contrast, typography, scales, breakpoints, motion, component
  states, content edge cases and accessibility baseline.

### Fixed

- Form field outlines reach 3:1 contrast (new `line-control` token).
- Transitions use the motion tokens (120 ms, standard easing).
- Checkout step scroll respects reduced motion.

## [0.5.0]: 2026-10-08

Layout precision, phases 1 and 2 of `PROMPT-MASTER-POSICIONAMENTO-CORRETO.md`.

### Added

- `npm run qa:layout` (`scripts/qa-layout.mjs`): layout checks in headless
  Chrome for every route, 9 widths, both regions, no new dependency.
- Layout tokens and utilities: `h-header`, `sticky-panel`, `tap-target`,
  `max-w-field-short`, room for a fixed bottom bar.
- "Saltar para os resultados" at the top of the desktop filters.
- TVDE application on mobile: summary line (vehicle, week, deposit) before
  the form, opening the full summary.

### Fixed

- "Alterar datas" on the Rent a Car vehicle page pushed the form out of the
  panel and gave the page a horizontal scroll (new `stack` form variant).
- Focus and anchors stopped under the sticky header (`scroll-padding-top`).
- Filters and the TVDE vehicle panel were sticky but taller than the screen.
- The mobile checkout bar covered the end of the footer.
- The TVDE stepper overflowed at 375 px; inactive step names are read by
  screen readers.
- Touch targets under 44 px on mobile: header account button, account tabs,
  breadcrumbs, footer links, checkboxes, FAQ questions, form links.
- Booking confirmation buttons were squashed to 24 px on mobile.
- TVDE step buttons full width on mobile, like the Rent a Car checkout.
- Short fields (CVV, card expiry, postal code) no longer stretch.
- Select arrows covered long option text (the control padding cancelled the
  arrow space).
- Results search bar is one row from 1024 px; two columns below.

### Changed

- Account and sign-in pages take vertical rhythm from `Section`.

## [0.4.0]: 2026-10-07

UX/UI, phase 2 of `PROMPT-MASTER-UX-UI.md` (15 approved items).

### Added

- Mobile checkout bar with total, expandable summary and the step action.
- Pending Multibanco / MB WAY block ("Falta pagar") on the confirmation and
  in the booking page of the account.
- Exits for a vehicle booked by someone else ("Ver viaturas para as mesmas
  datas") and an expired session ("Entrar", choices kept).
- TVDE "Vai precisar de" (documents from the API, field count, deposit) on
  the vehicle page and at the start of the registration.
- TVDE entry page: "Criar conta" first, with what the account is for.
- Funnel events with the brief §106 names (`track()`, no sending yet).

### Changed

- Checkout step "Proteção e extras"; "Sinal (pago agora)"; "Pagar X e
  enviar candidatura"; TVDE kilometres per month.
- Validation copy: "Indique ..." for empty fields; one announced error
  summary per submit instead of one alert per field.
- Homepage on mobile: search right after the title.
- TVDE timeline vertical on mobile, with step state for screen readers and
  the payment step from the real payment.

### Fixed

- Filters drawer and mobile menu: Esc closes, focus stays inside and
  returns to the button.
- Checkout focus goes to the step heading; coverage options grouped in a
  fieldset; 44 px quantity buttons.
- Account page grids overflowing at 375 px.
- Booking summary mileage reads "300 km por dia incluídos", like the rest of the site.

### Docs

- `docs/lessons-learned.md`: what the funnel walkthroughs taught (clean state for
  scripted flows, one announced error summary, data-dependent overflow, payment
  references).

## [0.3.0]: 2026-10-07

Design direction, phase 2 of `PROMPT-MASTER-DESIGN.md` (15 approved items).

### Fixed

- TVDE cards on the dark homepage band showed no name or price.
- Açores green passes AA (`#0b7a00`, 5.5:1 with white).
- Selected options and focused fields no longer look like errors:
  selection and focus in asphalt with a check mark, error colour moved away
  from the brand red.
- Vehicle page on mobile: price and action right after the image (they were
  about 1900 px down).
- Disabled buttons are neutral instead of faded brand red.
- Dark paints were invisible on the dark TVDE card illustration.

### Changed

- Rent a Car and institutional pages on light backgrounds; dark reserved for
  identity and TVDE. Logo lines crisp, only on the TVDE landing top.
- New Rent a Car card (total first, whole card clickable) and TVDE card
  (payment now and per week). TVDE landing top shows the 5-step process.
- Vehicle illustration by body type with the logo line as ground; no fake
  photo angles.
- Removed uppercase eyebrows, middle dots, appended arrows and faded numbers.
- Explanatory copy and content lists at body size.
- TVDE vehicle page shows each condition once.
- Customer areas use a compact light title band; larger logo in the desktop
  header.

## [0.2.0]: 2026-10-07

### Changed

- Aligned with Web Blueprint: token names and Tailwind aliases from the
  Blueprint (`src/styles/tokens.css`, `src/styles/tailwind.css`), every
  class migrated off raw colours, arbitrary values and ad-hoc z-index.
- `Container` / `Section` with the Blueprint variant API; pages now take
  vertical rhythm only from `Section`.
- Vehicle illustration and demo data use token colours (paint names).
- Removed em-dashes from copy, comments and docs.
- Removed unconfirmed claims (service promises, response times, extra
  benefits). Missing client content (contacts, some FAQ answers) is now a
  visible `Pending` placeholder; demo data shows a banner on every page.

### Added

- `AGENTS.md`, `CLAUDE.md`, `BLUEPRINT.md`, `DECISIONS.md`, Blueprint
  `docs/` and project `docs/stack.md` / `docs/design-system.md`.
- `npm run check`, `npm run qa`, `npm run validate:wegest`.
- `scripts/qa-audit.mjs` (Blueprint audit adapted to Next.js).

### Fixed

- Filters drawer backdrop is a real button; auth forms use unique ids.
- Demo data: rental days ignore the daylight-saving change, as the WeGest API does.

## [0.1.0]: 2026-10-07

### Added

- Rent a Car: search, results with filters, vehicle page, checkout
  (coverage, extras, customer, payment UI), confirmation, customer area.
- TVDE: listing, vehicle page with live availability, dynamic
  registration form, document upload, deposit payment, application
  status, automatic refund on rejection, driver area.
- Regions Continente and Açores on one codebase (`proxy.ts`).
- WeGest service layer (mock and HTTP transports), payment gateway
  abstraction, technical back office (`/admin`).
- WeGest API analysis (`docs/wegest/`) and endpoint validator.
