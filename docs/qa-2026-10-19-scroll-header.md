# Scrolling public header QA

Scope: owner-requested soft glass header on public homepage, collections and case studies.

- Production Next.js build passed, including lint/type checks and page generation.
- `node --check public/assets/js/showcase.js` and `git diff --check` passed.
- Production server at localhost:3002: desktop 1120px and mobile 390px checked with native scrolling. Homepage solid top -> glass -> solid top passed. Desktop header height remained 76.67px in both states; mobile glass header height 60.67px.
- Computed glass: rgba(6, 7, 6, 0.76), blur(16px) saturate(1.2). Top: rgb(6, 7, 6), no backdrop filter.
- Mobile menu opened and closed while scrolled. Collection `/webapp` and case `/work/internal-listing-hub` passed top -> glass -> top transitions using the shared React header.
- Source check: passive listeners; React cleanup; pageshow restores state; unsupported backdrop-filter stays opaque; forced colors removes blur; reduced motion removes color transition.
- Screenshots: `.impeccable/review/glass-header-2026-10-19/header-top-desktop.png`, `header-glass-desktop.png`, `header-glass-mobile.png`, `header-glass-case.png`.

No dependencies or content changes. No production CMS writes. Local build and browser checks do not establish Vercel deployment status.

Independent Impeccable finish review: `disposition: ship`; no material fixes. Reviewed desktop/mobile and case screenshots, source lifecycle, fallback, readability and design persistence.
