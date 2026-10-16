


---

```
DECISION:
Hosting on Vercel (requested 2026-10-08), via the Git integration.
- vercel.json pins functions to Paris (cdg1), close to WeGest and to an EU
  database (Supabase has a Paris region too); the default is US East.
- Region switching with ?regiao= / cookie now works on any host that is not
  the live domain (isLiveDomain: decadaousada.pt and subdomains), so a
  *.vercel.app demo can show both regions. On the live domain the region
  still comes only from the host.
- Without APP_URL, robots.txt disallows everything, so a demo deployment is
  not indexed.
- Known limitation until DATABASE_URL exists: in-memory state is per
  instance on Vercel; documented in docs/deploy-vercel.md.

REASON:
Put the demo online for the client and prepare production hosting.

SCOPE:
vercel.json, src/proxy.ts, src/domain/region, src/app/robots.ts,
docs/deploy-vercel.md, .env.example, README.md.

LEVEL:
Infrastructure.

DATE:
2026-10-08
```


---

```
DECISION:
Revision of 2026-10-08 (team feedback, references: Localiza, DASP RENT):
- Product pages and the homepage open with a photo hero per region
  (`Hero`, `HeroBackground`, images in lib/region-imagery.ts: Unsplash
  License, real places of each region). A dark veil keeps white text AA:
  70% on mobile, 90% to 20% gradient from the left on desktop.
- Homepage search with one tab per service (`HeroSearch`, ARIA tabs);
  new `TvdeSearchForm` (location and start date) and
  `RentACarSearchForm variant="embedded"`; new utility `grid-tvde-search`.
- `/rent-a-car` is the categories page; `?categoria=` preselects the
  category in the results filters. TVDE results accept `?local=` and
  `?inicio=` and pass them to the vehicle pickup selector.
- Region switch as a segmented control (`RegionSwitch`).
- `ServiceComparison` on the homepage, with facts already in the brief.
- Exception to the 2026-10-07 direction: the TVDE landing no longer opens
  with the dark header and logo lines; it uses the photo hero like the
  other product pages.

REASON:
Team feedback on the hero, region switch, regional identity, Rent a Car
navigation, product heroes and service clarity.

SCOPE:
src/components/shared/{hero,hero-background,hero-search,service-comparison}.tsx,
src/components/layout/{region-switch,site-header,mobile-menu}.tsx,
src/components/tvde/{tvde-search-form,pickup-selector}.tsx,
src/components/rentacar/search-form.tsx, src/components/vehicles/vehicle-results.tsx,
src/lib/{region-imagery,unsplash}.ts, src/app/[region]/{page,rent-a-car,tvde}/**.

LEVEL:
Component system (Level 3) and pages.

DATE:
2026-10-08
```


---

```
DECISION:
Second revision of 2026-10-08 (team feedback; references: BV Seguros hero,
Sixt, Localrent, Localiza Lisboa; Budget and Momondo could not be opened).
- Hero in the BV pattern: photos of the region cross-fading (homepage: the
  three region scenes), pause control and no motion for reduced-motion
  users; veil `hero-veil` (heavier behind the copy and at the bottom).
- Search card on the right (`grid-hero`, --layout-hero-form 27rem). Homepage:
  big service tabs; Rent a Car in the brand colour, TVDE in asphalt, each with
  who it is for, how it works and a CTA naming the destination. Product pages:
  the card of that service only (`HeroSearch only`).
- The "Rent a Car ou TVDE?" cards are removed from the homepage (feedback:
  remove the two cards); the difference is now in the search card and in two
  labelled chips under the hero title.
- Region switch shows each region's colour (new constant tokens
  --color-mainland, --color-azores).
- Regional layout difference, same family: Continente angular (radius
  3/4/6/8 px, buttons 2 px, diagonal decorative lines from the logo banner);
  Açores rounded (radius 12/16/22/28 px, pill buttons, wavy decorative lines
  for the islands' relief). New token --radius-action (alias `rounded-button`)
  for buttons; `RegionLines` component.

REASON:
Team feedback: hero with photos like BV, form on the right with an explicit
TVDE / Rent a Car distinction, clearer region switch, visual difference
between the regional sites.

SCOPE:
src/styles/tokens.css, src/styles/tailwind.css, src/components/shared/
{hero,hero-background,hero-search,region-lines,ui}.tsx,
src/components/layout/region-switch.tsx, src/components/rentacar/search-form.tsx,
src/components/tvde/tvde-search-form.tsx, src/app/[region]/{page,rent-a-car,tvde}.

LEVEL:
Project tokens (Level 2) and component system (Level 3).

DATE:
2026-10-08
```

---

```
DECISION:
Hero photos changed to automotive scenes (request of 2026-10-08): car keys,
cars on the road, a driver at the wheel, one per region and scene in
lib/region-imagery.ts (Unsplash License). Chosen so the car falls between the
copy (left) and the search card (right). Captions describe what the photo
shows without claiming a place the photo does not prove; the Lisbon street
stays in the Continente set.

REASON:
Feedback: backgrounds should be more automotive.

SCOPE:
src/lib/region-imagery.ts.

LEVEL:
Content.

DATE:
2026-10-08
```

---

