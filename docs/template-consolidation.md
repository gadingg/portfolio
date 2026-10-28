# Template consolidation, 19 October 2026

## Owner decision

Use the `portfolio` design for the active website, with only What I Do taken from `portfo`. Retain the rest of `portfo` as an admin template archive. Keep the current CMS and selected UI QA fixes.

## Active presentation

The server reads `templates/active/homepage.html` and inserts `what-i-do.html` into its named placeholder. The source HTML is no longer exposed as `/index.html`. Homepage, admin preview, and visual editor share `renderHomepage`.

What I Do uses the original four-card composition, icons, and decorative mockups with the active site's Manrope and existing palette. Its styles are scoped under `.showcase .expertise-section`; the archived drawer and contact styles are excluded. Decorative illustrations remain hidden from assistive technology.

When saved CMS HTML contains `.capability-layout`, only that wrapper is replaced at render time. Already migrated bento markup is retained so visual edits survive. New `expertiseTitle0..3` keys default to the four approved titles; legacy capability fields remain in historical data but are no longer editor controls. No database migration, reset, save, or publication is required.

## Archive and public cleanup

`templates/portfo/source/` contains the original HTML, compiled and authored CSS, fonts with license, scripts, images, and videos from `portfo@5922cb2`. Source files are preserved unchanged. The admin preview rewrites asset URLs and adds an inactive-template notice at response time. `cmsAccess` authenticates every archive resource before any file read. Routes reject traversal, arbitrary file types, and files outside the archive. Responses use private/no-store and noindex headers; preview fetch/XHR, forms, and frames are blocked.

Legacy hero images/videos, duplicate GSAP files, and the old generated Tailwind stylesheet are removed from `public/`. Read-only checks confirmed neither Site nor Works draft/published snapshots referenced those assets. The visual editor's image template uses an existing active work image instead. The public GSAP vendor directory remains available for the active motion system.

## GitHub ownership and integration

The active destination is `https://github.com/gadingg/portfolio`, with `main` as its deployment branch. Work travels through a focused branch and pull request. GitHub Actions runs isolated regression tests and a production build, without CMS credentials. The archive is an ordinary versioned folder, not a submodule or dependency on the old repository.

In this existing multi-remote checkout, `portfolio` names the active remote and `origin` still identifies the original `portfo` checkout. Use `git push portfolio <branch>` explicitly. Do not change shared Git remotes or overwrite the original repository. A fresh clone of `gadingg/portfolio` naturally uses `origin` for the active application.

Vercel's existing production connection remains `gadingg/portfolio` / `main`. No repository deletion, GitHub repository archival, deployment-setting change, or database write is part of this consolidation.
