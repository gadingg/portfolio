# Admin Overview — 18 October 2026

Scope: Overview, click analytics, and related admin navigation/action feedback. The owner approved three status cards, category summaries and recent works; a seven-day default with optional daily detail; and restrained soft glass cards. Public pages and the visual editor layout are outside this refinement.

The matching source is portfolio/main at e98856f. Work is isolated on codex/admin-overview-refinement. The existing origin/main checkout remains at 5922cb2.

## Information and behavior

- Total Karya is the unique union of saved editor items and currently visible public items. This includes a work removed from the editor but still live until publication. Tayang follows the published snapshot. Draft means a saved item whose ID is not currently public. The totals remain additive. A separate notice describes saved changes awaiting publication.
- Category rows provide one count and one Kelola action. Recent works sort known server timestamps first; legacy items remain in collection order and do not receive invented dates. Optional createdAt/updatedAt are stamped on the server when content actually changes; ordering alone does not rewrite history. These fields stay out of the public projection. No database migration or live data write was performed for this refinement.
- Engagement defaults to seven days and retains 30/90-day choices. A real zero shows Belum ada klik pada periode ini; unavailable analytics show a retry action and no false zero. Daily details retain zero days and expand in a bounded table.
- Cards use the incumbent admin dark surface, amber accent, typography, 16px corners, restrained borders and 12px backdrop blur. Three compact status cards lead; category and recent-work panels share a row when space permits. All supporting groups stack on phones. No public design tokens change.
- Next loading boundaries and a keyed Suspense boundary stream a skeleton while data loads. AdminLink reserves an 18px feedback slot; only external destinations use an arrow. Save/publish labels reserve both idle and busy widths, expose aria-busy, retain existing mutation locks, and show a spinner during processing. The logout control is rectangular and stays within its container.
- Mobile navigation can toggle closed, closes with Escape, restores menu focus, traps keyboard focus within the drawer, and releases body scroll/main inert state when closed.

## Verification and limits

13 targeted and CMS-reliability tests passed, including snapshot counts, draft/public isolation, metadata preservation, archived case studies, event validation and logout errors. Production build passed with 17 static routes; dynamic admin routes remain protected. Final fixture routes are excluded from the application.

Rendered checks used temporary, explicitly labeled fixtures on localhost, not a bypass of CMS authentication. Widths 1440, 768, 390 and 320px showed no page overflow or clipped controls. Daily expansion, loading-to-completion, zero/populated/unavailable/empty states, equal idle/busy button widths, and mobile Escape/focus cleanup were exercised. Browser console inspection returned no errors/warnings. Reduced-motion/transparency fallbacks were source-reviewed, not OS-emulated. Live save/publish and logout were not executed in the browser.

One read-only sample measured works data at approximately 1.5 seconds and engagement at 0.9 seconds. These reads remain parallel. Loading improves navigation feedback; it does not guarantee a faster database connection. Multiple ancestor lockfiles and stale Browserslist data generate existing build advisories; dependencies were not upgraded.

Final access checks: unauthenticated dashboard redirects to login (307), admin works API returns 401, and the removed QA fixture returns 404. Original F:/VIBECODINK/portfo stays clean on main at 5922cb2. Refinement files are in work/portfolio-admin on codex/admin-overview-refinement; no commit or push was performed for this change.