```
OVERRIDE:
AGENTS.md rule 4 ("Demo data is only acceptable behind the demo banner") and
the "Demo data" row of docs/design-system.md.

DECISION:
The site-wide demo banner under the header is removed, at the team's request.
The local notices stay: test card on the payment form, "Imagem ilustrativa"
on stock vehicle photos, "Só demonstração" in the admin simulator. The demo
account notice on the sign-in page was removed too (team request, 2026-10-09);
the account still exists in mock mode (src/services/auth/seed.ts, README).

REASON:
Team request (2026-10-08): the banner should not appear on the page while the
site is shown to the client. The preview on *.vercel.app is not indexed
(robots.txt disallows all without APP_URL).

RISK:
With WEGEST_MODE=mock, prices, locations and availability are fictitious and
nothing on the page says so. The site must not be announced to the public
before WEGEST_MODE=http.

SCOPE:
src/app/[region]/layout.tsx, docs/design-system.md.

LEVEL:
Project rule override.

DATE:
2026-10-08
```

---

```
DECISION:
Third round of team feedback (2026-10-08).
- Rent a Car search asks the vehicle type first (Carros / Comerciais, radio
  pair), sent as ?tipo= and preselecting the existing "Tipo" filter. A
  ?categoria= of the other type is ignored.
- Homepage: the section under the hero follows the hero tab
  (ServiceSelectionProvider + ForService): Rent a Car categories
  (CategoryGrid, shared with the Rent a Car page) or the TVDE band. The
  "Frota em destaque" grid is replaced by the categories.
- Search card with a fixed height: tab panels stacked in one grid cell
  (inactive one invisible + inert); the return-location field is always in
  the flow (invisible + inert while not used).
- No empty space (team request): the TVDE panel of the search card fills its
  extra height with "Como funciona"; the return-location field is always
  shown (disabled while "mesmo local" is ticked); card grids never end a row
  with empty space (fillSpans in lib/grid.ts for fixed lists, GridFiller with
  useful content for vehicle lists); qa:layout check 4 enforces it.
- Demo photos with readable plates are served as edited copies from
  public/demo/ (same Unsplash photo, 5:3, plates blurred). The Unsplash
  licence allows modified copies. Fiat Panda falls back to the illustration.

REASON:
Team feedback: the hero changed size when switching service; Rent a Car must
show its categories and let the customer choose cars or commercials; no
readable licence plates of private people on the site.

SCOPE:
src/components/shared/{hero-search,service-selection,grid-filler}.tsx, src/lib/grid.ts,
src/components/booking/booking-wizard.tsx, src/app/[region]/{contactos,tvde,
rent-a-car/[cidade]}/page.tsx, scripts/qa-layout.mjs,
src/components/rentacar/{search-form,category-grid}.tsx,
src/components/vehicles/{vehicle-results,vehicle-image,stock-photo}.tsx,
src/components/shared/hero-background.tsx, src/lib/{unsplash,region-imagery}.ts,
src/services/wegest/{mappers.ts,mock/data.ts}, src/domain/vehicle/index.ts,
src/app/[region]/{page,rent-a-car/page,rent-a-car/viaturas/page}.tsx,
public/demo/.

LEVEL:
Component system (Level 3).

DATE:
2026-10-08
```

---

```
OVERRIDE:
src/domain/pricing/index.ts rule "cauções e sinais vêm sempre da API (WeGest)"
and AGENTS.md "Prices, totals, deposits... come from the API".

DECISION:
The TVDE reservation fee (sinal) is a fixed business rule of DÉCADA OUSADA:
50 € per reservation, the same for every vehicle, paid to confirm the vehicle
reservation and deducted from the deposit (caução) at pickup. It lives in one
server-side constant, TVDE_RESERVATION_FEE (src/domain/pricing/index.ts); the
WeGest mapper sets every TVDE offer's reservationAmount from it. Copy that
mentions the amount reads the constant (formatMoney), never a typed "50 €".
Paying the fee still does not mean approval: the application is analysed.

REASON:
The WeGest API has no reservation fee (docs/wegest/analise-gaps.md, gap 9).
The team confirmed the rule on 2026-10-09.

SCOPE:
src/domain/pricing/index.ts, src/services/wegest/mappers.ts, mock data, TVDE
copy (tvde-process, hero-search, application-steps, application-checklist,
tvde-summary, pagamento page, FAQ).

LEVEL:
Project rule override (business rule).

DATE:
2026-10-09
```

---

```
DECISION:
The homepage introduces the company's two services instead of showing the
product (team feedback, João Bahia, 2026-10-09; homepages of Guerin, Bluwalk
and RAU drive checked: none shows the fleet there). Order: hero with search;
Rent a Car (who it is for, advantages, price from, photo, links to categories
and fleet: RacIntro); TVDE band (process and "O que precisa de saber");
pickup points. This supersedes the 2026-10-08 decision to show the Rent a Car
categories (or the TVDE vehicles) under the hero following the hero tab:
ServiceSelectionProvider / ForService are removed, and the categories stay on
the Rent a Car page with the same CategoryGrid. The Rent a Car photo leaves the
homepage hero slideshow so it does not appear twice.

REASON:
"A primeira página é para vender primeiro, não já mostrar o produto": the home
should introduce the company, why TVDE and why Rent a Car.

SCOPE:
src/app/[region]/page.tsx, src/components/rentacar/rac-intro.tsx,
src/components/shared/hero-search.tsx (service-selection.tsx removed).

LEVEL:
Page structure (Level 3).

DATE:
2026-10-09
```

---

