# Video CMS QA

## Automated checks

40 tests passed across test-video-cms.cjs, test-editorial-public.cjs, test-public-controls.cjs, test-works.cjs and test-cms-reliability.cjs. New cases cover private signing, input rejection, preserved bucket restrictions, container-byte validation, staging-to-Works completion, public-reference authorization, file-only publication with required cover, single-preview eligibility, hidden/reduced-motion/modal pauses, blocked autoplay and interrupted client transfer retry. Existing draft/publish separation, category/case restoration and carousel pause/resume checks remain green. Production build passed including lint, TypeScript and page generation. Final public JS passed node --check and whitespace checks. Scoped layout detector returned no findings.

## Browser and real storage

- Local public fixture uses real works.js and existing local video assets. Desktop and 390px mobile showed at most one muted playing preview, source loading only on eligibility, no page overflow and no preview playing behind an open dialog. The dialog exposed native controls, completed playback and restored trigger focus on close.
- Actual captureVideoCover helper generated a 960x536 JPEG in the browser.
- After the owner logged in, the actual admin on localhost:3020 uploaded a disposable 7,344,120-byte MP4 to the existing Supabase bucket. The UI reported one uploaded file and one new hidden draft. Its cover loaded, the native admin player reached readyState 4, and Use frame successfully produced a replacement cover. Nothing was saved or published to the Works CMS document.
- The signed resumable endpoint rejected the project configuration. The final implementation uses signed standard multipart upload with XHR progress and one retry, without a new dependency. A real transfer returned HTTP 200, and a 16-byte signed Range request returned 206 with the correct total size. The media gateway signs after authorization instead of buffering the file through Vercel.
- The private media bucket limit was expanded from 4 MiB to 40 MiB by the authenticated signing flow, preserving MIME restrictions. Image/PDF HTTP uploads remain capped at 4 MiB.
- The disposable unsaved draft was canceled. Its video, initial cover and replacement cover were removed by exact generated paths. The separate protocol probe file was also removed. Existing seven public video records remain unchanged.
- An existing video record was opened read-only at 390px; upload and media controls fit without page-level overflow. Temporary viewport overrides were reset.

Screenshots are under .impeccable/review/video-cms: desktop.png and mobile.png (public fixture), admin-desktop.png (successful temporary frame replacement), admin-mobile.png (existing record opened read-only). Public fixture records and synthetic assets are test-only. Instagram-only records still use the legacy embed and external link; muted autoplay applies to uploaded MP4/WebM. No production deployment, commit or push was performed.
