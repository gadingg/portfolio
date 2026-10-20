# Case loading reliability and short URLs

User reports intermittent empty/stuck case navigation and requests a loading skeleton only during genuine loading, plus short slugs across all studies. Scope includes public/admin route consistency, old-link compatibility and response audit, not a redesign.

Findings: live baseline Req Video200/2.19s, Daily App200/1.35s, Works API200/2.24s from this machine. The reported blank state did not reproduce in those samples. Code previously loaded the full public CMS document through metadata, individual lookup and navigation list independently, without a deadline or local error boundary. All5 published cases currently have narrative blocks and no custom visual layouts; there is no evidence those layouts caused this incident.

Implementation: React request memoization and one page lookup share metadata/navigation content. Explicit60-second tagged data cache is limited to published snapshots; draft/admin reads remain uncached. Successful publish/order invalidates the corresponding public cache; draft-only saves do not. Public reads use an8-second abort, error responses are thrown rather than cached as empty arrays, and the case function budget is15 seconds. Explore links disable viewport prefetch to avoid speculative fetch fan-out.

Loading UI: immediate themed shell/navigation, visible loading status, decorative animated title/cover/paragraph skeleton, reduced-motion support. Existing Next images below the fold remain lazy; cover priority is retained. A scoped error boundary supplies retry and a working return link rather than an endless placeholder. No content is deliberately hidden until an animation completes.

Canonical paths: /work/listinghub, /work/metaads, /work/mbg, /work/dailyapp, /work/reqvideo. A shared JSON mapping drives6 static308 redirects, including the historical Mega App URL. Read-time normalization applies to draft/public Works without writing production records, preserves old aliases and all unrelated data, and feeds links, metadata and sitemap. Future custom slugs remain editable. Existing templates/artwork lookups support short names.

Current browser captures and real pointer-driven route transitions are unavailable because the session CUA runtime cannot initialize. HTTP, RSC, SSR and a local hanging-upstream test provide functional evidence, not visual approval or proof of a specific Vercel failure cause.
