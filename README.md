# Gading Utama — Personal Portfolio

## Secure CMS setup

1. Create one email/password user in Supabase Auth.
2. Copy `.env.example` to `.env.local` and set `ADMIN_EMAIL` to that exact email.
3. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
4. Apply `supabase/migrations/004_secure_cms.sql` to the production project.
5. Run `npm run audit:supabase` and Supabase Security Advisor. Confirm browser roles cannot mutate portfolio rows, call CMS RPCs, or write Storage objects.

If `ADMIN_EMAIL` is missing, admin access fails closed. Set the same value in `.env.local` and the deployment environment.

The CMS uses Supabase as its only runtime data source. Admin writes go through authenticated Next.js API routes and atomic PostgreSQL functions.


Repositori portofolio digital interaktif karya **Gading Utama** (Marketing Communication & Creative Systems).

## Architecture

- Next.js App Router serves the portfolio, case studies, CV, API routes, and private CMS.
- `public/index.html` is the current homepage template and is served by `app/route.ts`.
- Tailwind is compiled at build time to `public/assets/css/portfolio.css`.
- GSAP and ScrollTrigger load from local assets. The homepage respects `prefers-reduced-motion`.
- Supabase is the only runtime source for projects, content blocks, gallery items, and media.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Use `npm run typecheck` and `npm run build` before deployment.
