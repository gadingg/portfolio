# Whole-site CMS direction

Approved by the user on 16 October 2026:

- CMS scope includes Works, case studies, hero, About, contact, and CV.
- Multiple-image uploads, sortable Works, and sortable case-study blocks.
- Save drafts separately; explicit Publish action. Works order saves automatically.
- Admin uses concise labels and actionable states; remove repeated helper paragraphs.
- Preserve the approved public artwork-led layout, three Works categories, collection URLs, visual carousel, and Instagram-on-tap behavior.

Admin mode: Operate. Retain incumbent admin tokens, calm task-focused hierarchy, and functional drag motion (energy 1, rhythm 1, motion 1). Public identity is preserved. No new visual assets or brand claims are required.

Implementation: one private database document each for Works and Site, atomic revision checks, separate published snapshots, a private media bucket, and a public media proxy that serves only references in visible published content. Existing project/gallery tables remain as archived migration sources. Legacy admin entry URLs redirect to Works; obsolete mutation APIs return an authenticated 410 rather than updating disconnected data.

Auth boundary: the user approved the existing confirmed Supabase Auth account rgadingutama@gmail.com on 2026-10-16; ADMIN_EMAIL is configured locally. Do not reset passwords, mint an admin session for the user, or relax authentication to perform QA. Component fixture testing and simulated authorization must be identified as such. Production environment configuration and an actual user login remain to be verified.

Verification includes actual database draft/save/publish/order/conflict roundtrips with exact restoration, actual Storage upload and privacy/proxy checks, unauthenticated guards, responsive component/browser testing, and a production build. An actual email/password login and subsequent authenticated browser session remain a separate required check after account configuration.
