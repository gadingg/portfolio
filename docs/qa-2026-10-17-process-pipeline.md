# Homepage and pipeline verification

- Removed the three-panel artwork strip and its signoff from the homepage. Browser DOM confirms section order: home, work, about, process, toolkit, contact. Hero introduction and actions remain.
- How I Work contains five titles with numbered nodes and no paragraphs. Public rendering and the editor's GET endpoint normalize stored visual layouts without database writes. Removed-content fields no longer appear in the CMS form; previously stored values are retained.
- GSAP 3.15.0 and ScrollTrigger are installed and served locally. Build script copies official minified distribution files with their license headers and a notice. No external CDN request is required.
- 33 regression tests passed. After updating the editor GET normalization, its affected controls/visual suites passed again (11 tests). Next.js production build passed compilation, lint/type checks and page generation. Final public motion script passed `node --check`.
- Actual desktop scroll progress moved from 0 to 0.197150 to 0.672209, with reached-node count following the fill. Mobile reverse scroll moved from 0.769971 to 0.410289; the fill and reached nodes reversed together. Mobile body width and scroll width both measured 375px.
- Browser inspection corrected the desktop node width and replaced CSS-variable tweening with a GSAP object tween driving the shared progress state. The corrected static assets were verified in the production-mode local server.
- Desktop/mobile screenshots are under `.impeccable/review/process-pipeline-2026-10-17/`. One detector pass completed; retained whole-file style advisories do not require a new visual direction. Independent finish review confirmed changed regions; the documenter corrected stale design guidance, and the reviewer confirmed `ship` after that named fix.
- Without JavaScript or under reduced motion, CSS displays all five titles and a fully connected static pipeline. Browser preference emulation was unavailable, so the reduced-motion branch was checked in source rather than claimed as a live browser test.

Preview: http://localhost:3002/. Changes are local, uncommitted, and not deployed to Vercel in this task. No production content was modified.

Implementation reference: https://gsap.com/docs/v3/Plugins/ScrollTrigger/ (scrubbed progress and native scrolling).
