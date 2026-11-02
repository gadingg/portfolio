# Admin flow audit and correction

Scope: Overview, Portofolio list/detail, Website & CV, AI workspace/settings, visual editor, shared navigation/loading/media controls.
Antislop applied after implementation, following the owner's existing preference.

## Verified findings

1. P1: Works and Site fetched their first data only after client mount. Route skeletons handed off to a second visible loading message. Both now hydrate one authenticated server snapshot.
2. P2: Nested routes inherited the Overview skeleton, even for forms/editors. Route-specific boundaries now match the task.
3. P2: Visual editor showed initialization status in both toolbar and canvas. Only the canvas skeleton now describes initialization.
4. P2: Saved status appeared in both heading and action bar. Removed heading duplicates; publish action appears when changes need publication.
5. P2: Overview repeated Lihat/Edit text buttons on every row. Replaced repeated actions with named 44px icons; navigation labels and primary actions retain text.
6. P2: Media uploader repeated two full action labels and a long drop instruction. Retained a clear upload label, reduced library entry to a named icon, shortened file constraints and preserved picker error/retry.
7. P2: Stats explanations and missing-date notices competed with content. Removed redundant copy; methodology remains in an optional disclosure.
8. P2: List thumbnails requested original artwork. Overview and Works now use responsive thumbnail variants, explicit dimensions and asynchronous decode.
9. P2: Repeated AI field regeneration buttons added substantial text. Kept per-field actions as named refresh icons. Generation and application retain explicit labels.

## Purpose and design review

PASS: dark navy and amber preserve the existing CMS identity; no public token changes.
PASS: predictable list/form rhythm supports frequent editing; motion is limited to progress feedback and existing disclosures.
PASS: icons describe open, edit, library and refresh actions. Labels remain on unfamiliar and consequential actions.
PASS: no fabricated claims, decorative statistics, new backgrounds or new dependencies.
PASS: deterministic detector produced advisories only; existing surface-specific sizes/radii and colors are documented in DESIGN.md.
PASS: automated checks cover auth-before-read, server snapshots, publication action states and a single nonvisual skeleton status.

## Final verification

- PASS: 152 tests, including three new tests for auth-before-read/initial snapshots, clean/dirty/offline publication controls, and skeleton status semantics.
- PASS: TypeScript check and production build.
- PASS: authenticated browser checks on Overview, Works list and detail, Website & CV, AI workspace, AI settings and homepage visual editor.
- PASS: media picker opens with one skeleton, resolves to existing media, closes and returns focus. No file selected or uploaded.
- PASS: 390x844 viewport inspection; mobile drawer opens, focuses its first link and closes on navigation. Editor panel opens with its close control focused.
- PASS: final mobile search spans the row; repeated row actions have 44px controls and descriptive accessible names. Native page controls and draft/publication behavior remain available.
- PASS: final desktop Overview and mobile Works screenshots saved under workspace outputs/admin-overview-2026-11-02.png and outputs/admin-mobile-2026-11-02.png.
- Boundary: viewport testing is browser emulation, not physical-device testing. AI requests, credential changes, uploads, deletion, logout and publication were not submitted during UI QA; automated tests cover existing persistence and publication behavior.
- No production content writes, commit, push or deployment were performed.