```
DECISION:
Reviews on the homepage (team request, 2026-10-12). A band with the Google
rating of DASP RENT (same owner), named, was built and then removed at the
team's request. Not done, on purpose: copying DASP RENT Google reviews (picked
because they do not mention DASP RENT) into a panel on the DÉCADA OUSADA site
as if they were DÉCADA OUSADA reviews. Reviews on the site must come from
DÉCADA OUSADA customers (own Google profile, or testimonials collected with
consent), or be clearly attributed to DASP RENT.

REASON:
Presenting reviews without making sure they come from customers of the
service they describe is a prohibited commercial practice (Directive
2019/2161 "Omnibus", Decreto-Lei 109-G/2021). Same owner allows naming the
group company honestly; it does not make DASP RENT reviews DÉCADA OUSADA
reviews. AGENTS.md rule 4 (no fabricated content).

FOLLOW-UP (same day): the team supplied a panel of 17 testimonials and
confirmed they are DÉCADA OUSADA customers, taken from another panel (not
Google, no Google integration for now). Published in `Testimonials` without
any "Google" label and without relative dates.

PLACEMENT (same day): the panel sits after the TVDE band, not between Rent a
Car and TVDE. About half of the testimonials talk about TVDE (motorista,
convenção, mercado de TVDE); shown before the TVDE band they reached the
reader before the service they describe. After both services they back both,
and the light panel separates the dark TVDE band from the locations.
New motion token `--stagger-step` (70 ms) for the staggered entrance; it was
missing from the scale.

SPLIT BY SERVICE (same day, team request): the homepage panel shows only
customer (Rent a Car) testimonials; the TVDE ones will go elsewhere on the
site. Each testimonial carries `service`; TVDE = the three that talk
explicitly about drivers/TVDE (Patricia Silva, Samuel Guimarães, Daiane
Goulart), as the team confirmed.

PLACEMENT, FINAL (same day, team request): the panel goes back between the
Rent a Car section and the TVDE band, next to the service its testimonials
talk about. This replaces the "after the TVDE band" placement above.

SCOPE:
Homepage content (`Testimonials`).

LEVEL:
Content (Level 3).

DATE:
2026-10-12
```


---

```
DECISION:
Instagram on the homepage (team request): section "Siga-nos no Instagram"
with the latest 8 posts of @decada_ousada, and the profile link in the
footer. Posts come from the Instagram API with Instagram login
(graph.instagram.com/me/media), read on the server with
INSTAGRAM_ACCESS_TOKEN and cached with the `minutes` profile. No embed
script and no third-party widget. Images go through next/image, with the
Meta CDN hosts (*.cdninstagram.com, *.fbcdn.net) in remotePatterns.

REASON:
The official API is the only source that keeps the posts current without
scraping. Server-side keeps the token secret and adds no client script or
tracking from Meta. Without a token the section shows only the profile
button, never invented posts (AGENTS.md rule 4). No new dependency.

SCOPE:
Homepage, footer, next.config images, env (INSTAGRAM_ACCESS_TOKEN).

LEVEL:
Content and integration (Level 3).

DATE:
2026-10-12
```

---

```
DECISION:
WeGest real API wired in through the existing transport seam. The
http-transport converts api.wegest.pt v1 responses into the Wg* DTOs the mock
already produces, so mappers, pages and components stay unchanged. What the
API lacks (customer records, per-customer booking and application lists,
invoices, cancellation preview, TVDE documents) is kept per instance in the
transport or answered as "not available online". A new switch,
WEGEST_PEDIDOS_ONLINE (default off with the real API), gates the two write
paths: the booking and application routes answer 503 and the vehicle pages
show "Contactar a equipa" instead of "Reservar" / "Candidatar-me".
Catalogue GETs are shared for 5 minutes per process (the API allows it) and
429 honours Retry-After.

REASON:
The build against the real API hit the 120 requests/min limit and the
English provisional paths answered 404. Writes create real bookings and
applications in WeGest; with mock payments, an in-memory local store (lost
between serverless invocations) and no CAPTCHA (required by the API for
applications), turning them on would create unpaid or orphaned requests.
Reading the catalogue has none of these risks.

SCOPE:
src/services/wegest (client, http-transport, api-types, types, mappers,
index), booking and TVDE application API routes, vehicle pages,
lib/static-params, .env.example, docs/wegest.

LEVEL:
Integration (Level 2).

DATE:
2026-10-12
```

---

```
DECISION:
Driver recruitment page /motoristas, rebuilt from the team's standalone
landing (landing-motoristas.html) with the site's components and tokens
instead of publishing the HTML file. Applications go to the two forms hosted
on WeGest (Aluguer and Slot), opened in a new tab (WeGest sends
X-Frame-Options: DENY). The fleet section lists real TVDE models from the
WeGest catalogue. The landing's motion (parallax, tapes, magnetic buttons,
counters) was not carried over.

CONTENT CONFIRMED BY THE TEAM (2026-10-12): 500+ active drivers; Top 5% PME
2024 (2nd year); 1500 Maiores Empresas, Coimbra 2023; official Uber and Bolt
partner; drivers' phone/WhatsApp +351 912 023 234 and
motoristas.tvde@decadaousada.pt; call within 24 working hours; approval in
24 to 48 working hours; support 7 days a week; all-risks insurance on 100%
of vehicles; weekly payment; no minimum hours; Slot mode. Not confirmed and
left out: "a empresa TVDE que mais cresce em Portugal".

REASON:
Team request. The hosted WeGest forms work today, while the site's own
booking and application flows stay off (WEGEST_PEDIDOS_ONLINE).

SCOPE:
src/app/[region]/motoristas, src/domain/drivers, shared/cover-photo, header
nav, footer, sitemap.

LEVEL:
Content and page (Level 3).

DATE:
2026-10-12
```

