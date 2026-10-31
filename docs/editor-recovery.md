# Editor recovery and Listing Hub refinement

## Editor recovery

Portfolio, Website & CV, and the visual editor keep a validated local backup of unsaved edits after a 500 ms debounce and when leaving the page. Reopening the editor offers **Lanjutkan editan**; it does not restore or publish automatically.

- Backups expire after seven days and are limited to 2.5 MB per scope.
- **Riwayat perangkat** retains up to five loaded or saved versions. Restoring one changes the local editor only; saving and publication review remain required.
- If the server revision changed, direct recovery is disabled. The old edit can be downloaded as JSON for manual comparison.
- Browser storage is device and origin specific. Clearing browser data removes these copies. This is not server history or cross-device synchronization.
- API keys and settings are not included. Invalid intermediate form input keeps the previous valid backup.

## Ordering

The portfolio collection opens in editing mode. **Atur urutan** reveals drag handles and keyboard move buttons, while disabling project editing actions. **Selesai mengurutkan** returns to editing. Changes still follow Save draft and publication review.

## Listing Hub

The case exposes separate **Open All Database** and **Open Personal Listing** actions. Labels and destinations can be edited through **Tombol aplikasi** in the case form. Explicit custom destinations remain respected.

Existing search and filter screenshots appear beside the All Database narrative. The enrichment runs once and retains an edition marker so intentional later removal is respected. Custom-layout screenshot links update together with their image source when replaced.

## Validation

- TypeScript check and production build passed.
- All 110 regression tests passed, including three recovery, CTA, and evidence tests.
- Browser QA used the RAM-only local fixture on port 3022. Unsaved title recovery, local version confirmation, and ordering controls were exercised without writing production CMS data.
- Public Listing Hub was checked on desktop and a 390 px viewport: both app destinations were correct, both screenshots loaded, and no page-level horizontal overflow was present.
- Screenshots: `.impeccable/review/recovery/listing-desktop.png` and `listing-mobile.png`.

## Design delivery gate

- Hard gate PASS: changed copy contains no em/en dashes or invented project claims; supplied assets and destinations are reused. Local recovery and reorder controls were exercised in the browser.
- Purpose gate PASS: recovery is explicit to prevent silent overwrites; ordering tools appear only in their mode; separate app names clarify the two destinations.
- Liveliness PASS: existing artwork, editorial hierarchy, dark palette, typography, and orange accent are preserved; no decorative assets or effects were added.
- Craft PASS: production build and 110 tests passed; desktop/mobile overflow and loaded assets were checked. Recovery remains a local safety net, not a claim of server-backed history.

Changes remain local until committed, pushed, and deployed.
