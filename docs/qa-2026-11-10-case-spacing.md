# Case and Portfolio spacing

Standard cases and saved CMS layouts now present Back, intro, cover, overview, motion and narrative in that order. Normalization preserves original story, cover, links and custom CSS, and is idempotent. Both app destinations use the existing inline link treatment. Back touch targets remain 44px.

Archive categories use one horizontally scrolling pill row. Search remains available with an accessible hidden label; the live result count sits beside the title. Desktop places search beside the filters. There is one live status region, updated for category and text search.

Local browser evidence: Listing Hub at 390px: Back top 81px (20px below header), title 137px, thumbnail 412px instead of 1175px. Portfolio: same Back/title positions; first card 341px instead of 519px. Search Meta returned one project and count 1 project. At 320px all pills share one row and the document has no horizontal overflow. Req Video at 1280px retains the shared intro column, 24px header-to-Back spacing, equal links and thumbnail before overview; no overflow. Legacy CMS cover wrapping and repeated normalization are regression-tested. Physical touch devices were not tested.

Antislop after gate: PASS for scoped layout refinement. Existing dark/Arctic Sprint identity and type scale retained. ENERGY 1 / RHYTHM 2 / MOTION 1. No new card design, decoration, copy, libraries or animations. Project content and navigation destinations preserved.

Validation completed: 28 focused tests passed; production build including TypeScript passed. No production data was changed or deployed.
