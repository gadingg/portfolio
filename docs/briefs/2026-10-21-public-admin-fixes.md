# Public and admin QA fixes

Approved scope: fix the 2026-10-21 audit, remove visitor/editor-facing example and dummy copy, retain placeholder media and editable slots.

Implemented:
- Initial published Works cards rendered in HTML on homepage and collection pages; safe JSON bootstrap enhances cards without a duplicate initial API call. Usable links remain without JavaScript. Hidden/archived content excluded from bootstrap. Recoveries hidden on success; skeletons cover genuinely missing data.
- Placeholder title/description/alt presentation cleaned without removing IDs, files, internal demo flags or stored records. Public preview messages no longer contain CMS setup instructions. Placeholder playback actions use Preview.
- Shared publication state and action bar for Portfolio and Website/CV. Visual editor uses the same rules and receives real unpublished-state metadata from the server. Save required before Publish; clean actions hidden.
- Overview separates newly created drafts, published visible records, hidden records and pending edits. Pending deletion still counts the current published record.
- Website/CV section navigation becomes a column on desktop and a selector on mobile. Portfolio terminology replaces Works labels in this surface. Mobile visual tools folded into a compact tools panel; toolbar is approximately 111px rather than 160px. Escape dismisses tools and restores focus.
- Removed global 320px minimum that masked clipping. Admin tokens documented separately from public typography. Updated stale thumbnail fixture and dynamic case-route audit.

Verification:
- Production build including lint and types passed.
- 71 tests passed, including new publication-state, no-JS rendering, escaping, bootstrap visibility and placeholder preservation regressions.
- Local HTTP contains 17 initial homepage cards and 6/4/7 collection cards, with no visible example/dummy copy. Initial snapshot has no recovery errors. This counts the current published CMS entries, not a fixed inventory contract.
- Route audit passed 6 legacy redirects, 5 current cases over two rounds, wraparound Next Project, missing-page noindex and RSC response.
- Browser: Website/CV dirty state blocks publishing and cancellation restores clean data; mobile 320px client/scroll widths match. Visual editor 390px toolbar measured 111px, clean Publish hidden. Public placeholder preview retains media and uses neutral availability copy. Existing menu/lightbox behavior and data order retained.

No production CMS save, publication, upload, deletion, auth or storage-policy change was performed. The personal Daily App visibility/case settings remain as the owner left them. Changes are local until Git push/deployment.
