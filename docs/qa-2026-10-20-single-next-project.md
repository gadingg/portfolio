# Single next-project navigation QA

The footer now renders one Next Project section using the existing Selected Works card classes and shared ProjectArtwork. Both narrative and custom visual-layout case pages use NextProjectNav. The original titles, descriptions, artwork and published ordering remain. One whole-card link contains the sole Next Case Study CTA. Obsolete paired navigation components and styles were removed.

Validation:
- Production build passed, including TypeScript and lint checks.
- 16 tests passed across test-case-navigation.cjs, test-case-loading.cjs and test-editorial-public.cjs. Coverage includes shared card structure, accessible link naming, unchanged content, one destination, absent alternatives and last-to-first wrapping.
- Production HTTP audit on localhost:3013 passed for all five canonical case pages over two rounds. Each rendered exactly one next card with the expected destination. Six legacy redirects, canonical metadata, API/sitemap, missing-page semantics and RSC also passed.
- Scoped design detector returned an empty findings array. Whitespace checks passed.

Current screenshots and physical browser interaction checks could not run because CUA failed to initialize its kernel assets. Source and HTTP checks do not constitute visual approval. Finish disposition: recapture. No production CMS changes, commit, push or deployment were performed in this task.
