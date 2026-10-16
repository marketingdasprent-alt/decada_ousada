# Changelog

All notable changes to the DÉCADA OUSADA platform.
Format: `MAJOR.MINOR.PATCH` (see `BLUEPRINT.md#versioning`).

## [0.20.1]: 2026-10-16

### Changed

- The TVDE driver registration form (/tvde/candidatura) checks the rules in
  the WeGest document "Cadastro de motorista TVDE no WeGest" (16/10/2026)
  before sending POST /tvde/candidaturas: phone in international format, a
  valid Portuguese NIF (check digit), a valid IBAN (mod 97), ID document,
  licence and TVDE licence expiring after today, and licence categories that
  include B.
- New "Ainda estou a tirar a formação TVDE e não tenho licença." box. The TVDE
  licence number and expiry are required unless it is ticked; ticked, they are
  hidden and the API gets `em_formacao_tvde: true` with no licence. Before,
  the licence was optional and a blank number meant "in training".
- The IBAN goes to the API without spaces and in capitals.
- Driver registration no longer needs a vehicle. The flow is Entrar >
  Motorista TVDE > Criar conta > registration form: a new driver account goes
  to /tvde/candidatura, which without `viatura`, `inicio` and `local` shows
  only the form (steps Conta, Cadastro, Enviado). It is sent without
  `modelo_pretendido_id` and `data_inicio_pretendida` (optional in the API)
  and ends on the confirmation page, which points to the driver portal for
  the documents. Choosing a vehicle first still works as before.
- The driver account page (/entrar?tipo=motorista) opens with "Preencher o
  cadastro de motorista".