---

```
DECISION:
Reconciling main with this branch (2026-10-12). The same day, main received
a static /motoristas landing (public/landing/motoristas.html, a proxy.ts
rewrite, GET /api/instagram and a second Instagram section), while this
branch rebuilt the landing as a native page and added its own Instagram
section. The native versions stay; the static landing, the rewrite, the API
route and the duplicate component are removed. A static landing would have
taken /motoristas away from the native page through the proxy.
The Instagram service now also accepts INSTAGRAM_FEED_URL (a JSON feed such
as Behold, which renews the Instagram access itself) when there is no
INSTAGRAM_ACCESS_TOKEN; the token keeps priority.

REASON:
Production had been deployed from this branch while main held the static
version: the two had to converge before the next deploy from main.

SCOPE:
src/services/instagram, docs/instagram.md, .env.example; removal of
public/landing/, src/app/api/instagram and src/components/shared/instagram-feed.tsx.

LEVEL:
Infrastructure (repository alignment).

DATE:
2026-10-12
```

---

```
DECISION:
/motoristas joins the original landing (landing-motoristas.html) with the
native page (team request, 2026-10-13). Taken from the original, rebuilt
with the site's components and tokens (src/components/drivers):
- Light hero with a photo collage (`DriversHero`): driver and passenger as
  the main photo, an EV charging and a regional photo tilted on top, the
  "Operador TVDE certificado" `SlantTag`, a "Pagamento da semana" note with
  a pulsing dot and a rotating "2 min" badge linking to #candidatura. The
  brand red of the title now sits on the light page (AA); on the old dark
  photo hero it failed contrast. Nothing covers a face.
- Photo strip (Continente only: its captions name Continente cities) and
  crossed tapes, both through `Marquee`: moves on its own, speeds up with
  scroll, reverses when scrolling up; paused and scrollable with reduced
  motion.
- Numbers count up when they come into view (`CountUp`); the server HTML and
  screen readers always get the final value.
Kept from the original look on purpose: tilts, overlap and motion. Not
kept: its large radii, fonts and colours (the site's tokens apply).
New tokens: --line-height-display-loose (1.05; at 0.95 the accent of
"À" touched the line above) and --duration-orbit (16 s) with the utilities
leading-display-loose and animate-orbit.

REASON:
The native page read flat next to the original, and its red title failed
contrast on the dark photo.

SCOPE:
src/app/[region]/motoristas/page.tsx, src/components/drivers/,
src/styles/tokens.css, src/styles/tailwind.css.

LEVEL:
Page design (Level 3) and two new tokens (Level 1 addition).

DATE:
2026-10-13
```

---

```
DECISION:
Production builds run in one process (next.config.ts, experimental.cpus: 1).
Each build process keeps its own catalogue cache and the Rent a Car listing
asks WeGest for the detail of every model (GET /modelos/{id}). With 50
models and 11 processes the build sent about 660 requests in seconds,
WeGest answered 429 LIMITE_EXCEDIDO (120 requests per minute per key) and
the Vercel build failed collecting /[region]/rent-a-car/viatura/[slug].
In one process the cache is shared: a real-API build makes about 70
requests and takes under 30 s (278 pages).

REASON:
The deploy of 0.12.0 failed on 2026-10-13, the first build after WeGest
published its Rent a Car fleet (the catalogue was empty before).

SCOPE:
next.config.ts.

LEVEL:
Infrastructure.

DATE:
2026-10-13
```

---

```
DECISION:
The two driver forms of /motoristas (Aluguer = TVDE GERAL, Slot = SLOT) live
on the site and create the same leads as WeGest's public forms (team
choice, 2026-10-13).
- Same fields as the WeGest forms (fetched from formulario_publico_por_id):
  name, email, phone/WhatsApp, plus "Tem licença TVDE?" and notes (Aluguer)
  or "Atualmente trabalha como TVDE?" and the vehicle (Slot).
- WeGest's public API has no leads endpoint (only full applications,
  POST /tvde/candidaturas, about 18 fields and no Slot). The server inserts
  the lead into `leads_dasprent` exactly as the WeGest public form does
  (same columns, `formulario_id`, campaign tag, answers in `observacoes`,
  plus an "Origem" line), with WeGest's public anon key
  (WEGEST_LEADS_URL / WEGEST_LEADS_KEY). Not the documented API: when WeGest
  adds a leads endpoint, only src/services/leads changes.
- Anti-spam: Cloudflare Turnstile when TURNSTILE_SECRET_KEY is set (the
  script is loaded from challenges.cloudflare.com, no npm dependency) and a
  honeypot field always. Personal data never goes to logs or analytics
  (`drivers_lead_submitted` carries only the mode).
- Without WEGEST_LEADS_URL and WEGEST_LEADS_KEY in http mode the page keeps
  the buttons to the WeGest-hosted forms (`HostedForms`), so it never shows
  a form that cannot send. If sending fails, the error offers the hosted
  form as an alternative.
- Aluguer without a TVDE licence cannot be sent (same rule as WeGest). Slot
  with "Não" can: the question is about current work, not the licence.

REASON:
Thiago's request: the two candidatura forms inside the site, not in a new
tab on wegest.pt.

SCOPE:
src/components/drivers/driver-lead-form.tsx, hosted-forms.tsx,
src/app/api/motoristas/lead, src/services/leads, src/services/captcha,
src/lib/validation.ts, src/lib/analytics.ts, src/domain/drivers,
src/app/[region]/motoristas/page.tsx, .env.example,
docs/motoristas-formularios.md.

LEVEL:
Feature (integration).

DATE:
2026-10-13
```

