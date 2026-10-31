# Case study UI walkthroughs

Six public cases have a 12-second HyperFrames walkthrough after the project overview: Listing Hub, Meta Ads, MBG, Daily App Gading, My Daily App, and Req Video. Existing covers and narrative remain intact. Overview labels use the existing Lucide icon family.

## Motion assets

- Desktop: 1920 x 1080, 30 fps, H.264 MP4.
- Mobile: separately composed at 1080 x 1350, 30 fps, H.264 MP4.
- All 12 files contain one video stream and no audio. Faststart was verified for every file.
- Measured sizes: 351 to 715 KiB per file, 6,086,278 bytes for all videos combined. Posters add 376,642 bytes in total.
- Only the current case and matching responsive source load when the section approaches the viewport. The page does not load all 12 videos.
- Four three-second beats use camera focus and short annotations over existing UI assets. These are authored walkthroughs, not recordings of live form submissions or newly measured outcomes.

Sources are in `motion/case-studies/<slug>` and `<slug>-mobile`. Each has editable HTML, assets, SPEC.md and REVIEW.md. `scripts/build-case-motion.cjs` regenerates the initial sources; it overwrites source edits, so preserve manual edits before using it again. HyperFrames is a production tool only, not a new web runtime dependency.

## Playback

The public player is muted, inline, and looping. It starts when at least 20% of its section is visible and pauses offscreen or when the tab is hidden. Source selection responds to viewport changes. Per the final UI refinement, there are no visible pause/replay controls or supporting captions.

Reduced-motion and data-saving preferences use the static poster. Playback restrictions and media errors also retain the poster. Leaving a case releases its video source.

## CMS

Open Portfolio, select a case, expand Isi studi kasus, then Animasi alur. The form controls visibility, title, desktop video and poster. The optional mobile version is collapsed by default. Upload/drop and media-library selection reuse the established upload path; choosing a video does not replace the portfolio cover. Former caption data is retained for compatibility but is not presented.

Drafts may contain incomplete settings. Publishing an enabled walkthrough requires a desktop video and poster. Disabling preserves its files and settings; it does not delete them. Private uploaded motion files are excluded from public media authorization while the walkthrough is disabled.

Built-in defaults are applied without writing production CMS documents. On subsequent CMS save they become explicit configuration, so renaming a case keeps its video references. Managed player markup is removed from visual-editor saves; the form configuration remains authoritative.

## Validation and limits

- All 12 HyperFrames checks passed. Beat and phone review sheets were generated; desktop and dedicated mobile frames were inspected. No separate-scene seams exist. Silent-film warnings are intentional.
- FFprobe verified codec, duration, dimensions and stream count for all 12 exports.
- Production build and 114 tests passed, including settings validation, draft/publication distinction, hidden media authorization, custom layout placement and manual overrides.
- Browser checks covered source-less initial loading, muted playback, offscreen pause, mobile source selection, custom-layout insertion, and CMS media selection with draft saving. Final refinement verified looping playback with no controls or supporting captions.
- CMS QA used an in-memory fixture on port 3022. No production uploads, draft writes or publication were performed. Remote upload behavior uses the existing signed upload implementation and was not retested against Supabase in this change.
- A composite source limits how far its UI can be enlarged. Individual source screenshots would improve the closest shots in a later revision. No UI, feature, role or result was invented to fill those gaps.

## Delivery gate

- Hard gate PASS: real supplied UI assets and existing features; no fictional performance numbers. Browser media controls worked and the mobile case had no horizontal overflow.
- Purpose gate PASS: camera moves identify the discussed UI feature; overview icons improve scanning; responsive encodes preserve mobile readability.
- Liveliness PASS: each case follows its own workflow using the existing dark/orange identity, with static covers retained.
- Craft PASS: 12 validated exports, 114 passing tests and successful production build. Automatic viewport playback remains; controls were removed at the user's request. Browser reduced-motion and remote-provider upload behavior were not exercised live; their implementation and validation paths were reviewed.

Deployment status is separate from local build and Git verification.
