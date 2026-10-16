# Gading Portfolio CMS

Next.js portfolio with a private Supabase-backed CMS. Public presentation emphasizes visual work and problem solving.

## Setup

1. Configure the public Supabase URL/key and server-only service role in `.env.local` and Vercel. Never expose the service role to browser code.
2. Set `ADMIN_EMAIL` to the authorized existing Supabase Auth email. Sign in with that account's password; missing configuration fails closed.
3. Apply `supabase/migrations/004_secure_cms.sql` and `005_cms_documents.sql` to the existing project.
4. Run `node scripts/initialize-cms.cjs` once. It imports the existing approved content, preserves initialized documents, creates the private media bucket, and does not remove legacy projects or gallery records.
5. Run `npm run dev` and open `/admintgadink`.

The existing production project is `portfolio-gading`, connected to `gadingg/portfolio`, branch `main`. A push triggers Vercel deployment. Database migrations and environment changes are separate from a Git push.

## Editing

- **Works:** Website / Apps, Visual Design, and Branding & Video. Drop multiple images to create hidden draft works, select an existing media asset, or edit an individual work. Add a case study to a web/app item to edit its problem, solution, outcome, and content blocks.
- **Website & CV:** hero, About, capabilities, process, tools, contact, search metadata, and CV content/PDF.
- **Simpan draft** changes private content. **Publikasikan** publishes the Works document or Site document being edited. Visibility changes and deletions become public only when that document is published.
- Drag handles support pointer, touch, and keyboard (Space, arrows, Space; Escape cancels). Works ordering saves automatically and updates the order of already published items without publishing draft fields. Case-study block order is part of the draft and is published with that work.
- Case-study slugs redirect from previous published slugs after a rename. Collection URLs remain `/webapp`, `/design`, and `/video`.
- Draft preview requires an authorized session. Save first, then open preview.

## Data and media

`portfolio_cms_documents` stores private draft and published snapshots for `works` and `site`. Browser database roles cannot read the table or call administrative RPCs. The server selects only the published column for public data. Updates compare the current revision in the same database update, so stale concurrent saves fail rather than overwriting changes.

New uploads are immutable files in the private `portfolio-cms-media` bucket. `/api/media/...` serves an asset to a signed-in administrator, or to an anonymous visitor only if a visible published item or published Site document references it. Unpublished images and CV PDFs are not public by URL. Existing public assets remain available in the shared media picker; no existing files are deleted by initialization.

Uploads support JPG, PNG, WebP, GIF, MP4, WebM, and PDF, with file-signature checks and a 4 MB per-file limit suitable for the Vercel request limit. Cover pickers accept images; the CV picker accepts PDF. The media picker lists both buckets with pagination and reports storage failures instead of substituting stock assets.

Instagram videos use public `/reel/`, `/p/`, or `/tv/` URLs. An embed loads after a tap and is removed on close. Instagram may require Play within its player or disallow embedding; an external fallback remains available.

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
