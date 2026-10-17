# Works and video verification, 2026-10-17

## Delivered scope

- Mega App Gading and Req Video Bareng Patosser have case studies at `/work/mega-app-gading` and `/work/req-video-bareng-patosser`. Stories derive from sections 11 and 12 of the master brief; application destinations remain available.
- Design and video carousels use five-second advancement and accessible icon-only pause/resume. Existing interaction, visibility, dialog, and reduced-motion safeguards remain.
- Video 01 uses the supplied canonical Instagram Reel `https://www.instagram.com/reel/DeBkwyszNoi/`. Slots 02 through 07 have explicit example labels and dummy URLs, with an honest preview instead of broken Instagram frames.
- Admin Works accepts optional MP4/WebM media for a muted native autoplay player. No actual native video asset was supplied, so native playback is not certified here.

## Evidence

- Typecheck passed. Existing Works tests: 11 passed. Visual-editor tests: 6 passed. Requested-content tests: 2 passed. Total: 19.
- `node --check public/assets/js/works.js` passed. Icons and portfolio CSS generated; Next production build passed.
- Production server on `http://127.0.0.1:3002`: homepage, `/api/works`, both new case-study routes, and `/video` returned HTTP 200.
- Browser: homepage app links open the new cases; both narratives and authored workflow covers render at desktop and 390px mobile. Mobile case document width was 375px inside a 390px viewport, with no horizontal overflow.
- Carousel DOM: toggle has no visible text and one SVG, with state-specific accessible name. Design scroll position advanced 0 to 408 after six seconds; after pause it remained 408 through a further ten seconds. Video uses the same timer path; no independent elapsed-time measurement was made for video.
- Real Instagram embed loaded. After the provider Play button was clicked, video DOM reported `currentTime: 6.560184`, `paused: false`, `readyState: 4`. Automatic Instagram playback was not achieved. Website iframe permission does not guarantee provider playback.
- Dummy slot 02 opens the labelled example preview without loading an Instagram iframe.
- One visual detector pass: zero primary findings, one advisory. Required finishing review resolved its documentation-only correction and returned `ship`; no new visual direction introduced.

## Persistence and release

The targeted CMS update was applied to draft and published Works independently, with an ignored pre-write backup and optimistic revision check. Current revision is 20. Unrelated items in both snapshots were compared against the original backup and are unchanged. Repeating the updater reports `Already current; no write needed`.

CMS data is already shared with the public site. New source changes have not been committed, pushed, or deployed in this task. Existing production code may show the new content, but new player, artwork, and carousel behavior require deployment.

## Captures

Local review captures are under `.impeccable/review/works-2026-10-17/`: `mega-desktop.png`, `req-desktop.png`, `mega-mobile.png`, `req-mobile.png`, `carousel-desktop.png`, `carousel-mobile.png`, `videos-desktop.png`, `instagram-desktop.png`, `instagram-mobile.png`, and `dummy-desktop.png`.

## Playback limitation

Instagram currently requires its own Play interaction inside the embed. The optional native MP4/WebM path enables a website-controlled muted autoplay attempt with native controls as fallback; it is not a promise that browsers permit every autoplay attempt. See [MDN autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).
