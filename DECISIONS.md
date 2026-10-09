


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
