# What I Do reference redesign QA

Scope: capability section only, plus its CMS title fields, render migration and five additional Lucide symbols. User-supplied reference and exact composition/titles are recorded in docs/briefs/2026-10-20-capabilities-reference-redesign.md. No CMS database write, commit, push or deploy was performed.

Validation:

- Production asset build generated36 Lucide symbols. Final `next build` passed compilation, lint, type checking and static generation after the sanitizer-safe migration marker fix.
-15 regression tests passed across test-editorial-public.cjs, test-horizontal-gallery.cjs and test-public-controls.cjs. A legacy5-card/accordion fixture renders4 exact titles without supporting paragraphs or old screenshots. Its original title/body/fifth-entry values are not mutated. A second render preserves the new layout's visual edits and honors future migrated-model title edits. Admin exposes4 capability titles and no description inputs.
- Local production server localhost:3006 returns200. Actual homepage HTML contains exactly the4 requested titles and4 decorative scenes, no capability paragraphs/summary/image elements, and valid symbol references for every capability icon. Adjacent design controls and About copy remain present.
- Source layout: full-width,2 columns,full-width from768px; single-column phone layout. Existing outer20px/32px gutters remain. Card padding24px,20px below380px,32px at768px; gaps12px/16px. Border radius16px, translucent surface,12px backdrop blur, thin border and restrained orange radial light are explicitly requested, local to capabilities. Minimal code-native visual mockups are static and hidden from assistive technology; title text remains semantic h4.
- One scoped detector pass reports only the existing Contact padding warning outside scope. `git diff --check` passes.

Open verification: current desktop/mobile captures, computed margins, actual glass rendering and physical overflow inspection remain unavailable. The session's CUA runtime previously failed before opening a browser with kernel asset path error3. Source/HTTP/fixture results are not visual approval. Finish disposition: recapture.
