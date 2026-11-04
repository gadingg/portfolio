# Audit 039: public and admin UI/UX

Date: 2026-11-04. Method: sequential source review, production public browser inspection, authenticated local admin browser inspection. Impeccable audit and Antislop after mode. No UI, CMS content or publication changes.

## Scope and evidence

- Public production homepage desktop 1280px and mobile 390px; Website / Apps archive; Listing Hub and Req Video case studies; visual lightbox; video popup; mobile menu; About / What I Do; CV route.
- Authenticated local admin at localhost:3020: Overview, portfolio form for personal-daily, AI Study Case existing-project review, AI settings, Profile & CV, homepage visual editor. Local app reads existing CMS content. No Generate, Save, Publish, upload, delete, API connection test or form-content edits were performed.
- Local cold dev navigation initially took about 10 seconds including Next compilation. This is not a production performance measurement.
- 21 targeted fixture/component regression tests passed. These do not prove all remote writes, uploads, provider calls or real touch gestures.
- Browser layout emulation only, not a physical phone or synthesized touch audit. No full screen-reader, 200% text zoom, contrast-matrix, Lighthouse or throttled-network run.

## Implementation integrity verdict

The existing dark editorial identity is coherent. Preserve the whole-card links, single next project, restrained orange actions and accessible media dialogs. The largest verified usability defect is the transparent sticky publication toolbar over scrolling form content. Admin information hierarchy still depends too heavily on long forms and nested disclosures.

## Provisional health score

| Dimension | Score / 4 | Basis |
| --- | --- | --- |
| Accessibility | 3 | Named controls, dialogs, focus handling; toolbar overlap impairs readability. Not a WCAG conformance assessment. |
| Performance | 2 | Public media loads lazily, but some internal admin links reload the document; CMS draft read has no explicit timeout. No production speed benchmark. |
| Responsive | 2 | No sustained page overflow in inspected public layouts; mobile sticky toolbar overlaps form. |
| Theming | 3 | Public identity is consistent; admin uses its own token set, so public DESIGN.md detector comparisons are not automatically defects. |
| Implementation integrity | 2 | Publication status scope, incomplete inventory and form structure leave verified ambiguity. |
| Total | 12 / 20 | Provisional, significant admin usability work remains. |

## Prioritized findings

### 1. P1: Transparent sticky publication toolbar overlaps the form

Location: components/admin/works-manager.css:43,54,166; components/admin/PublicationBar.tsx.
Evidence: on local personal-daily form at 390px while scrolling, toolbar top=66px, height=88px, computed background rgba(0,0,0,0). Status and visibility text visibly overlap the Hasil textarea behind it. Screenshot: ../.impeccable/review/audit-nov4-admin-mobile-overlap.png.
Impact: form text and status compete in the same area, making editing harder.
Recommendation: keep sticky bars opaque in every clean/dirty state, or make the clean bar non-sticky. Preserve a compact one-line status and move the visibility setting into a clearly separated control.
Category: Responsive / Accessibility. Antislop R-31. Suggested: impeccable adapt, then polish.

### 2. P2: Overview says no review needed despite incomplete records

Location: lib/admin-overview.ts:17; components/admin/Overview.tsx:35-41.
Evidence: local Overview shows Total 14, Tayang 10, Perlu ditinjau 0, Disembunyikan 0, followed by a notice that 4 records are incomplete. The numbers are calculated under different definitions, not an arithmetic bug.
Impact: the most important next action is outside the primary summary cards, and the label Perlu ditinjau sounds broader than its draft-difference calculation.
Recommendation: show Belum lengkap as an actionable count or explicitly label the existing count Draft berubah. Link to a filtered incomplete-record list, rather than the unfiltered collection.
Category: Implementation integrity / Information architecture. R-02, R-31. Suggested: impeccable clarify.

### 3. P2: Story text editor flattens the story into generic fields

Location: components/admin/CaseLayoutText.tsx:14-35; components/admin/WorkEditor.tsx:56-63.
Evidence: personal-daily exposes 13 text entries labelled Judul / Paragraf inside Isi studi kasus > Teks cerita. Original narrative sections are not used as editor groups.
Impact: the author must infer which repeated field corresponds to the public section, especially with inline bold text split into separate entries.
Recommendation: group fields by actual section headline, with Heading and Body together; use a small section navigator. Keep search as a secondary tool and retain advanced visual editing.
Category: Operability. R-05, R-31. Suggested: impeccable distill.