---

```
DECISION:
/motoristas shows the WeGest forms embedded (?embed=1) instead of the site's
own forms, as a test asked by the team (Thiago, 2026-10-13). One constant
switches between the two: DRIVER_FORM_KIND in src/domain/drivers ("embed"
now, "site" for DriverLeadForm, kept).
- `DriverFormEmbed`: same Aluguer/Slot switch (`ModeSwitch`, shared with
  DriverLeadForm), the iframe height follows postMessage
  { tipo: "wegest-formulario:altura", altura }, accepted only from
  https://www.wegest.pt and from that iframe.
- On 2026-10-13 WeGest still answers ?embed=1 with X-Frame-Options: DENY,
  so browsers do not show it. If no height message arrives 8 s after the
  form is on screen, the iframe gives way to a button that opens the form in
  a new tab. It starts working without a deploy once WeGest allows framing.

REASON:
Team test of WeGest's embed mode.

SCOPE:
src/components/drivers/driver-form-embed.tsx, mode-switch.tsx,
driver-lead-form.tsx, src/domain/drivers, /motoristas page,
docs/motoristas-formularios.md.

LEVEL:
Feature (integration).

DATE:
2026-10-13
```

---

```
DECISION:
Three more TVDE testimonials on /motoristas, from WhatsApp messages drivers
sent to the team (Antonio Dias, Felipe Frascione, Gabriela), published with
their full names because they authorised it (team confirmation,
2026-10-13). Excerpts kept word for word; parts naming other people or
companies (a former manager, another operator) were left out. These
messages carry no star rating, so `rating` became optional and the card
shows stars only when there is one: giving them five stars would invent a
rating.

REASON:
Team request: real driver feedback on the drivers page.

SCOPE:
src/components/shared/testimonials.tsx.

LEVEL:
Content (Level 3).

DATE:
2026-10-13
```

---

```
DECISION:
The application buttons of /motoristas open the WeGest form in a popup
(`DriverApplyDialog`) instead of scrolling to another section (Thiago,
2026-10-13). Any link with `data-candidatura="aluguer|slot"` opens it: the
hero cards, the Aluguer/Slot CTAs and the "2 min" badge. One document click
listener, so the buttons stay in server components; without JavaScript the
link still goes to the form section. Same dialog pattern as the vehicle
filters (role="dialog", aria-modal, overlay, useFocusTrap: Esc closes, focus
stays inside and returns to the button), page scroll locked while open.
Full height on phones. "Tenho carro" opens the Slot form the same way, for
consistency.

REASON:
Jumping between sections lost the visitor; the team wanted the form to open
where the click happens.

SCOPE:
src/components/drivers/driver-apply-dialog.tsx, driver-form-embed.tsx,
mode-switch.tsx, drivers-hero.tsx, /motoristas page,
docs/motoristas-formularios.md.

LEVEL:
Feature (interaction).

DATE:
2026-10-13
```

---

```
DECISION:
The application buttons of /motoristas open the WeGest form directly in a
new tab, without the popup (team request, 2026-10-13). While WeGest refuses
framing, the popup only added a step: a blank frame, then a button to open
the form. `DRIVER_FORM_OPEN` (src/domain/drivers) chooses: "tab" now,
"popup" brings back `DriverApplyDialog` once embedding works. The links
always point at the WeGest form (`applyLink`), so they also work without
JavaScript; in popup mode the dialog intercepts the click.

REASON:
One click to the form.

SCOPE:
src/components/drivers/apply-link.ts, drivers-hero.tsx, src/domain/drivers,
/motoristas page, docs/motoristas-formularios.md.

LEVEL:
Feature (interaction).

DATE:
2026-10-13
```

---

```
DECISION:
The application section of /motoristas ("Comece a faturar já") shows the
same two direct buttons as the hero instead of the embedded WeGest form
(team request, 2026-10-13): the embed stayed blank for a few seconds before
offering a button. `DRIVER_FORM_KIND` gains "links" (now the default); the
two cards live in one component (`ApplyChoice`) used by the hero and the
section. "embed" and "site" stay available.

REASON:
One click to the form, everywhere on the page.

SCOPE:
src/components/drivers/apply-choice.tsx, hosted-forms.tsx, drivers-hero.tsx,
src/domain/drivers, /motoristas page, docs/motoristas-formularios.md.

LEVEL:
Feature (interaction).

DATE:
2026-10-13
```

---

```
DECISION:
The application buttons of /motoristas open the WeGest form in a popup on
the same page again (team request with a flow diagram, 2026-10-13), now that
WeGest allows framing (?embed=1 answers frame-ancestors * and no
X-Frame-Options). DRIVER_FORM_OPEN = "popup". The popup shows the chosen
form straight away (title "Preciso de carro" / "Tenho carro", no switch
inside), loaded eagerly. The embed URL carries `&origem=site`: browsers that
had cached WeGest's old answer kept X-Frame-Options: DENY, because WeGest
revalidates with 304 and a 304 cannot remove a cached header; a new URL
forces a fresh request. Verified in a real headless Chrome (the app's
browser pane does not paint cross-origin iframes): both buttons open the
popup, WeGest sends its height (605 px), no fallback.

REASON:
Keep the visitor on the landing page while applying.

SCOPE:
src/components/drivers/driver-form-embed.tsx, driver-apply-dialog.tsx,
src/domain/drivers, docs/motoristas-formularios.md.

LEVEL:
Feature (interaction).

DATE:
2026-10-13
```

