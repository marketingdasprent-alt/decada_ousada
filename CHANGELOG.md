# Changelog

All notable changes to the DÉCADA OUSADA platform.
Format: `MAJOR.MINOR.PATCH` (see `BLUEPRINT.md#versioning`).

## [0.15.1]: 2026-10-13

### Fixed

- `/motoristas` popup: the WeGest form URL changes on every opening (`&v=…`),
  so a browser that cached an old blocking answer from WeGest no longer shows
  "www.wegest.pt está bloqueado" (`ERR_BLOCKED_BY_RESPONSE`).

## [0.15.0]: 2026-10-13

### Changed

- `/motoristas`: every application button opens the WeGest form in a popup
  on the same page, with the chosen form already loaded (WeGest now allows
  embedding). `DRIVER_FORM_OPEN = "popup"`.

### Fixed

- The embed URL carries `&origem=site`, so browsers that cached WeGest's old
  `X-Frame-Options: DENY` answer load the form again.

## [0.14.2]: 2026-10-13

### Changed

- `/motoristas`: the "Comece a faturar já" section shows the same direct
  buttons as the hero (`ApplyChoice`) instead of the embedded WeGest form,
  which stayed blank for a few seconds (`DRIVER_FORM_KIND = "links"`).

## [0.14.1]: 2026-10-13

### Changed

- `/motoristas`: the application buttons open the WeGest form directly in a
  new tab, without the popup (`DRIVER_FORM_OPEN = "tab"`; "popup" brings it
  back once WeGest allows embedding).

## [0.14.0]: 2026-10-13

### Changed

- `/motoristas`: "Preciso de carro" and "Tenho carro" (hero, Aluguer/Slot
  section, "2 min" badge) open the WeGest form in a popup instead of jumping
  to another section (`DriverApplyDialog`, any `data-candidatura` link).

## [0.13.1]: 2026-10-13

### Added

- `/motoristas`: three TVDE testimonials from drivers' messages to the team
  (Antonio Dias, Felipe Frascione, Gabriela), with their authorisation. They
  have no star rating, so `Testimonials` now shows stars only when a
  testimonial has one.

## [0.13.0]: 2026-10-13

### Added

- `/motoristas`: the WeGest forms embedded in the page (`?embed=1`,
  `DriverFormEmbed`), with the Preciso de carro / Tenho carro switch and the
  height following the form. While WeGest still refuses framing, a button
  opens the form in a new tab after 8 s on screen.
- Site-made forms, ready behind `DRIVER_FORM_KIND = "site"`: the two forms
  inside the page, with the fields of the WeGest forms. They create the same TVDE GERAL
  and SLOT leads in WeGest (`POST /api/motoristas/lead`, `src/services/leads`),
  with Cloudflare Turnstile and a honeypot against bots. The "Candidatar-me"
  buttons open the right form. Until `WEGEST_LEADS_URL`/`WEGEST_LEADS_KEY`
  are set, the page keeps the buttons to the WeGest-hosted forms
  (`docs/motoristas-formularios.md`).

## [0.12.1]: 2026-10-13

### Fixed

- Production builds no longer fail with WeGest `429 LIMITE_EXCEDIDO` now that
  the Rent a Car catalogue has 50 models: the build runs in one process, so
  the catalogue cache is shared (`experimental.cpus: 1`).

## [0.12.0]: 2026-10-13

### Changed

- `/motoristas` joins the original landing with the native page: light hero
  with a tilted photo collage, the "Operador TVDE certificado" tag, a
  "Pagamento da semana" note and a rotating "2 min" badge (`DriversHero`); a
  photo strip of Continente cities and two crossed tapes that move with the
  scroll (`Marquee`); numbers that count up (`CountUp`).

### Fixed

- `/motoristas` title: the brand red now sits on a light background (it
  failed contrast on the dark photo) and the two lines no longer touch (new
  token `--line-height-display-loose`).

## [0.11.1]: 2026-10-12

