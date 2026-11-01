# Gading Portfolio CMS

Next.js portfolio with a private Supabase-backed CMS. Public presentation emphasizes visual work and problem solving.

## Visual editor

Open **Editor visual** for the homepage, or **Edit halaman studi kasus** from a work detail. Select text, an image, or a link in the canvas and edit it in the compact content panel. Sections can be added from templates, moved up/down or removed with confirmation. Device controls preview desktop/mobile layouts; technical style controls remain hidden. Images use the existing private upload/media library.

Drafts autosave privately after a two-second editing pause, with device recovery while offline. **Publish** saves the latest changes and publishes in one action. Case-study publishing updates the selected work while retaining other unpublished Works drafts. Existing pages retain their original rendering until a visual layout is published. Visual HTML/CSS is sanitized on the server; arbitrary scripts, forms, and external embeds cannot be inserted. Dynamic Works collections remain connected to the existing CMS.

Layout data uses the existing document JSON; no additional SQL migration is needed. Run `npm run test:visual` for the security and persistence regression tests, alongside `npm run test:works` and `npm run build`.

## Setup

1. Configure the public Supabase URL/key and server-only service role in `.env.local` and Vercel. Never expose the service role to browser code.
2. Set `ADMIN_EMAIL` to the authorized existing Supabase Auth email. Sign in with that account's password; missing configuration fails closed.
3. Apply `supabase/migrations/004_secure_cms.sql` and `005_cms_documents.sql` to the existing project.
4. Run `node scripts/initialize-cms.cjs` once. It imports the existing approved content, preserves initialized documents, creates the private media bucket, and does not remove legacy projects or gallery records.
5. Run `npm run dev` and open `/admintgadink`.

The existing production project is `portfolio-gading`, connected to `gadingg/portfolio`, branch `main`. A push triggers Vercel deployment. Database migrations and environment changes are separate from a Git push.

## Editing

- **Works:** Website / Apps, Visual Design, and Branding & Video. Drop multiple images to create private draft works, select an existing media asset, or edit an individual work. Add a case study to a web/app item to edit its problem, solution, outcome, and content blocks.
- **Website & CV:** hero, About, capabilities, process, tools, contact, search metadata, and CV content/PDF.
- Drafts autosave privately. **Publish** in a work detail publishes only that work, preserving other drafts and public order. **Publish semua** on the collection reviews all changed works and order before confirmation. Website & CV publication reviews which areas changed; the visual case editor publishes only that study. Offline drafts stay on the device and sync after reconnection. A different server revision offers backup download and never silently overwrites newer content.
- Drag handles support pointer, touch, and keyboard (Space, arrows, Space; Escape cancels). Works ordering autosaves to the private draft and becomes public only through collection publication. Case-study block order is part of the draft and is published with that work.
- Case-study slugs redirect from previous published slugs after a rename. Collection URLs remain `/webapp`, `/design`, and `/video`.
- Draft preview requires an authorized session and uses the latest server-saved draft. Wait for the automatic save status before opening the saved-page preview.

## Data and media

`portfolio_cms_documents` stores private draft and published snapshots for `works` and `site`. Browser database roles cannot read the table or call administrative RPCs. The server selects only the published column for public data. Updates compare the current revision in the same database update, so stale concurrent saves fail rather than overwriting changes.

New uploads are immutable files in the private `portfolio-cms-media` bucket. `/api/media/...` serves an asset to a signed-in administrator, or to an anonymous visitor only if a visible published item or published Site document references it. Unpublished images and CV PDFs are not public by URL. Existing public assets remain available in the shared media picker; no existing files are deleted by initialization.

Uploads support JPG, PNG, WebP, GIF, MP4, WebM, and PDF, with file-signature checks and a 4 MB per-file limit suitable for the Vercel request limit. Cover pickers accept images; the CV picker accepts PDF. The media picker lists both buckets with pagination and reports storage failures instead of substituting stock assets.

Choose File video or Instagram as the active video source. Switching retains the other source in the draft, while the published player uses the selected source. Existing items without a selection retain their previous behavior: file first when present, otherwise Instagram. File video needs a thumbnail before publication. Instagram videos use public `/reel/`, `/p/`, or `/tv/` URLs; an embed loads after a tap, and an external fallback remains available.

Legacy Portfolio/Gallery editor URLs redirect to Works. Their old write APIs are closed with authenticated HTTP 410 responses. The old database rows and approved brief remain intact as migration/archive sources.

## Validation

```sh
npm run test:works
npm run typecheck
npm run build
npm audit --omit=dev
node scripts/verify-cms-live.cjs
```

`node scripts/verify-cms-live.cjs --write-check` exercises real CMS persistence and Storage with disposable QA edits. It writes a local ignored backup, refuses to restore over an unexpected external revision, restores the original content, and removes its test media. Run it in a controlled editing window. Its media authorization is simulated; it does not prove a real user login.

The older `audit:supabase` command creates temporary rows/users and probes legacy role restrictions. Read its implementation before running it against production. It is not a read-only health check.

See `docs/cms-audit-2026-10-16.md` for the original audit and `docs/qa-2026-10-16-cms.md` for current validation and limits.
