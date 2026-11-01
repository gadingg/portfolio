# Image preview loading

Mode: Experience. Preserve public typography, palette, controls, and galleries. Fix the audited modal loading composition and transfer cost.

Use one preview frame whose aspect ratio follows the artwork. Seed it from the loaded gallery thumbnail or a bounded ratio cache before requesting the larger preview; confirm it from the decoded image. Constrain both width and height to the viewport without cropping or letterboxing. Keep the same frame for loading, ready, and error states. Keep progress inside the frame and announce it accessibly. Fetch viewport-responsive variants eagerly on interaction and reveal the image only after decode. Keep navigation and close controls available. Cancel old image listeners and requests on navigation/close, discard stale decode completions, and offer explicit retry after failure or timeout. Do not preload the full gallery.

Cache image bytes and transformations only after the route checks current admin or published access. Bound the server cache to 32 MiB/64 entries for five minutes and deduplicate in-flight work. Private browser caching must revalidate via ETag on every request; never use public CDN caching for protected media. Keep videos, PDFs, originals, and content editing behavior intact.

Validation includes one-frame state transitions, pending decode, failure/retry, timeout, fast navigation/cancel, cache eviction/expiry/deduplication, hidden-image rejection even with a matching ETag, and unchanged original bytes. Browser QA remains unavailable because local browser use is disabled in Work settings; no measured CLS or visual-device claim is made.


Approved follow-up: pinch zoom and commit/push. Zoom stays inside the clipped artwork frame at 1x–4x, anchored to the gesture midpoint. One pointer pans only when zoomed, with bounds that keep the image covering the frame. Pointer capture, cancellation, blur, resizing, close, and navigation release gesture state. Every new preview starts at 100%. Desktop alternatives include zoom controls, reset, double-click, trackpad pinch, and focused-frame keyboard shortcuts. Ordinary wheel scrolling and browser keyboard zoom remain available. Touch-action is scoped to the ready preview frame; page-level zoom is unchanged. Gesture tests use simulated pointer events; physical touch/browser verification remains unavailable in Work settings.