### Changed

- Instagram also reads `INSTAGRAM_FEED_URL` (a JSON feed such as Behold,
  which renews the access itself) when there is no `INSTAGRAM_ACCESS_TOKEN`
  (`docs/instagram.md`).
- A post whose image is not on the Instagram CDN (`images.remotePatterns`) is
  left out instead of making `next/image` fail the whole page.

### Removed

- The static `/motoristas` landing (`public/landing/motoristas.html`, the
  `proxy.ts` rewrite and `GET /api/instagram`) merged into `main` the same
  day as 0.10.0: the native `/motoristas` page (0.11.0) replaces it, and its
  Instagram section replaced the duplicate one.

## [0.11.0]: 2026-10-12

### Added

- `/motoristas`: driver recruitment page rebuilt from the team's landing
  (`landing-motoristas.html`) with the site's components and tokens: hero with
  the Aluguer / Slot choice, numbers and awards over a photo, benefits, Aluguer
  vs Slot, three real TVDE vehicles from WeGest, three steps, TVDE
  testimonials, questions, application (WeGest hosted forms, new tab),
  Instagram and the drivers' contacts. Facts confirmed by the team.
- "Motoristas" in the header, "Trabalhar como motorista" in the footer, and
  the page in the sitemap. New `CoverPhoto` (photo covering its block).

## [0.10.0]: 2026-10-12

### Added

- WeGest real API adapter (`WEGEST_MODE=http`): locations, categories, Rent a
  Car models (`/modelos`), TVDE models (`/tvde/modelos`), availability with the
  period price, quotes, extras and coverages come from api.wegest.pt. Bookings
  (`POST /reservas`) and TVDE applications (`POST /tvde/candidaturas`) are
  implemented but stay off until `WEGEST_PEDIDOS_ONLINE=on`; while off, the
  vehicle pages show "Contactar a equipa" instead of "Reservar" /
  "Candidatar-me".
- WeGest errors are read from `erro.codigo` and shown as our own pt-PT
  messages; catalogue responses are shared for 5 minutes per process and 429
  waits for `Retry-After` (API limit: 120 requests per minute).

### Fixed

- Builds no longer fail when the WeGest catalogue is empty (Rent a Car has no
  models yet): `generateStaticParams` returns a placeholder that answers 404.

## [0.9.5]: 2026-10-12

### Added

- Homepage section "Siga-nos no Instagram", between the TVDE band and the
  pickup points: the latest 8 posts from @decada_ousada, read on the server
  from the Instagram API and refreshed every minute (`InstagramFeed`). Without
  `INSTAGRAM_ACCESS_TOKEN` it shows only the "Seguir no Instagram" button.
  Setup and token renewal: `docs/instagram.md`.
- Instagram link (@decada_ousada) in the footer contacts.

## [0.9.4]: 2026-10-12

### Changed

- The customer testimonials panel moves back between Rent a Car and TVDE on
  the homepage (team request).
- Prices easier to see: on the homepage the Rent a Car "desde" price (per
  day, IVA incluído) and the TVDE one (per week, with the 50 € deposit
  note) leave the end of the paragraph and get their own block
  (`PriceDisplay`, now with `note` and `tone`).
- Rent a Car vehicle page: caução, franquia, km incluídos, km adicional and
  the cancellation policy sit in the decision panel (`OfferCostFacts`), under
  the price without dates and right after "Reservar" with dates (so the
  button stays on screen at 1280x800); they leave the "Condições" list.
- Price design pass: the homepage Rent a Car price sits on the same row as its
  buttons, with the advantages below; no boxes around the "desde" prices; the
  vehicle page uses `PriceDisplay` and shows "Total, N dias" in the display
  face; prices read as one sentence for screen readers.

## [0.9.3]: 2026-10-12

### Added

- Homepage panel "O que dizem os nossos clientes" after the TVDE band: 14
  DÉCADA OUSADA customer testimonials in an endless horizontally scrolling
  row (after the last card comes the first) with arrows, a "4 de 14" counter, a position bar in the region colour, "Ler
  tudo" for long texts and a staggered entrance (`Testimonials`).
