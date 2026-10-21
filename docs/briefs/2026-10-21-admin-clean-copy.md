# Admin disclosure and copy cleanup

Operate mode. User requested an admin-wide audit of remaining navigation-like disclosure triangles, clearer work visibility, and casual Indonesian copy. Keep all data, publication logic and public-facing portfolio content intact. Session antislop mode remains after.

Findings addressed:
- A stale local build still displayed the previous Video Source form. The current source already used SettingsDisclosure; final review used a fresh production build on localhost:3022.
- BlockEditor retained a raw browser details marker. It now has a Lucide downward chevron with native expanded state, keyboard support and reduced-motion behavior. Global admin summary styles suppress browser triangle markers. Overview's daily-detail section now reuses SettingsDisclosure instead of its separate chevron implementation. Website/CV and visual-editor panels contain no native disclosure controls to migrate. Legacy gallery and portfolio pages redirect to Works, preserving a single management surface.
- Tampilkan karya did not explain its relationship to publish. It is now Tampilkan di portfolio with short state-dependent text: selection takes effect after Publikasikan; hiding keeps the data. The boolean, draft handling and public filtering are unchanged.
- Mobile sticky toolbars used a translucent global surface and broke action words. They now use the existing opaque admin canvas and wrap complete buttons rather than splitting labels.
- Login, Overview, Works, Website/CV, visual-editor hints, block empty states, upload messages and error recovery use concise friendly Indonesian. Critical action labels remain Simpan draft and Publikasikan. Existing template contents, public copy, project descriptions and stored CV data are not rewritten.

Validation: production build including lint/types passed; 33 regression tests passed; scoped detector returned no findings. Browser checks covered authenticated Works/video, Website/CV, Overview, homepage visual-editor preview and a temporary unsaved case/block. Enter/Space toggling worked and summary marker style was none. Desktop at 1280px and Works at 390px showed no document overflow. Toolbar buttons fit their text and the canvas background resolved to opaque rgb(12,16,21). Visibility was unchecked/rechecked and returned to the clean saved state; the temporary block draft was canceled. No CMS save, publish, upload or storage mutation occurred. An unauthenticated GET confirmed updated login copy and preserved password autocomplete. Screenshots live in .impeccable/review/admin-clean/.

This is the requested admin presentation audit, not a claim of a full security, performance or WCAG certification. Current source removes native disclosure triangles; public preview content retains its own navigation assets.

The existing agent-started preview server at localhost:3020 was confirmed by process command line and restarted against the verified build, so the user's existing preview address can load the current UI without moving to a new port. User development servers on ports 3001/3002 were not touched.
