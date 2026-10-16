begin;
create table if not exists public.portfolio_cms_documents (
  id text primary key check (id in ('works', 'site')),
  draft jsonb not null,
  published jsonb not null,
  revision integer not null default 1,
  published_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.portfolio_cms_documents enable row level security;
revoke all on public.portfolio_cms_documents from public, anon, authenticated;
grant select, insert, update on public.portfolio_cms_documents to service_role;
comment on table public.portfolio_cms_documents is 'Private CMS drafts and published snapshots. Public APIs select only the published column on the server.';
create table if not exists public.portfolio_login_limits (key text primary key, attempts integer not null, expires_at timestamptz not null);
alter table public.portfolio_login_limits enable row level security;
revoke all on public.portfolio_login_limits from public, anon, authenticated;
grant select, insert, update, delete on public.portfolio_login_limits to service_role;
create or replace function public.portfolio_login_attempt(attempt_key text)
returns integer language plpgsql security invoker set search_path='' as $$
declare total integer;
begin
  delete from public.portfolio_login_limits where expires_at < now();
  insert into public.portfolio_login_limits(key,attempts,expires_at) values(attempt_key,1,now()+interval '5 minutes')
  on conflict(key) do update set attempts=public.portfolio_login_limits.attempts+1
  returning attempts into total;
  return total;
end $$;
revoke all on function public.portfolio_login_attempt(text) from public, anon, authenticated;
grant execute on function public.portfolio_login_attempt(text) to service_role;
commit;
