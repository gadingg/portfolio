# Visual editor verification — 2026-10-16

## Delivered

GrapesJS visual editing for homepage and case studies. The canvas uses existing public styles and content. Double-click text edits copy directly; images use the shared private upload/library. Section, two/three-column, heading, text, image, button, and spacing blocks can be inserted. The builder exposes structure, flex/grid styles, spacing, typography, colors, duplicate/delete, move controls, undo/redo, device previews, and preview mode. Mobile uses a dismissible panel overlay so the canvas retains its width.

Access through the admin **Editor visual** menu, **Buka editor visual** in Website, or the same action inside a case study. Existing pages remain on the original renderer until a visual layout is published. Layout is stored inside existing JSON documents; no SQL migration was applied for this round.

## Verification evidence

- Production build passed with Next.js 15.5.28, including TypeScript validation.
- Eleven existing tests and six visual-editor tests passed. New tests cover sanitizer removal of executable HTML/CSS, preserved menu/carousel hooks, revision conflicts, selected-case publication isolation, homepage value synchronization, and media references inside HTML/CSS.
- Real authenticated browser: homepage and case-study double-click copy editing, draft save and reload; original public snapshots stayed unchanged. A case-study title edit also updated its Works metadata.
- Real authenticated browser: inserted two-column layouts, undo/redo, move-up control, layout save, mobile column stacking, preview mode, responsive panel open/close, and image replacement through an actual private upload.
- The uploaded draft image returned 404 anonymously. Original Site/Works draft and published payloads were restored exactly after testing; only revisions advanced. The disposable QA upload was removed. Backups remain ignored locally.
- Native coordinate drag automation did not produce an observable placement in two attempts. GrapesJS supplies the native drag behavior, but physical pointer/touch drag is not claimed as verified. Click insertion and move controls were verified.
- Captures at 1440px, 627px (the user's browser width), and 390px were inspected. Mobile document width was 390px without horizontal overflow. Inspector/layer contrast and mobile toolbar wrapping were corrected during the bounded inspection pass.
- Unsaved-navigation testing opened the expected native confirmation dialog. Browser automation then could not control that dialog; the user was asked to choose Cancel. No database content changed during this check.
- The required independent Impeccable reviewer returned `ship`, no material UI fixes. The documenter confirmed the incumbent public DESIGN.md and sidecar require no changes; admin styling remains outside their public scope.
- Detector ran once over the new editor source: zero primary findings, ten palette advisories attributable to the separate admin/public systems. Runtime dependency audit reported zero vulnerabilities. Existing development-tooling advisories remain outside this change.

## Scope of evidence

Admin checks above used the actual existing Supabase login at localhost:3001. Publishing isolation was exercised through handler/database regression tests; no new visual QA page was published to the public portfolio. Production Vercel deployment and physical-device behavior have not been verified for this change.

The prior CMS commit is 833feaf. The visual editor is a separate change; consult Git history for its commit and push status. This QA report verifies the local application and does not confirm Vercel deployment.

After-mode antislop findings and the scoped Delivery Gate are recorded in anti-slop/audit-001-2026-10-16.md. No additional global design changes were authorized or made.
