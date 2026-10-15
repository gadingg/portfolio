# Gading Utama — Personal Portfolio

## Secure CMS setup

1. Create one email/password user in Supabase Auth.
2. Copy `.env.example` to `.env.local` and set `ADMIN_EMAIL` to that exact email.
3. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
4. Apply `supabase/migrations/004_secure_cms.sql` to the production project.
5. Run `npm run audit:supabase` and Supabase Security Advisor. Confirm browser roles cannot mutate portfolio rows, call CMS RPCs, or write Storage objects.

If `ADMIN_EMAIL` is missing, admin access fails closed. Set the same value in `.env.local` and the deployment environment.

Admin writes go through authenticated Next.js API routes. Projects and the legacy gallery use PostgreSQL functions; the Works collection uses a JSON document in Supabase Storage.


Repositori portofolio digital interaktif karya **Gading Utama** (Marketing Communication & Creative Systems).

## Architecture

- Next.js App Router serves the portfolio, case studies, CV, API routes, and private CMS.
- `public/index.html` is the current homepage template and is served by `app/route.ts`.
- Tailwind is compiled at build time to `public/assets/css/portfolio.css`.
- The public showcase uses locally hosted fonts, a Lucide sprite and native dialogs. Carousels respect `prefers-reduced-motion`.
- Supabase stores projects, content blocks, gallery items, media, and the curated Works collection.

## Manage Selected Works

Open `/admintgadink/dashboard/works` after signing in. Choose Website / Apps, Visual Design, or Branding & Video. Expand a card to edit its title, description, image, alt text, link, visibility, or example label. Upload JPG/PNG/WebP/GIF covers, use Naik/Turun to change order, then select **Simpan perubahan**. Deletion and edits can be undone before saving. Only the first six visible web apps appear on the homepage; `/webapp`, `/design`, and `/video` show complete collections.

Before the first save, the collection combines existing published projects and non-template gallery content with supplied app links and clearly labeled examples. The first save records that selection at `portfolio-public/content/works.json`. After that, Works is the source for collection cards; Portfolio Projects still edits the linked case-study pages. The old Visual Gallery remains available without overwriting its records.

The Works document contains only public portfolio content. Hiding an entry removes it from public lists, but the backing bucket is public; it is not private draft storage. Saving checks a revision to catch stale edits from another session, though Storage does not provide transactional compare-and-swap for this operation. Use one editing session at a time. A missing document initializes defaults; a saved empty collection stays empty, and permission/network failures display a retry instead of silently replacing content.

For videos, replace the example with an HTTPS Instagram `/reel/`, `/p/`, or `/tv/` link, upload its thumbnail, and remove **data contoh**. Only the selected embed loads after a click; closing it removes the player. Instagram controls playback and may require another Play tap or deny an embed. An **Open on Instagram** fallback is provided. Samples do not impersonate live Instagram videos.

No database migration is needed for Works. The existing `portfolio-public` bucket must allow JSON uploads from the server service role. `ADMIN_EMAIL`, Supabase Auth, and server credentials are required as described above. Run `npm run test:works` for validation, access-control, conflict, public-filtering, and storage-adapter tests.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Use `npm run typecheck` and `npm run build` before deployment.
