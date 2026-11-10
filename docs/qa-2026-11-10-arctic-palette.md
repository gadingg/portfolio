# Arctic Sprint public palette

Default: #5AB2F7 to #12CFF3, 110 degrees, charcoal button text. Nine colors plus gradient angle are editable under Admin > Konten Website & CV > Color Palette. Preview updates locally before the existing save/publish action. Reset restores Arctic Sprint. Site JSON persists the optional palette; legacy documents resolve safe defaults without a migration. Invalid HEX values and out-of-range angles are rejected server-side. CSS generation only uses parsed values. The public homepage and case/archive footer emit the same scoped tokens; settings never theme the CMS operating shell.

Coverage: primary buttons, public text accents, focus states, What I Do animation colors, SVG process pipeline and social preview accent. Artwork and embedded app interfaces remain original.

Validation: 33 focused tests passed, including legacy content, injection validation, customized homepage CSS, publication review, and mocked site API save versus publish. TypeScript passed. Authenticated local admin UI: edited gradient HEX changed preview; reset returned to default and save became disabled. Mobile 390 and desktop 1280 editor checked without page overflow; homepage and listinghub share the published theme tokens. Default sampled button contrast 8.41:1. No production CMS writes were made during QA; provider persistence was exercised with API fixtures, not a live publication.

Antislop after gate: PASS for scope. Retained dark editorial identity, ENERGY 1 / RHYTHM 2 / MOTION 1. User explicitly approved gradient emphasis. No libraries, new animation or decorative sections added. New controls have labels, keyboard access, preview and reset. Existing dirty-state and revision protection retained.