---

```
DECISION:
In the popup the WeGest embed URL gets a new `v` value on every opening.
`&origem=site` alone did not hold: a browser that had cached a blocking
answer for that exact URL (X-Frame-Options or frame-ancestors) kept showing
ERR_BLOCKED_BY_RESPONSE, because WeGest revalidates with 304 and a 304
cannot remove a cached header. A URL that never repeats is never served
from such a cache entry. WeGest's page is max-age=0, so nothing is lost.
Verified in a real headless Chrome: both buttons open the popup and WeGest
sends its height.

REASON:
The team saw "www.wegest.pt está bloqueado" in the popup while a clean
browser loaded the form.

SCOPE:
src/components/drivers/driver-form-embed.tsx, docs/motoristas-formularios.md.

LEVEL:
Fix (integration).

DATE:
2026-10-13
```


---

```
DECISION:
Contacts confirmed by the team (2026-10-14): phone and WhatsApp
+351 910 102 454 replace +351 912 023 234 on /motoristas, and become the
site's general phone in both regions, with the email
motoristas.tvde@decadaousada.pt. The address is still to be provided.

REASON:
Team request (message with the new number).

SCOPE:
src/domain/drivers (DRIVER_CONTACT), src/domain/region (REGION_CONFIG.contact).

LEVEL:
Content (Level 3).

DATE:
2026-10-14
```

---

```
DECISION:
/entrar offers two logins (Thiago, 2026-10-14): "Rent a Car" keeps the
site's own account form; "Motorista TVDE" sends the driver to the WeGest
driver panel (DRIVER_AREA_URL, www.wegest.pt/motorista/login). The driver
account lives in WeGest and its login page refuses framing
(X-Frame-Options: DENY) and only accepts its own form posts, so the site
links to it in the same tab instead of collecting the password itself. The
switch is two links (?tipo=motorista) rendered on the server. Coming from
"Candidatar-me" (next=/tvde/candidatura) the page is unchanged: that flow
uses the site account.

REASON:
Team request: logging in as a TVDE driver must lead to the WeGest driver
panel.

SCOPE:
src/app/[region]/entrar/page.tsx, src/components/account/login-type-switch.tsx,
src/domain/drivers (DRIVER_AREA_URL now on www, skipping a redirect).

LEVEL:
Feature (navigation).

DATE:
2026-10-14
```

---

```
DECISION:
Meta Pixel (Thiago, 2026-10-14) behind a cookie consent banner. The pixel id
comes from NEXT_PUBLIC_META_PIXEL_ID (public by nature: it is visible in any
page that runs a pixel); without it there is no pixel, no banner and no
"Cookies" link, because the site has no other optional cookies.
- fbevents.js is injected by hand only after "Aceitar tudo" or marketing on
  in the preferences (no next/script, no npm package). Revoking calls
  fbq("consent", "revoke") and deletes _fbp/_fbc.
- autoConfig is off: no automatic button/form events, no automatic advanced
  matching. The pixel only receives PageView (also on client navigation) and
  the funnel events from src/lib/analytics.ts mapped in src/lib/meta-pixel.ts
  (Search, ViewContent, InitiateCheckout, AddPaymentInfo, Purchase with the
  API total, SubmitApplication, Lead, plus two custom events). TVDE payments
  and application decisions are not sent.
- New analytics event drivers_apply_opened: the /motoristas application is
  submitted inside the WeGest iframe, which the site cannot see, so opening
  the popup is the closest signal (custom event, not Lead).
- Consent lives in localStorage (do:consent, versioned). Banner order and the
  native <dialog> follow docs/qa.md "Cookie consent".
- /privacidade lists what the code stores; the legal text (controller, NIF,
  purposes, retention, contact) is <Pending> until the client provides it.

REASON:
Marketing request to measure the Facebook/Instagram campaigns. Marketing
cookies need prior consent (GDPR, Lei n.º 41/2004), and the site had no
consent mechanism. No dependency added.

SCOPE:
src/lib/consent.ts, src/lib/meta-pixel.ts, src/lib/analytics.ts,
src/components/shared/cookie-consent.tsx, src/components/layout/site-footer.tsx,
src/components/drivers/driver-apply-dialog.tsx, src/app/[region]/layout.tsx,
src/app/[region]/privacidade, src/app/sitemap.ts, .env.example.

LEVEL:
Feature (integration).

DATE:
2026-10-14
```

---

```
DECISION:
Cookie banner review (PROMPT-MASTER-REVISAO-COOKIES-E-ENTRAR.md, report in
docs/design/revisao-cookies-entrar.md):
- The banner publishes its height as the runtime CSS variable
  --consent-banner-h on <html> (ResizeObserver, removed when it closes).
  globals.css uses it for scroll-padding-bottom, the body bottom padding and
  the `bottom` of [data-action-bar]. It is not a design token: it is a
  measured value, like the browser's own sizes. The checkout bar lost its
  `bottom-0` class so the base rule can place it.
- CookieConsent is mounted right after the skip link (first in reading and
  focus order); its position on screen is fixed, so nothing moves.
- docs/qa.md "Manage preferences full-width below" becomes a text link next
  to "Política de cookies", under the two buttons, to keep the banner under
  200 px at 375. The two choices keep equal size and weight.
- /privacidade on mobile uses inline "label: value" lines instead of
  grid-label-value: the 10.5rem label column would leave about half of a
  375 px screen for the value.

REASON:
Measured in phase 1: the banner covered the mobile checkout bar, 30 of 59
focusable elements at 375 px could be focused under it, its buttons were
36 px high, and it was the last thing in the focus order.

SCOPE:
src/components/shared/cookie-consent.tsx, src/app/globals.css,
src/app/[region]/layout.tsx, src/components/booking/booking-wizard.tsx (one
class), src/components/layout/site-footer.tsx,
src/app/[region]/privacidade/page.tsx, src/app/[region]/entrar/page.tsx,
scripts/qa-layout.mjs, docs/qa.md, docs/design-system.md.

LEVEL:
Override (component contract, docs/qa.md).

DATE:
2026-10-14
```

