# QA and UX audit: public portfolio and admin

Date: 2026-10-21. Read-only audit of production public pages and the current local CMS at localhost:3020. Uncommitted Portfolio workspace improvements are present locally; production admin parity was not asserted. No CMS save, publish, upload or deletion was performed. One temporary Hero field change was canceled. Normal public interaction may generate engagement events.

## Coverage and evidence

- 11 existing test suites: 65 tests, 64 passed, 1 failed.
- Production API returned 200 in approximately 2496 ms in one sample. Five currently published case pages returned 200 with populated titles, streamed skeleton markup, correct next-project links and total response durations around 1558-1610 ms. These are network samples, not Core Web Vitals or a load test.
- Case order: listinghub -> metaads -> mbg -> dailyapp -> reqvideo -> listinghub.
- HTTP inspection of homepage and /webapp, /design, /video; browser inspection of homepage Works, mobile menu, design lightbox navigation, Instagram modal, admin Overview, Website & CV, and visual editor.
- Desktop around 1280px, mobile around 390px, plus a 320px stress inspection of Website & CV. No physical-device, Safari, Firefox, contrast certification or sustained-load claims.
- Public mobile menu returned focus after Escape. Lightbox changed image and retained working controls. Instagram embed displayed a player and Play action; native autoplay is not configured for the existing Instagram-only entry. No captured runtime errors on inspected public/editor tabs.
- Automated Impeccable scan found 75 advisory design-document mismatches: 24 colors, 44 font sizes, 7 radii; zero non-advisory results. These are token/documentation review signals, not 75 verified bugs. Prior layout-only scan and this broader token scan cover different scopes.

## Prioritized findings

### P1: draft/publish workflow differs by editor

Portfolio blocks Publish until local changes have been saved. Website & CV enables Publish immediately after changing a field; browser reproduced this with Metadata hero and canceled the change. Visual editor also exposes an enabled Publish action immediately after loading a clean draft. This conflicts with the agreed save-draft-then-publish model and changes the meaning of a core action between screens.

Source: components/admin/SiteManager.tsx save toolbar; components/admin/VisualEditor.tsx toolbar; components/admin/WorksManager.tsx conditional save bar.

Recommendation: use one shared publication-state model and action bar: clean, unsaved changes, saved unpublished draft, saving, error. Require a draft save first across all editors and clearly indicate the publication scope. Disable redundant publication when no unpublished change exists. Keep stale-revision protection.

### P1: public Works depend entirely on client-side loading

HTTP HTML contains zero project cards on homepage and all three collection pages. Collection pages only contain a loading message plus a JavaScript-required noscript message; homepage has no equivalent noscript alternative. Browser initially displayed loading messages. /api/works took around 2.5 seconds in one sample.

Source: components/public/WorksCollection.tsx and public/assets/js/works.js load().

Recommendation: render the initial published cards on the server, then enhance with gallery/player interactions. Retain retry/error states and bounded requests. While loading, reserve artwork/card dimensions with skeletons to reduce empty presentation and layout movement. Do not claim the sampled latency is permanent server slowness.

### P2: demo content still competes with real work

Public API exposes 17 visible entries, including 11 demo entries: one website slot, all four visual-design entries and six of seven video entries. Demo video cards use Watch video, but open a sample explanation containing instructions about changing Instagram links through the admin Works menu.

Source: public/assets/js/works.js openVideo() and current published CMS content.

Recommendation: keep demo media available privately for editing, offer a clear admin Demo filter and a publish-readiness summary, and intentionally choose whether examples belong on the public site. Remove admin setup instructions from visitor-facing dialogs. If examples stay public, use Preview consistently rather than promising playback. This is content/readiness feedback; the sample content was previously requested and was not changed by this audit.

### P2: Draft and Disembunyikan are conflated in Overview

lib/admin-overview.ts classifies every item absent from the visible public snapshot as drafts. An intentionally hidden item can therefore appear as Draft even when draft and published snapshots match. The collection editor correctly labels the same item Disembunyikan.

Recommendation: separate publication state from visibility. Use Draft baru, Ada perubahan draft, Tayang, and Disembunyikan. Count unpublished changes separately from hidden items. Include examples as their own optional inventory distinction.

### P2: simplified Portfolio pattern is not shared by Website & CV

Website & CV still has the persistent three-action toolbar, nine equally prominent section buttons and the old Works category label. Hero fields also retain Tombol karya. Users move between two different control hierarchies inside the same CMS.

Recommendation: share the compact contextual save bar and consistent Portfolio vocabulary. Desktop can use a section navigation column; mobile can use a compact section selector with the current section clearly named. Keep fields and actions in context instead of showing all section choices at equal weight.

### P2: mobile visual-editor toolbar consumes a large part of the canvas

At approximately 390px the editor top controls occupy three rows, around 160px. History, device switching, panel, preview and publication compete for scarce space. Focus moves to the mobile panel close control correctly, and the source includes a Tab boundary handler; this audit does not flag missing focus handling.

Recommendation: retain the page name and one primary save action in the first row, group device/history controls in a secondary tools surface, and expose Publish only in the appropriate draft state. Preserve clear access to Preview and the content panel.

### P2: small-screen floor and token drift need a bounded hardening pass

At the 320px stress viewport, document client width was 305px and scroll width 320px with a 15px scrollbar; global body min-width:320px combined with overflow-x:hidden can mask clipping. At the ordinary mobile width inspected on public Works, document client and scroll widths matched. Do not generalize the narrow-viewport observation to all phone layouts.

Recommendation: remove unnecessary viewport floors, test 320/360/390/768px, longer labels and 200% text scaling. Document distinct public and admin typography/color/radius ramps instead of treating all off-ramp advisories as visual defects.

### P2: QA fixtures are behind the current content model

scripts/test-work-update.cjs:16 expects a published file-only video without a cover to be valid, but current schema intentionally requires a thumbnail. This is the one failing test; the dedicated video suite passes. scripts/audit-case-routes.cjs derives the entire published case list from the legacy redirect map, so a valid newly published CMS case would violate its fixed-count/order expectation.

Recommendation: update the obsolete video fixture and derive route/navigation checks from the current published API, testing legacy redirects separately. Add browser checks for the shared publication-state workflow rather than tests that merely mirror layout markup.

## Current-content observation, not a regression

Literally,, My Daily App is currently hidden and its case study disabled with restoration data retained in CMS. It is absent from the public API accordingly. This audit did not restore or publish it. Preserve the owner's current settings unless explicitly asked to change them.

## Suggested implementation order

1. Shared publication state and accurate visibility/status labels.
2. Server-rendered initial Works and stable skeleton/error presentation.
3. Demo-readiness controls and public dialog copy.
4. Website/CV navigation and compact mobile visual-editor toolbar.
5. Token documentation, narrow-screen hardening and updated QA fixtures.

No authentication, RLS or storage permission changes are required for the proposed interface work.
