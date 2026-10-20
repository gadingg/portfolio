# Listing Hub mobile showcase QA

- Captured both real apps at mobile width, without editing listing data. Generated the two-phone forest-green mockup with built-in imagegen from those captures and supplied visual references. Saved WebP cover, 1448 x 1086, 140564 bytes.
- Targeted Works CMS update backed up locally in ignored `.cms-backups`, validated draft/public schemas, used optimistic revision checking and read back both states. Final saved revision 25. Unrelated items preserved independently in draft and published versions. Existing visibility, aliases, ID and case slug retained.
- Both CMS destinations are editable native link blocks, pointing to `/all` and `/gading`. Cover/description/summary/blocks share the existing Works CMS source. No permanent presentation override or database schema change.
- Production build passed with lint/type/page generation. Existing work-update tests: 2 passed. Isolated assertions passed for unrelated item identity, visibility preservation, idempotence, two app links, no em/en dashes and refusing to overwrite a custom visual layout.
- Production server localhost:3002 rendered new copy and cover. Desktop viewport 1280 and mobile viewport 390 checked. Case cover 4:3, object-fit contain; mobile had no horizontal overflow. Homepage card confirmed current Supabase cover URL and updated description. Case page confirmed both link labels and destinations.
- Admin route redirects to login in this browser session. Authenticated admin UI was not exercised; integration was verified through the same stored CMS document and readback consumed by the existing Works manager. No credentials or authentication changes.
- Screenshots in ignored `.impeccable/review/listing-dual-app`: `case-desktop.png`, `case-mobile.png`, `works-mobile.png`. Original screenshots `all-mobile.png`, `personal-mobile.png`; one detector pass `detect.json`.

Code changes remain local until a subsequent Git/deployment action. CMS content and media were updated in the shared Supabase project under the owner's current content-update request. No claim of a newly deployed Vercel build.

Independent Impeccable finish review: `disposition: ship`, no material fixes. Initial desktop/mobile captures were replaced after the rendering settled; final saved captures were opened and validated before the successful review.
