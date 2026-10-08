


---

```
DECISION:
Demo vehicle photos (requested 2026-10-08). The mock data now carries one
free stock photo per model from Unsplash (Unsplash License: free commercial
use, no attribution required), checked one by one to be the advertised model.
20 of 22 vehicles; Renault Trafic and Renault Kangoo have no free photo of the
exact model and keep the illustration. Photos are hotlinked to the Unsplash
CDN (no files in the repository); `VehicleImage` asks the CDN for the width
the browser needs (up to 3840 px) instead of the original. Stock photos are
flagged `illustrative` and show "Imagem ilustrativa", because they show the
model, not the fleet vehicle. This refines the 2026-10-07 decision: still no
invented multi-angle galleries, one photo per model.

REASON:
Request to fill the image placeholders with free 4K stock photos; exact
model chosen over "similar category" so the customer never sees a car that
is not the advertised one.

SCOPE:
src/services/wegest/mock/data.ts (demo data only), src/services/wegest/mappers.ts,
src/domain/vehicle, src/components/vehicles/vehicle-image.tsx and
vehicle-gallery.tsx. Production photos still come from WeGest.

LEVEL:
Content (demo data) and component.

DATE:
2026-10-08
```