---

```
DECISION:
Meta Pixel loads on the first visit, with the cookie banner still open
(Thiago, 2026-10-14). Replaces "only after Aceitar" in the previous Meta
Pixel entry; the banner and the preferences dialog stay.
- The pixel is on unless the visitor chose "Só necessários" or turned
  marketing off in the preferences. That choice still revokes the pixel
  and deletes _fbp/_fbc. The preferences checkbox shows marketing on until
  the visitor picks.
- Banner and /privacidade copy say the marketing cookies are on until the
  visitor refuses them.
- The pixel id ships in a versioned .env.production
  (NEXT_PUBLIC_META_PIXEL_ID=1212569624343076, the id already used on the
  live decadaousada.pt). It is public by nature; a Vercel variable with the
  same name overrides it.

REASON:
Explicit request from the site owner: the pixel must work while the banner
is visible. Known risk, stated to the requester: GDPR and Lei n.º 41/2004
require prior consent for marketing cookies such as _fbp.

SCOPE:
src/components/shared/cookie-consent.tsx, src/lib/consent.ts,
src/lib/meta-pixel.ts, src/lib/analytics.ts, src/app/[region]/privacidade,
.env.production, .gitignore, .env.example, docs/qa.md,
docs/deploy-vercel.md.

LEVEL:
Override (previous Meta Pixel decision).

DATE:
2026-10-14
```

---

```
DECISION:
This repo deploys to the existing Vercel project decadaousada-landing, which
serves www.decadaousada.pt and replaces the old Vite landing (Thiago,
2026-10-14). vercel.json sets framework "nextjs" and outputDirectory ".next",
because that project was created with the Vite preset (output "dist").

REASON:
The site owner chose to replace the landing in the same Vercel project
instead of creating a new one. Builds were failing with "No Output Directory
named dist".

SCOPE:
vercel.json.

LEVEL:
Infrastructure.

Driver accounts are WeGest accounts (WeGest guide "Contas de motorista no
site da Década", 2026-10-14). Dependency added: @supabase/supabase-js.
- Sign up, login, resend confirmation, password recovery and the new
  password run in the browser, directly against WeGest's Supabase Auth with
  the publishable key (NEXT_PUBLIC_WEGEST_AUTH_URL / _KEY / _ORG_ID, public
  values). The site never creates accounts on the server.
- After login the browser sends the access token to /api/driver-session;
  the server checks it at WeGest (/auth/v1/user, publishable key only) and
  opens the site session. The signed cookie keeps the account id and email,
  so the session survives the in-memory local store. The token is never
  stored or logged.
- The TVDE application requires a driver session. The browser sends the
  current token; /api/tvde/applications checks it again and forwards it as
  X-Motorista-Token with the wg_ra_ key. The email is the account email,
  read-only in the form. SESSAO_INVALIDA: refresh and retry once, then ask
  to log in again. CONTA_INVALIDA and CANDIDATURA_EXISTENTE get their own
  messages.
- Rent a Car keeps the site's own accounts (team decision, 2026-10-14). The
  driver's account page is /entrar?tipo=motorista (signed-in panel with the
  WeGest driver panel link); /tvde/minha-conta is no longer the driver's
  entry point from the header.
- Without the three variables everything falls back to the previous
  behaviour (own accounts, external driver panel link).

REASON:
WeGest owns driver accounts: the same login works on the site, the WeGest
portal and the app, and the application is linked to the account. The guide
requires supabase-js in the browser (session storage, token refresh, email
link handling); writing that by hand would duplicate the library.

SCOPE:
package.json, .env.example, src/lib/driver-account.ts,
src/lib/driver-auth-client.ts, src/services/auth/driver.ts,
src/services/auth/index.ts, src/services/store/index.ts,
src/app/api/driver-session/route.ts, src/app/api/tvde/applications/route.ts,
src/components/account/driver-auth-forms.tsx,
src/components/account/auth-forms.tsx (export PasswordInput),
src/components/account/account-nav.tsx, src/components/layout/site-header.tsx,
src/components/tvde/application-steps.tsx, src/components/tvde/dynamic-form.tsx,
src/app/[region]/entrar, registar, recuperar-password, nova-password,
tvde/candidatura/page.tsx, src/services/wegest (client, transport,
http-transport, index).

LEVEL:
Dependency + project rule (driver accounts live in WeGest).

DATE:
2026-10-14
```

---

