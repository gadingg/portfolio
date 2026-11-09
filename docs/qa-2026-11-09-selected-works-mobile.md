# Selected Works mobile refinement

9 November 2026. Homepage-only layout refinement; no CMS records or publication state changed.

## Result

- One Selected Works preview grid replaces the three separately headed/carousel groups. No homepage search, repeated category headings, project-count helpers or per-category View all boxes.
- Compact, single-row category pills scroll inside their own width on phones. Touch targets remain at least 44 px. Selected state uses `aria-pressed`; keyboard focus remains visible inside the scroll container.
- All shows the existing three manually selected web apps, then alternating design/video entries, capped at six. Category filters show at most six. Full collections and their search remain available. A single bottom View all works link appears only when matching content exceeds the preview.
- Existing `#web-apps`, `#visuals` and `#videos` links select their corresponding pill. Designs retain the lightbox; videos retain the popup or original Instagram destination. Mixed previews exclude non-design cards from image navigation.
- Root widths and horizontal clipping contain the page. Grid/flex descendants have zero minimum widths; cards and thumbnails cannot exceed their columns. Static media frames reserve space before images load and preserve design-art proportions.
- The root uses horizontal `hidden`; body/main wrapper use `clip` so the containment does not create a new scroll container that breaks the sticky header. The final production-server check kept the header top at zero across all tested filter states.
- Results have a 400 px minimum height and disabled scroll anchoring. Filter changes restore the section beneath the header synchronously and on the next animation frame, cancel pending restoration, and use a 200 ms opacity transition unless reduced motion is requested.
- Existing stored homepage layouts normalize to the same structure at render time; repeated normalization is idempotent. Source project order, imagery, copy and manual homepage selections remain unchanged.

## Validation

- TypeScript, JavaScript syntax, production build and 64 focused regression tests passed. Existing carousel tests remain for any retained non-homepage usage. Legacy homepage assertions now expect the requested unified preview.
- Browser checks at 320, 390, 768 and 1280 px: document width never exceeded viewport width, scrollX stayed zero, no card extended past the viewport, pills remained one row and preview count never exceeded six.
- Twelve measured filter changes across 320/768/1280 px kept the same section top for all four categories within each viewport: 76.56, 76.42 and 92.42 px respectively. At 390 px the section top stayed 76.83 px.
- Design lightbox opened with only the two design entries; Escape closed it and restored focus. Video popup opened. Enter activated All. Mobile menu Branding & Video selected that category and closed the menu. No browser console errors were recorded.
- View all works navigated to `/works`. Its retained search for Meta returned the correct project. The collection had no horizontal overflow.
- Evidence: ignored `.impeccable/review/selected-works-measurements.json`, `selected-works-mobile.jpg`, `selected-works-desktop.jpg`, `selected-works-tests.txt` and `selected-works-build.txt`.
- Final confirmation on the production server repeated twelve filter changes at 320/768/1280 px with the same stable section positions, zero overflow, scrollX zero and sticky header top zero. Measurements are in `selected-works-final-checks.json`.
- Responsive checks use Chromium emulation, not a physical iOS device. Video popup opening was verified; video playback quality was outside this layout fix.

## Antislop delivery gate

Design read: preserve Manrope, near-black canvas, warm-white copy and orange actions. Content-first grid, compact functional pills, no new decorative effects. ENERGY 1 / RHYTHM 2 / MOTION 1. The owner's explicit pill requirement governs their rounded shape.

| Gate | Result and evidence |
| --- | --- |
| R-02 | PASS: new visible CTA/status copy has no em or en dashes. |
| R-03 | PASS: four responsive viewport checks and twelve filter measurements show no page or card overflow. |
| R-17, R-18, R-23, R-36, R-38 | PASS: existing project data and images retained; no fabricated people, results or claims added. |
| R-24, R-26 | PASS: category filters, preserved navigation hashes, lightbox, popup and archive link exercised. |
| R-25, R-32 | PASS: established contrast tokens retained; semantic buttons, visible keyboard focus, pressed state, live result announcement, Enter and Escape behavior checked. |
| R-27, R-28, R-34 | PASS: existing loading/recovery and empty states retained; no FAQ or theme change introduced. |
| R-33 | PASS: application source edited directly; no external source-patching generator used. |
| R-35, R-37 | PASS: established visual direction reused; production build, 64 tests and recorded browser QA passed. |
| Purpose gate | PASS: no new typography, glass, shadows, grids as decoration, generic icons or badges. Arrow indicates archive navigation; 200 ms opacity change confirms filter replacement without moving cards. |
| Liveliness | PASS: project imagery leads; spacing separates filters, works and archive action; orange communicates selection. Explicit dials and design read recorded above. |
| C-1 to C-5 | PASS: each change addresses requested cognitive load, overflow or scroll behavior; interactions and responsive evidence recorded, without changing product claims. |
| R-05, R-11, R-15, R-16, R-20, R-21, R-29 to R-31 | PASS: existing editorial identity, card styles, assets and palette retained; pills are requested filter controls, not a site-wide shape system; no new marketing language. |

Changes are local; commit, push and production deployment are not part of this request.