- `Testimonials` takes a `service`: the 3 TVDE testimonials are kept for a
  separate TVDE panel and are not shown on the homepage.
- Motion token `--stagger-step`; utilities `scrollbar-none` and `reveal-item`.

## [0.9.2]: 2026-10-09

### Changed

- TVDE reservation fee: 50 € for every vehicle, confirms the vehicle
  reservation and is deducted from the deposit at pickup (team rule; one
  constant, `TVDE_RESERVATION_FEE`). Process steps, payment step, summary
  ("Restante da caução") and FAQ say so.

### Added

- `docs/conteudo/prompt-mestre-informacao.md`: master prompt to research,
  synthesise and apply TVDE and Rent a Car information, with the facts the
  company has confirmed.
- `docs/conteudo/pesquisa-tvde.md`: phase 1 of the master prompt (TVDE
  requirements after Lei n.º 59/2026, Azores regime, market costs, drivers'
  doubts, Rent a Car practice, questions for the company), with sources.
- `docs/conteudo/mapa-informacao.md`: phase 2 (messages per decision stage,
  site-ready FAQ tagged general / confirmed / pending, glossary, gaps).
- Phase 3 of the master prompt on the site: TVDE page "Requisitos" (IMT
  requirements with the official link; Azores regional regime; company
  requirements pending), FAQ regrouped (TVDE: começar, valores, contrato e
  viatura; Rent a Car) with the new answers and pending markers, and a
  "Termos usados" glossary. FAQ is region-aware (Azores certificate answer).
- Homepage TVDE band: "O que precisa de saber" (fee, what each vehicle shows,
  certificate, online application), after team feedback that the homepage had
  too little TVDE information. TVDE page "Requisitos" has the anchor
  `#requisitos`.
- Homepage restructured to introduce the services (team feedback): hero, Rent
  a Car (who it is for, advantages, price from, links to categories and fleet),
  TVDE band, pickup points. The Rent a Car categories and TVDE vehicles no
  longer appear under the hero; categories stay on the Rent a Car page.

## [0.9.1]: 2026-10-09

Team feedback on the homepage.

### Added

- Homepage: TVDE explained before the pickup points (dark band, five steps,
  price from, "Ver viaturas TVDE" and "Saber mais"), shared with the TVDE page
  (`TvdeProcess`). New button variant `onDark`.

### Changed

- No orphan words: headings break into balanced lines (`text-wrap: balance`),
  paragraphs avoid a lone last word (`text-wrap: pretty`).

## [0.9.0]: 2026-10-08

Third round of team feedback.

### Added

- Rent a Car search starts with the vehicle type: Carros (passageiros) or
  Comerciais; the results open with that type filtered.
- Homepage: under the hero, the Rent a Car categories (photo, model count,
  price from) when the Rent a Car tab is chosen; the TVDE band when TVDE is.
- Search card, TVDE tab: "Como funciona" box fills the height the panel has
  over the Rent a Car one.
- No grid of cards ends a row with empty space: categories and pickup points
  stretch the first cards; vehicle lists end with a card that links to the
  full fleet, contacts or FAQ. `qa:layout` check 4 now fails any row with
  empty space.

### Changed

- The search card keeps a fixed height: switching service or unticking
  "Devolver no mesmo local" no longer moves the layout.
- Demo vehicle photos with readable licence plates now use edited copies with
  the plates blurred (`public/demo/`); same for the Lisbon hero photo.
- Fiat Panda shows the illustration (no free photo of the current model).

- Sign in, register and recover password: one card with the region photo and
  what the account gives on the left, the form on the right; show/hide
  password; "Criar conta" as a full button under the sign-in form.

### Removed

- The site-wide demo banner under the header (override in `DECISIONS.md`).
- The demo account notice on the sign-in page.

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
