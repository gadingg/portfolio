# Case loading, responses and short URL audit

## Baseline and limits

Read-only production sampling of the existing Vercel release returned200: Req Video2190ms total/575ms headers, Daily App1352ms/300ms, Works API2236ms/1238ms. The reported intermittent blank state did not reproduce in these samples. Source had three separate collection call paths from metadata/project/navigation, no explicit deadline and no case-local recovery boundary; this identifies avoidable work and missing safeguards, not a conclusively reproduced production root cause. Five published cases have content blocks and no custom visual layout.

## Implementation verified

- Final production build passed compilation, lint, types and page generation.
-41 regression tests passed across case-loading, case-navigation, works, visual-editor, editorial-public, horizontal-gallery and public-controls scripts. Coverage includes immutable/idempotent short-slug normalization, published-only cache, draft isolation, invalidation on publication, failures rejecting instead of becoming empty content, skeleton semantics and retry/back controls, alias preservation, CMS editing and previous controls.
- Read-only audit-case-routes against the local production build passed6 permanent308 redirects,5 canonical pages in2 rounds, API slug agreement, short-only sitemap and a Flight/RSC response requested as navigation from Daily App to Req Video. Every actual page had a title, narrative content and one next-work section. Warm local totals18–124ms; second-round totals18–23ms. These are local warm-cache timings, not a comparable Vercel before/after benchmark.
- An unknown case renders the Next not-found content and noindex. Its streamed response usesHTTP200 because loading has already flushed headers; the test records that status rather than falsely claiming a hard404.
- audit-case-timeout launches an isolated production process with a local server that deliberately never answers the CMS request. No live CMS writes occur. Result: first headers366ms, actual skeleton chunk370ms, request termination8388ms, exactly1 upstream CMS call shared by metadata/page. The fault process and fake upstream are cleaned up automatically. Server-stream termination and error boundary payload were verified; real hydrated Retry interaction was not exercised in a browser.
- Current canonical URLs: /work/listinghub, /work/metaads, /work/mbg, /work/dailyapp, /work/reqvideo. Six historical URLs return308, including mega-app-gading. Public/admin read models normalize the same records; source documents are not mutated. Existing draft content/blocks and publication boundaries are preserved.
- Published Works/Site caches are tagged,60-second caches. Admin draft reads stay uncached. Successful public changes invalidate the corresponding tag; draft-only saves do not. Public query deadline8s; case route function budget15s. Failed cold reads are not cached as an empty collection. Existing below-fold image lazy loading and cover priority remain.
- One scoped Impeccable detector pass returned an empty list. Diff whitespace check passed.

## Remaining verification

No current desktop/mobile loading/error screenshots or physical client navigation captures are available through the failing CUA runtime. HTTP and Flight requests are not proof of browser hydration, measured CLS or real touch behavior. Visual finish disposition: recapture. Production has not been updated by this task: no commit/push/deployment or production CMS write was performed.