- Validation of the registration flow (`PROMPT-MASTER-VALIDACAO-CADASTRO-MOTORISTA.md`,
  report in `docs/design/validacao-cadastro-motorista.md`): empty-field
  messages written per field ("Indique o telemóvel.", "Indique até quando o
  documento é válido."); without a vehicle the steps and the form share one
  column; on mobile one line "Parte 2 de 3: Identificação e carta", which
  takes the focus on each part; a tick on the chosen document type too;
  "Enviar candidatura" and "Recebemos a sua candidatura."; "Abrir o portal do
  motorista" on one line; a browser warning before leaving with typed data;
  the driver tab on /entrar says "Cadastro e painel"; without a vehicle the
  form and its steps are centred on the page.
- Licence categories: the 13 buttons are replaced by one required box,
  "Tenho carta de condução de categoria B." For TVDE only B matters, and the
  API (which needs a list that includes B) gets `categorias: ["B"]`.
- "Dados pessoais" (/minha-conta/perfil and /tvde/minha-conta/perfil) without a
  record now offers only "Preencher ficha pessoal", which opens the registration
  form (/tvde/candidatura) without a vehicle. On /minha-conta/perfil, with no
  Rent a Car record, the record filled in that form is shown. Choosing a
  vehicle without a record still asks for the form, as before.
- Signing in with a driver account and no other destination now goes straight
  to /tvde/viaturas. The driver account page stays under "A minha conta" (with
  "Terminar sessão"); a new account still goes to the registration form.
- Online requests with the real API (`WEGEST_PEDIDOS_ONLINE=on`), checked
  against a local fake of the WeGest API:
  - No online charging for now (`onlinePaymentsEnabled`: only in demo mode or
    with a real `PAYMENT_PROVIDER`). Rent a Car: the last step is "Confirmar",
    with "Pedir reserva"; the booking goes to WeGest as pending, with no
    payment. TVDE: "Sinal" without "(pago agora)", and nothing says it is paid
    at the end.
  - TVDE with a vehicle: after sending, straight to the confirmation (the API
    takes no documents and there is no deposit to pay); steps Levantamento,
    Cadastro, Enviado. The confirmation and the application page take the
    vehicle and location names from the catalogue, and hide price, deposit and
    payment rows the API does not return. The timeline never marks a payment
    that did not happen.
  - The confirmation reads the status from WeGest when the site no longer
    links the application to the account (no database yet).
  - A second application on the same account (WeGest 409): one application per
    account, with "Contactar a equipa".
  - Cloudflare Turnstile on the last part of the registration, checked by the
    API route; active only with `TURNSTILE_SITE_KEY` and
    `TURNSTILE_SECRET_KEY`.
  - No page in the booking flows promises an email: the site does not send
    emails yet.
- The registration form is split into three short parts (Sobre si,
  Identificação e carta, IBAN e envio), each checked before "Continuar", with
  "Voltar" to go back. ID type and licence categories are tap buttons (B
  already ticked) instead of a list and a text box. The postal code and IBAN
  format themselves while typing, a filled field says what is wrong when the
  driver leaves it, and optional fields say "(opcional)". Browser autofill and
  the numeric keyboard work on the known fields.

## [0.20.0]: 2026-10-15

### Added

- Driver accounts are WeGest accounts (WeGest guide "Contas de motorista no
  site da Década"). The "Motorista TVDE" tab on /entrar now signs in with the
  same login as the WeGest portal and app, instead of linking out to it.
  Sign-up (/registar?tipo=motorista), email confirmation, password recovery
  (new /nova-password page) and the driver's account page.
- The TVDE application requires a driver account: the email comes from the
  account and the server sends the token to WeGest as `X-Motorista-Token`,
  never storing or logging it. Errors 401 (one refresh and retry), 403, 409,
  429 and 503 use the guide's messages.
- New dependency `@supabase/supabase-js`, required by the guide (see
  `DECISIONS.md`). Three new public variables: `NEXT_PUBLIC_WEGEST_AUTH_URL`,
  `NEXT_PUBLIC_WEGEST_AUTH_KEY` and `NEXT_PUBLIC_WEGEST_ORG_ID`. Without them
  the site keeps the previous behaviour.
- New /rent-a-car/frota page, the only one that reads GET /modelos. Each model
  shows "Disponível a partir de {data}" and "Pesquisar a partir desta data",
  which opens the search with that date filled in.

### Changed

- Rent a Car starts with the search (team decision). /rent-a-car shows the
  search, a "Ver a frota" link and the counters; the category grid is gone
  (`category-grid.tsx` removed). /rent-a-car/viaturas without dates shows only
  the form.
- Pickup can be booked from today to today + 15 days (`MAX_ADVANCE_DAYS`), in
  the date picker and when searching.
- Results show the available quantity ("5 viaturas disponíveis", "Última
  viatura disponível") from `quantidade_disponivel`.
- No results: "Sem viaturas para estas datas." with up to 3 alternative dates
  of the same length that WeGest confirms have vehicles.
- A 400 `PERIODO_INVALIDO` shows inside the search form instead of an error
  page.
- Footer, 404 and the vehicle breadcrumb link to the Frota page; the sitemap
  lists it.

## [0.19.0]: 2026-10-15

### Changed

- TVDE search asks only for the pickup location (marketing request) and leads
  to /tvde/viaturas?local=. The date and time are picked on the vehicle page,
  where availability is checked. A hint under the field says so.
- TVDE cards say where the vehicle is picked up ("Levantamento em Leiria e
  Lisboa"), with the same rule as the vehicle page.
- TVDE list: one row "Viaturas com levantamento em X." with "Alterar", which
  goes back to the search card on /tvde (#pesquisa). Shorter page header.
- Home page, TVDE tab: the "Como funciona" box keeps its natural height and
  the search sits at the bottom, with the button where the Rent a Car one is.
- TVDE vehicle page button: "Reservar esta viatura" (was "Candidatar-me a
  esta viatura").
- With online requests off, the TVDE and Rent a Car vehicle pages show only
  "Contactar a equipa", without the "reservas online" notice. The API error
  for that case now talks about reservations.

## [0.18.4]: 2026-10-14

### Changed

- /motoristas copy (marketing request): "Renda fixa semanal" is gone, because
  it read as a fixed weekly income for the driver. Hero, benefits, Aluguer or
  Slot, fleet, steps, FAQ and the application section now describe the weekly
  rental cost, weekly payment of earnings and the support. Layout unchanged.

### Fixed

- Pickup points: with name-only data from the API each link was 26 px tall
  on mobile, below the 44 px tap target. The row spacing now sits inside the
  link, so the whole row is clickable (66 px with just the name).

## [0.18.3]: 2026-10-14

### Changed

- Pickup points: one component, `PickupPoints`, on the home page,
  /rent-a-car ("Os nossos balcões") and /contactos ("Balcões"). A list
  instead of cards, because the WeGest API returns only the name today: title
  on the left, points on the right with a brand-colour location icon and the
  name in display type, each linking to its page. Address, opening hours,
  "Apenas levantamento" and "Ver no mapa" (/contactos) show only when the API
  has them. No points, no section.
- Review prompt and report: `PROMPT-MASTER-REVISAO-PONTOS-E-MORADA.md`,
  `docs/design/revisao-pontos-morada.md`.

## [0.18.2]: 2026-10-14

### Changed

- Home, "Pontos de levantamento": the section is hidden when the WeGest API
  returns no pickup points (it showed only the heading before). The cards
  already came from the API; Leiria, Lisboa, Porto and Faro are mock data.
- Footer and /contactos: no address line. The "Morada a confirmar"
  placeholder and the "Sede" card are gone (client request).

## [0.18.1]: 2026-10-14

### Fixed

- Vercel build: `vercel.json` forces the Next.js preset (`framework`,
  `outputDirectory: .next`). The Vercel project `decadaousada-landing` was
  set up for the old Vite landing and looked for `dist`.

## [0.18.0]: 2026-10-14

### Changed

- Meta Pixel loads on the first visit with the cookie banner still open, and
  stops only if the visitor chooses "Só necessários" or turns marketing off.
- Banner and /privacidade: the marketing cookies are on until the visitor
  refuses them.
- Production builds get the pixel id from `.env.production`
  (`NEXT_PUBLIC_META_PIXEL_ID`).

## [0.17.1]: 2026-10-14

### Changed

- Cookie banner shorter (196 px at 375, was 263), 44 px buttons, and first in
  the keyboard order. "Gerir preferências" and "Política de cookies" are
  text links under the two buttons.
- While the banner is open the page keeps room for it: nothing focused ends
  up under the banner and the mobile checkout bar ("Continuar") sits above it
  instead of behind it.
- Footer: "Cookies" is now "Preferências de cookies", a link to
  /privacidade#cookies that opens the preferences when JavaScript runs; the
  bottom row stacks below `lg` and wrapped links keep a gap.
- /privacidade on mobile lists each cookie as a block (De quem, Para quê,
  Duração) instead of a table cut at the edge.
- /entrar: "Ir para o painel do motorista" shows an external-link icon.
- `npm run qa:layout` also checks /privacidade and /entrar?tipo=motorista.

### Fixed

- Horizontal scroll at 768 px on every page: the footer email
  (motoristas.tvde@decadaousada.pt) now wraps inside its column.

## [0.17.0]: 2026-10-14

### Added

- Meta Pixel (Facebook and Instagram), id in `NEXT_PUBLIC_META_PIXEL_ID`.
  It only loads after the visitor accepts marketing cookies and receives
  page views plus the funnel steps (search, vehicle view, checkout, booking
  with the API total, TVDE application, driver lead), never personal data.
- Cookie banner (Aceitar tudo / Só necessários / Gerir preferências) and a
  preferences dialog, also opened from "Cookies" in the footer. Withdrawing
  consent stops the pixel and deletes its cookie.
- /privacidade: cookie list and privacy policy, with the legal text marked
  as pending until DÉCADA OUSADA provides it. Linked in the footer and the
  sitemap.

## [0.16.0]: 2026-10-14

### Added

- /entrar has two logins: "Rent a Car" (the site account, as before) and
  "Motorista TVDE", which sends the driver to the WeGest driver panel
  (www.wegest.pt/motorista/login), with a link to apply on /motoristas for
  anyone not yet working with DÉCADA OUSADA. The choice is a link
  (`?tipo=motorista`), so it works without JavaScript.

## [0.15.2]: 2026-10-14

### Changed

- Phone and WhatsApp now +351 910 102 454 (was +351 912 023 234) on
  /motoristas, and the site's general contacts (footer, /contactos, booking
  page) show this phone and motoristas.tvde@decadaousada.pt in both regions.
  The address stays "a confirmar".
- Facebook (facebook.com/decada.ousada) next to Instagram: a "Facebook"
  button beside "Seguir no Instagram" (homepage and /motoristas) and a link in
  the footer contacts (new `FacebookIcon`).

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
