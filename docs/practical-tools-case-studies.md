# Three practical tools case studies

Delivered 5 November 2026. Scope: Prompt Generator Patosser, Follow Up & Blasting Patosser, Rekap Ella. Existing project records, drafts, homepage selections, styling and renderer were preserved.

## Public and admin integration

- `/work/prompt`, `/work/followup`, `/work/rekapella` are published through the existing CMS. Supabase works revision 65 was read back and matched the intended draft and published snapshots.
- New items follow the existing web apps. Rekap Ella links back to Listing Hub. Homepage selection is unchanged, including compatibility with legacy records that have no explicit homepage selection flag.
- Content uses standard heading, paragraph and image blocks. The existing form supports replacing the cover and detail image, editing all text, and reordering blocks. The Prompt editor was checked in the authenticated local admin.
- Eighteen immutable assets were uploaded to Supabase Storage. Published content uses those URLs, so it does not wait for a Git deployment to load new local assets.
- The initial post-write 404 was the existing 60-second published-content cache. Reload after refresh displayed the new projects. No route implementation change was needed.

## Content and provenance

English section headings and casual-professional Indonesian body copy follow the current portfolio. No measured time savings, conversion uplift or invented achievements are claimed.

Prompt and Follow Up visuals use multiple browser captures from the user-provided live URLs. Prompt property input is illustrative. No AI image generation, message sending or template creation was submitted during capture.

Rekap Ella visuals are explicitly labeled UI reconstructions with illustrative names, hours, dates and amounts. The Telegram panel illustrates owner-confirmed functionality; it is not a screenshot of an actual conversation. No private learner or payroll capture is included in the assets.

## Motion

Six editable HyperFrames projects provide desktop and mobile sequences, each 12 seconds at 30 fps with four UI states. Silent H.264 MP4s are approximately 0.39 to 0.46 MB each, with faststart metadata and separate static posters. They reuse the existing lazy, muted, looping player and its reduced-motion behavior.

These are animated screen walkthroughs, not uninterrupted session recordings. Source projects are under `motion/case-studies/`; the asset builder is `scripts/build-practical-tools.cjs`.

## Validation

- TypeScript check passed.
- Fourteen focused tests passed across practical-tools content, case navigation, case motion and admin editing. The new tests cover schema, editable blocks, unique short slugs, duplicate protection, existing record/order preservation and legacy/manual homepage selection.
- All six HyperFrames checks passed. The two intentional warnings concern repeated first/last media for a loop and GSAP initial visibility on inner screens.
- All six media validations passed: dimensions, duration, codec, no audio, size, faststart and first/last-frame continuity. Maximum sampled loop MAE was 0.324 at 96 × 54.
- Browser QA: Prompt local and production; Follow Up production desktop; Rekap Ella production mobile. No page-level horizontal overflow at 390 or 1280 px in checked pages. Visible images loaded, mobile and desktop MP4s reached readyState 4, were unpaused, muted and looping. The Follow Up next card navigated to Rekap Ella; its next link points to Listing Hub.
- Authenticated local admin displayed the new Prompt record and its editable cover, overview, ordered story blocks and replaceable detail image. No destructive editor actions were performed.

Evidence is in ignored `.impeccable/review/`: contact sheets, encode/check JSON, `prompt-admin.jpg`, `prompt-live-mobile.jpg`, `rekapella-live-mobile.jpg`, `followup-live-desktop.jpg`. Screenshots of motion may show an intermediate crossfade.

## Antislop delivery gate

Applies to these three additions, not a fresh audit of unrelated existing pages. Design read: existing dark editorial portfolio, Manrope typography, orange action accents, light screen mockups. Dials: ENERGY 1 / RHYTHM 2 / MOTION 1. Motion explains the product states rather than decorating the page.

| Gate | Status and evidence |
| --- | --- |
| R-02 | PASS: content test rejects em and en dashes in the new case copy. |
| R-03 | PASS: browser overflow checks at 390 and 1280 px returned false; reviewed responsive frames preserve source proportions. |
| R-17, R-18, R-36, R-38 | PASS: no fabricated testimonials or performance metrics; Ella illustration is explicitly labeled and separated from real user data. |
| R-23 | PASS: user authorized mockups and confirmed features; actual screen captures or labeled reconstruction used. |
| R-24, R-26 | PASS: real app URLs and short case URLs; existing next-card interaction navigated correctly and wraps to Listing Hub. No new dead controls. |
| R-25 | PASS: unchanged editorial foreground/background styles; reviewed new screens and body copy remain readable. No new low-contrast page styles. |
| R-27 | PASS: existing loading and not-found states observed; existing media poster remains available before lazy video load. |
| R-28, R-34 | PASS: no FAQ or theme toggle introduced. |
| R-32 | PASS: standard semantic links and existing focus styles retained; no pointer-only interactive element introduced. |
| R-33 | PASS: source additions authored directly; builder generates dedicated media and compositions, not patches to application source. |
| R-35 | PASS: app run locally and live pages checked; focused tests, media checks and editor read-only verification recorded above. |
| R-37 | PASS: established design direction reused; explicit dials recorded above. |
| Purpose gate | PASS: no new page decoration, typography system, badges, gradients, icons or UI cards. Light frames isolate the app UI; subtle screen transitions explain the flow. Existing overview cards and Next Case Study arrow retain their established semantic use. |
| Liveliness | PASS: app UI is the focal point; overview, media and narrative create structural rhythm; orange remains the page accent; recurring editorial headings preserve identity. |
| C-1 to C-5 | PASS: each section explains an owner-confirmed problem or feature; existing controls/renderer reused; responsive evidence and illustration labels recorded above. |
| R-05, R-11, R-15, R-16, R-20, R-21, R-29 to R-31 | PASS: no new site template, pill system, generic marketing CTA, buzzword, theme or palette; app-specific captures and narrative distinguish the projects. |

## Limits

No live Telegram bot, PDF generation, WhatsApp send or external AI generation was exercised. Feature descriptions rely on the owner's confirmations and inspected UI. Captured Follow Up form includes the source app's narrow scrollbars. Git additions have not been committed or pushed in this task.
