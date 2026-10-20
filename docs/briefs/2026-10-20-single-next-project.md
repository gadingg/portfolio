# Single next-project footer

Mode Experience, refinement only. User replaces Explore More Work with one Next Project section. It must show the next item in the existing published order, wrap last to first, and offer exactly one Next Case Study CTA within a whole-card link. No UP NEXT cue, alternative suggestion, bespoke preview style or new decoration. Original content, artwork and destinations remain.

Selected Works currently renders cards through vanilla works.js, rather than an importable React card. The React case footer therefore uses its existing article/link/media/title/description/meta/destination class structure and the existing shared ProjectArtwork component. Common CSS owns4:3 thumbnail,12px radius, title/body type,2-line description,44px CTA area, orange interaction and reduced-motion behavior. Only a bridge fits ProjectArtwork to the existing media frame. No new card styling component or typography ramp is introduced.

The single card remains a vertical stack in the existing case narrative column on desktop and mobile. The heading uses the shared Works heading treatment with24px heading gap;48px separates navigation from narrative. Remove obsolete related/explore components and their custom CSS. Both standard and CMS visual-layout case branches render the same NextProjectNav. Request memoization, disabled speculative prefetch and short canonical paths from the preceding loading fix remain.

Current screenshots and physical browser navigation remain unavailable due session CUA initialization failure. Source/SSR/HTTP tests are distinct from visual approval. No CMS write or unrelated section change.