### 4. P2: Form image management cannot reorder or remove existing story images

Location: components/admin/CaseLayoutImages.tsx:44-71.
Evidence: existing image controls support replace, alt and caption. Add placement is only end or after another image. No form-level remove/reorder controls are rendered.
Impact: a simple screenshot-order change requires switching to the advanced editor, disrupting the form-first workflow.
Recommendation: thumbnail rows with replace, move up/down or drag, and remove with undo; placement by named narrative section. Do not blindly reorder decorative images inside complex layouts; distinguish story screenshots from layout-owned imagery.
Category: Operability. R-31. Suggested: impeccable harden.

### 5. P2: AI review is a long open form rather than a readable draft

Location: components/admin/AIStudyManager.tsx:108-120,150-158.
Evidence: selecting existing personal-daily without generating shows 17 editable fields; review panel height is about 3,522px at mobile width, total page about 5,093px. All six narrative sections open at once.
Impact: difficult to scan the result or compare changes; the apply action is far below the content.
Recommendation: default to a readable story preview, with Edit per section and one persistent review/apply action. Preserve field-level regenerate and the explicit accept/reject revision flow.
Category: Operability. R-05, R-31. Suggested: impeccable distill.

### 6. P2: Profile & CV also owns most homepage content

Location: components/admin/SiteManager.tsx:100,108,145.
Evidence: Profil & CV mobile section selector includes Identitas, Hero, Portofolio, About, Kemampuan, Proses and Tools alongside profile, CV and downloads. Homepage visual editor is a separate navigation destination.
Impact: unclear where to change homepage copy and which screen publishes it.
Recommendation: give content a clear owner: Homepage for homepage sections, Profil & CV for profile/CV/downloads. If the existing page stays combined, rename it honestly and group the selector, without adding a second source of truth.
Category: Information architecture. R-02, R-31. Suggested: impeccable clarify.

### 7. P2: Admin navigation and slow-request behavior are inconsistent

Location: components/admin/AIStudyManager.tsx:127,158; components/admin/WorkEditor.tsx:71; lib/db/cms.ts:18-26; components/admin/WorksManager.tsx:112; components/admin/SiteManager.tsx:57.
Evidence: several same-app links are plain anchors, while sidebar uses AdminLink. readCMS has no explicit AbortSignal deadline; some client load GETs also lack one. Public published reads already have an 8-second bound.
Impact: avoidable full-document reloads; a slow backend may leave skeletons visible longer than intended. A production hanging request was not reproduced in this audit.
Recommendation: use AdminLink for internal navigation, bound GET/server reads and preserve retry. If caching is added, use a private in-memory snapshot with revision revalidation; never store Gemini secrets in public/shared cache. Profile before introducing broader caching.
Category: Performance / Recovery. R-27, R-31. Suggested: impeccable optimize.

### 8. P2: Homepage editor status can be mistaken for the whole preview publication state

Location: components/admin/VisualEditor.tsx:79,203.
Evidence: editor header says Sudah tayang while its draft portfolio feed shows 3 videos, including Video 03 Preview. Production homepage shows 2 videos. The status concerns site content, while the feed uses works-preview.
Impact: the author may assume everything currently visible on the canvas is already public.
Recommendation: explicitly label the canvas Preview draft and scope status to Homepage content. Add a quiet indication when the portfolio feed includes unpublished records, preserving the separate publication flows.
Category: System status / Integrity. R-02, R-27. Suggested: impeccable clarify.

### 9. P2: Case narratives repeat the overview before reaching specific evidence

Location: published Listing Hub and Req Video custom story layouts; editable through CaseLayoutText.
Evidence: Req Video repeats the project summary in Video requests and repeats the old chat-based problem in Collecting requests, after Problem / Approach / Outcome. Listing Hub repeats the two-app explanation in Shared and personal listings; the All Database paragraph occupies about ten mobile lines.
Impact: users spend additional scroll effort reading information already understood.
Recommendation: keep the overview concise, then make each story section add a decision, concrete interaction or screenshot. Split longer explanations by useful subheading or short paragraphs, without inventing metrics/features or turning every paragraph into another card.
Category: Readability / Copy. R-02, R-05. Suggested: impeccable typeset and clarify.

