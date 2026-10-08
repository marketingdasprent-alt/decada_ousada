


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

