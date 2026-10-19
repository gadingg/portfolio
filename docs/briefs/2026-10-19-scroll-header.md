# Scroll header glass treatment

Mode: Experience. Owner requests a soft glass blur while scrolling, followed by commit and push.

Preserve the current header geometry, wordmark, links, mobile menu, typography and palette. At the top, use the existing solid canvas background. Beyond 16px scroll, use a 76% near-black background with 16px backdrop blur, 120% saturation and a quiet bottom rule. Return to solid at the top. Apply to homepage, collections and case studies, including restored scroll positions.

Keep native scrolling and passive listeners; clean up React listeners on unmount. Retain an opaque fallback without backdrop-filter support and a solid forced-colors treatment. Reduced motion removes the short color transition. No new library, decorative shadow, or layout change. Antislop remains after, as previously chosen.