### 10. P2: Four-poster composite images obscure individual artwork on mobile

Location: production Visual Design gallery and lightbox, Weekly Meeting Poster Set 1 / 2.
Evidence: each cover is a 2x2 poster composition. At the inspected phone lightbox the whole composition is roughly 310px wide, leaving each poster around 150px wide before zoom. Zoom functions correctly.
Impact: the default reading experience communicates a collection but makes the individual design details hard to inspect.
Recommendation: keep the composite as a cover, and add individual full-resolution artworks to the lightbox/gallery when available. Do not stretch crops into replacement originals or modify the actual project records without review.
Category: Artwork visibility. R-31. Suggested: impeccable layout.

### 11. P3: About and Hero have identical mobile headline size

Location: public/assets/css/showcase.css:417,549,639.
Evidence: both hero-title and about-title compute to 32px at 390px, despite the earlier 80% About rule. Later .about-editorial rule sets a 32px minimum.
Impact: reduced distinction between the primary introduction and secondary biography.
Recommendation: keep the approved Hero scale and lower About to around 26-28px on narrow phones, keeping the orange accent and current wording.
Category: Typography. R-31. Suggested: impeccable typeset.

### 12. P3: Motion now shows real screens but still emphasizes screen transitions over feature explanation

Location: motion/case-studies/*/compositions/workflow.html; scripts/build-case-motion.cjs.
Evidence: current four refreshed cases use real screenshots and clean cyclic rails/crossfades. The screenshots are distinct, but the authored motion primarily moves between whole views.
Impact: stronger provenance than the old cover-only motion, but a viewer may still miss what action causes the next state.
Recommendation: an optional next refinement is one clearly related interaction per sequence, such as filter selection to results or request card to details, with a subtle local focus change. Retain muted loops and the user's no-controls/no-supporting-copy rule. This is a craft recommendation, not a broken playback finding.
Category: Motion communication. R-19, R-31. Suggested: impeccable animate.

## Positive findings and regression coverage

- Whole-unit case cards and a single Next Project work; Req Video points back to Listing Hub.
- Public mobile menu opens/closes, selects destinations; design dialog opens/closes and provides zoom/navigation; video popup successfully plays the uploaded MP4 after opening.
- No broken loaded images were observed in the inspected production screens. Unloaded offscreen lazy images are not counted as broken.
- Case video source is absent before proximity, selected responsively near viewport. Existing reduced-motion and save-data fallback remains in source; browser preferences were not emulated.
- AI settings show a masked disabled key, Ganti key, disabled unchanged Simpan and active Tes koneksi. No API call was made.
- Mobile admin drawer makes the underlying main region inert and focuses navigation; no content was changed during audit.
- 21 tests passed: admin flow, editing, overview, public controls and next-case navigation. No current routing freeze reproduced on the inspected paths.

## Detector and limits

Impeccable components scan: 114 signals = 62 font-size advisories, 34 color advisories, 12 radius advisories and 6 broken-image warnings. The image warnings use dynamic spread props, verified through workThumbnail and conditional image rendering; do not treat them as six live broken images. Token comparisons use a public-only DESIGN.md while many hits are admin components. Raw signals are not counted as verified defects.

Read-only browser evaluation did not support overlay mutation, so no detector script was injected, no overlay live server was started and the browser stayed background. Sequential assessment only; no independent critique agents were requested. Main app was started locally for inspection. Screenshots and detector JSON stay in ignored .impeccable/review. Source behavior was not edited. Dev-generated icon sprite was restored after inspection.

Antislop delivery gate for the audit: findings cite concrete evidence; user-authored dark/orange design, bento cards and loops are preserved as authorized choices. No fabricated metrics or new visual assets. R-35 scope is partial click-through with stated exclusions, not a claim of every control or live write being verified. Hard usability gate remains open for finding 1; final polish should follow functional/readability fixes.

## Recommended sequence

1. impeccable adapt: fix finding 1.
2. impeccable clarify and distill: findings 2-6 and 8.
3. impeccable optimize: finding 7, profiling before cache changes.
4. impeccable clarify / typeset / layout: findings 9-11.
5. Optional impeccable animate for finding 12, then impeccable polish.

No repairs were made by this audit. Fixes can be selected one at a time, together, or in another order.

## Follow-up: approved fixes 1, 2 and 8

Implemented locally on 2026-11-04.

- 1: clean publication toolbar retains an opaque admin background, including the disabled-action variant. Browser at 390px verified sticky top 66px, background rgb(12,16,21), with no page overflow or text blending through the bar.
- 2: Overview now shows an actionable Belum lengkap count. Its filtered portfolio view preserves the public incomplete inventory, shows current editable drafts, and separately lists records awaiting deletion. Live local data: 4 incomplete = 1 editable + 3 pending deletions. No records were restored or published. Reordering is disabled while filtered. Clear filter returns the full draft collection.
- 8: homepage editor always labels its canvas Preview draft. The toolbar status is scoped to Konten homepage. A portfolio/public mismatch adds Tinjau portofolio. The API uses the same draft preview items and links, with an added status flag. Timestamp and property-order differences alone do not trigger the notice.

Verification: TypeScript passed; 21 focused tests passed covering overview, pending deletions, preview API contract, editing and publication review. Browser inspection covered desktop overview, incomplete filter and clearing it, mobile sticky toolbar, desktop/mobile homepage preview status. No content field edits, uploads, saves, publishing or Gemini calls were performed. Production deploy was not requested.

Screenshots: .impeccable/review/fix-priority-overview-desktop.png, fix-priority-mobile-toolbar.png, fix-priority-home-draft-mobile.png and fix-priority-home-draft-desktop.png. Temporary browser viewport was reset.

Antislop gate: R-27 state scope clarified, R-31 every added status/control maps to a user action, existing visual identity retained. R-35 evidence is bounded to the checks above, not a blanket claim of every CMS operation. Findings 3-7 and 9-12 remain outside this fix.

## Follow-up: remaining approved findings 3-7 and 9-12

Implemented locally on 2026-11-04; earlier fixes retained.

- 3: Custom story text is grouped under actual section titles. Personal Daily now shows six named disclosures instead of thirteen flat text nodes. Inline bold fragments and markup remain editable.
- 4: Safe detail figures support same-parent ordering, removal, undo and insertion after a selected story section or screenshot. Cover/decorative images are excluded. Browser fixture verified two-image add, order change, removal and undo while retaining the cover. Complex layouts retain replace/alt without unsafe structural movement.
- 5: AI review uses readable copy with per-field Edit/Selesai and collapsed named narrative sections. The apply action stays near the review. Mobile browser verified editing toggle without generating or applying a result.
- 6: Homepage form and Profil & CV have separate navigation and field groups. Advanced layout remains available. Their shared publication document is explicitly identified. Query-only mobile navigation now closes the drawer correctly.
- 7: Internal editor navigation uses the existing guarded client routing. Draft storage reads and fallback GET loads have bounded timeouts. No speculative cache was added; provider latency can still require loading UI.
- 9: Known Listing Hub and Req Video repeated introductions are removed; long known paragraphs are shortened and split. Custom owner edits remain guarded. Local public Listing Hub verified distinct overview, All Database and Personal Listing content.
- 10: CMS now supports individual artwork upload/replacement/order/alt text. Both hydrated and client-rendered galleries expand these in the existing lightbox, with cover fallback. Browser fixture verified first artwork, second artwork and fallback sequence. Original individual posters are not available in current data, so existing composite covers were preserved; content replacement remains pending actual assets.
- 11: At 390px, Hero remains 32px and About is 26.52px. Browser verified no page overflow on inspected public/admin screens.
- 12: Eight accessible desktop/mobile motion exports now briefly focus the relevant real UI control/content. Req Video bounds were corrected after visual review. All eight checks and encode/loop validation passed. Each is silent, H.264, 12 seconds, 30 fps and faststart. Meta Ads and office Daily App remain deferred per user instruction.

Validation: typecheck passed; 70 targeted tests passed, followed by 12 focused tests after the last refinements (including one new lightbox regression). Diff whitespace check passed. Browser mutation QA used a RAM-only fixture on port 3031, with publish blocked and other upstream writes blocked. No production CMS draft, upload or publish was made. Gemini generation, actual provider uploads, reduced-motion emulation and a production build were not retested in this follow-up.

Proof screenshots and motion check/encode reports are under ignored .impeccable/review. Local implementation only; commit/push not requested in this turn.
