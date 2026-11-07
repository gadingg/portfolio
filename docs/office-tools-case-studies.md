# Office tools case studies

7 November 2026. Added PATOS Scan Parking, Ular Tangga Patosser, and Spin Wheel & Team Draw to the existing portfolio CMS. User subsequently requested skipping HyperFrames; all three explicitly disable motion and contain no video reference.

## Scope and content

- Short routes: `/work/parking`, `/work/ulartangga`, `/work/spin`.
- English headings, casual-professional Indonesian explanations, overview cards, five narrative sections, one replaceable detail image and a static cover per project.
- Standard content blocks reuse the existing public renderer and admin editor. No custom layout ownership, page styling or navigation implementation was added.
- Scan Parking describes the owner-confirmed paper-recap bottleneck, scan-to-database workflow, per-employee recap, reimbursement amounts and printable PDF. No fixed reimbursement policy or measured savings are invented.
- Ular Tangga is presented as a companion for recording a physical office game, not a new digital game board. Live UI and local source confirm participant lists, rewards, periods, recap, copy, print and lock controls.
- Spin covers attendance, four-team allocation and doorprize. The owner-supplied direct Apps Script URL was verified after the original wrapper returned Google 401; the case uses the verified direct URL for Open app.

## Visual provenance

All six WebP mockups are 1920 × 1440. Covers weigh approximately 60, 94 and 115 KB. Source screenshots preserve their proportions and use isolated illustrative data, not real employee reimbursements or event results.

`scripts/event-study-preview.cjs` serves existing local app source with fixture-only adapters, bound to 127.0.0.1:3031. Parking uses the local compiled app UI, which predates the live reimbursement summary. Its image supports scan/archive/PDF flows; the reimbursement feature description comes from the owner and the inspected live dashboard. Parking ticket images are visibly illustrative and are not proof of an actual transaction. Ular Tangga and Spin use the original HTML renderer with illustrative in-memory participants. No live record was changed, no award was saved, no attendance was submitted and no spin was executed against production.

The image builder only generates dedicated mockup assets. It does not edit source applications. Source captures are retained under `motion/source-studies/` for consistency with the existing asset organization; no motion asset is published. Preliminary animation projects were moved to the ignored review archive after the user's scope correction.

## CMS safety

`scripts/add-office-tools.cjs` defaults to preview. Apply uses a backup and revision-checked write. It inserts after existing web apps, rejects duplicate IDs/slugs, preserves every unrelated draft and published record and retains legacy/manual homepage selections. The six images use hash-named immutable objects in the existing public Supabase bucket.

Applied CMS revision: **66**. Readback matched both intended snapshots. Existing records and homepage selections passed deep-equality guards. This is a content write, not a Git deployment.

## Validation

- TypeScript check passed.
- Twelve focused tests passed across office tools, prior practical tools, case navigation and admin image editing.
- Explicit tests cover disabled motion, no video references, short unique routes, editable image blocks, illustration disclosure, duplicate rejection and unchanged homepage/order semantics.
- All three covers were visually reviewed at full composition size. Page-level QA is recorded below after the final browser pass.

### Final browser pass

- Production routes for all three projects rendered the correct titles and story content. Their DOMs contained zero video elements.
- Desktop Parking and Ular Tangga at 1280 px, and mobile Parking and Spin at 390 px had no page-level horizontal overflow. Loaded cover/detail images returned nonzero natural widths.
- The Parking Next Case Study card was clicked and navigated to Ular Tangga. Ular Tangga links to Spin, and Spin links back to Listing Hub.
- Authenticated local admin on localhost:3020 showed Parking as published. Its cover replacement, ordered content blocks, detail-image replacement, alt-text and caption fields were present. No edit or destructive action was submitted during QA.
- Evidence in ignored `.impeccable/review/`: `ulartangga-public.jpg`, `spin-public-mobile.jpg`, `office-admin.jpg`. The initial public 404 cleared after the existing published-content cache refreshed.

## Antislop delivery gate

Scope is the three new case records and images, not a new audit of unrelated screens. Design read: inherit dark editorial Manrope portfolio, orange functional accents, existing overview cards and image-first case structure. Dials: ENERGY 1 / RHYTHM 2 / MOTION 0 for these additions.

| Check | Result and evidence |
| --- | --- |
| Hard gate: R-02, R-17, R-18, R-23, R-36, R-38 | PASS: tests reject em/en dashes; no fabricated testimonials or performance figures; data illustrations are disclosed in alt text and captions. Features come from the owner's description and inspected UI/source. |
| Hard gate: R-03, R-24 to R-28, R-32, R-34, R-35 | PASS: existing responsive renderer, contrast tokens, semantic links, focus treatment, skeleton and not-found states are reused; navigation/editor regression tests pass. No theme toggle, FAQ, custom interaction or new form introduced. Browser evidence is recorded in the final QA note. |
| Hard gate: R-33, R-37 | PASS: source modules authored directly; mockup builder generates isolated assets only. Established direction and explicit dials retained. |
| Purpose gate | PASS: no new decorative page effects, icons, gradients, badges or animations. Light screenshot backgrounds separate the app UI from the dark page; frames communicate device context. Existing Next Case Study arrow remains a navigation cue. |
| Liveliness | PASS: app UI is the focal point; overview, image and narrative alternate; orange remains the page accent, editorial headings provide the recurring identity. |
| C-1 to C-5 | PASS: content addresses the specific administrative/game workflow; no dead new controls or claims; standard editor keeps content replaceable. |
| R-05, R-11, R-15, R-16, R-20, R-21, R-29 to R-31 | PASS: no site-template, palette, type, button or theme redesign. Titles and app captures are project-specific; existing action labels and styling remain. |

No Git commit or push is included in this request.
