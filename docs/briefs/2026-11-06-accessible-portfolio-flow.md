# Public and admin interaction refinement

The owner requested implementation of the specified CRUD, media feedback, login, project exploration, PAR summary, navigation, contrast, touch-target and alternate contact improvements. Testimonials were explicitly removed from scope in the follow-up answer.

## Scope and visual decisions

- Preserve Manrope, the dark public canvas, orange actions and existing CMS surface identity. Use the requested #FF4500 only for project hover/focus affordance, with elevation on pointer hover and no animation under reduced motion.
- Reuse native modal dialogs and the admin toast provider. Destructive confirmation starts at Batal and returns focus to the row menu on cancellation. Nothing reaches the trash API before confirmation.
- Image uploads show an indeterminate animated state while the server stores the file; do not fabricate a percentage. Video uploads retain real transfer progress. One visual progress location follows the upload into its media picker. Failures retain a retry action and also notify through the toast provider.
- Keep the existing whole-card case-study anchor. Design artwork and video continue opening their respective preview experiences rather than being forced into nonexistent case-study URLs.
- Homepage filters search the complete published snapshot, including unfeatured apps. All initially retains the selected homepage composition; interacting with filters/search explores the full collection. /works opens the complete collection. Existing /webapp, /design and /video URLs remain valid and use instant filters.
- Category filters are native pressed buttons, with a named search field and polite result count. Server-rendered links remain usable before enhancement; collection pages retain category navigation without JavaScript.
- All four collection routes render dynamically from the shared tagged public-data cache. Do not freeze an additional collection snapshot at build time: production QA caught an old eight-item static page while the public API already returned thirteen items. The existing data-cache TTL and publication invalidation remain unchanged.
- Place Problem, Approach and Result before cover/documentation in default pages, saved visual layouts and authenticated previews. Use existing story fields and reported metrics only.
- Scroll-spy computes active links separately for desktop and mobile navigation so mobile subcategories cannot clear the desktop Selected works indicator.
- Copy email reads the owner's configured CV email, displays a top-right status and offers a selectable address when clipboard access is unavailable.

## Verification boundaries

Use isolated API fixtures for upload/authentication tests. Do not delete, upload or publish real CMS records during verification. Browser QA may open the trash confirmation and cancel it.

Contrast checks use the WCAG relative-luminance formula: secondary text, workflow numbers, destructive labels and orange-button text are tested against their backgrounds. This targeted work is not a certification of every legacy page, image or custom CMS stylesheet.

References:
- https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/

The Impeccable detector's existing design-sidecar drift and dynamic-image spread warnings were reviewed. Responsive thumbnail helpers supply valid src/srcset; no image source is missing in those conditional branches. Refreshing the design sidecar remains a separate documentation operation.