```
DECISION:
The TVDE search asks only for the pickup location (team decision,
2026-10-15). It leads to /tvde/viaturas?local=; the date and time are picked
on the vehicle page, in PickupSelector, which checks availability. Each TVDE
card lists where the vehicle can be picked up. The utility
`grid-tvde-search` is removed. Old links with ?inicio= still preselect the
date on the vehicle page.

REASON:
A driver browses the fleet before choosing a start date. The location stays
first so the list only shows vehicles that can be picked up there.

SCOPE:
src/components/tvde/tvde-search-form.tsx, src/app/[region]/tvde/viaturas/page.tsx,
src/components/vehicles/vehicle-card.tsx (TVDE card),
src/app/[region]/tvde/viatura/[slug]/page.tsx (comment),
src/styles/tailwind.css, docs/design-system.md.

LEVEL:
Project rule (TVDE flow).

DATE:
2026-10-15
```

---

```
DECISION:
The Rent a Car flow starts with the search, never with the vehicle (team
decision, 2026-10-15). The home page and /rent-a-car open with the search
form (pickup and return location, date and time; pickup from today to
today + 15 days, at most 30 days). /rent-a-car/viaturas only lists what
GET /disponibilidade returns for those dates, with quantidade_disponivel on
each card ("3 viaturas disponíveis", "Última viatura disponível") and the
total from the quote. Without dates it shows only the form. With no results
it says "Sem viaturas para estas datas." and offers up to three other dates
with the same duration that the API confirmed have vehicles. A 400
PERIODO_INVALIDO (or another validation error) is shown inside the form,
never as an error page. The catalogue (GET /modelos) lives only on the new
/rent-a-car/frota page: each model shows "Disponível a partir de
{disponivel_desde}" and opens the search with that date. The category grid
on /rent-a-car is removed (component deleted). The mock now returns only
free models, like the API, and leaves some days fully booked per location.

REASON:
With the search first the customer never sees a car they cannot rent. The
live API already returns disponivel_desde in /modelos (always filled there,
because /modelos only lists models with a free day in the next 15 days).

SCOPE:
src/app/[region]/rent-a-car/page.tsx, rent-a-car/viaturas/page.tsx,
rent-a-car/frota/page.tsx (new), rent-a-car/viatura/[slug]/page.tsx
(breadcrumb), rent-a-car/reserva/page.tsx (link label),
src/app/[region]/not-found.tsx, src/app/sitemap.ts,
src/components/rentacar/search-form.tsx, rac-intro.tsx (link),
category-grid.tsx (deleted), src/components/layout/site-footer.tsx (link),
src/components/vehicles/vehicle-card.tsx, vehicle-results.tsx,
src/domain/availability, src/domain/booking (limits), src/domain/vehicle,
src/lib/attempt.ts, src/services/wegest (api-types, types, transport,
http-transport, mappers, client, index, mock/transport).

LEVEL:
Project rule (Rent a Car flow).

DATE:
2026-10-15
```

---

```
DECISION:
Driver registration does not depend on a vehicle (team decision,
2026-10-16). The flow is Entrar > Motorista TVDE > Criar conta >
registration form > sent. /tvde/candidatura without viatura, inicio and
local shows only the form, with the steps Conta, Cadastro, Enviado, and
sends POST /tvde/candidaturas without modelo_pretendido_id and
data_inicio_pretendida (optional in the API). The confirmation has no
vehicle, pickup or payment, and points to the WeGest driver portal for the
documents (the API takes no files). Choosing a vehicle first still works:
the same page with the three parameters keeps documents and deposit.
The form follows the WeGest document "Cadastro de motorista TVDE no
WeGest" (16/10/2026): international phone, Portuguese NIF check digit,
IBAN mod 97, expiry dates after today, TVDE licence required unless "em
formação". Licence categories: the driver confirms category B in one box
and the API gets ["B"]; the other categories are not asked (only B matters
for TVDE). It is split into three parts (Sobre
si, Identificação e carta, IBAN e envio), each validated before
"Continuar". The form is "cadastro"; what is sent and followed is the
"candidatura".

REASON:
A new driver signs up before knowing which vehicle they will get; asking
for a vehicle first stopped the registration. The long single form was
tiring on mobile; the parts keep each screen short and the WeGest rules
catch errors before the API does.

SCOPE:
src/app/[region]/registar/page.tsx, entrar/page.tsx,
tvde/candidatura/page.tsx, tvde/candidatura/confirmacao/page.tsx,
src/app/api/tvde/applications/route.ts,
src/components/account/login-type-switch.tsx,
src/components/tvde/application-layout.tsx, application-steps.tsx,
application-status.tsx, dynamic-form.tsx, src/domain/application,
src/lib/dynamic-form.ts, src/services/wegest (types, transport, mappers,
http-transport, index, mock/transport).

LEVEL:
Project rule (TVDE registration flow).

DATE:
2026-10-16
```

---

```
DECISION:
No online charging for now (team decision, 2026-10-16). With the real API,
the site charges only when a real payment provider is configured
(PAYMENT_PROVIDER other than "mock"); demo mode keeps the test provider.
Without it, Rent a Car requests go to WeGest as pending bookings with no
payment ("Confirmar" step, "Pedir reserva"), and TVDE has no deposit step:
after the registration form, straight to the confirmation. One TVDE
application per account (WeGest returns 409 on a second one); the site says
so and points to the team.

REASON:
A payment provider is not chosen yet, and the only gateway in the code is
the test one, which would show payments as made without charging anything.

SCOPE:
src/services/payments (onlinePaymentsEnabled), src/app/api/rentacar/bookings,
src/app/api/tvde/applications, src/components/booking/booking-wizard.tsx,
src/app/[region]/rent-a-car/reserva, src/app/[region]/tvde/**,
src/components/tvde/*, src/components/vehicles/vehicle-card.tsx.

LEVEL:
Project rule (payments and online requests).

DATE:
2026-10-16
```
