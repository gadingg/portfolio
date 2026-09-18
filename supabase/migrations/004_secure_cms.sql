-- Public reads only; every CMS mutation runs on the server with service_role.
do $$
declare item record;
begin
  for item in select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public' and tablename in (
      'portfolio_projects', 'portfolio_content_blocks', 'portfolio_gallery',
      'portfolio_tags', 'portfolio_project_tags', 'portfolio_media'
    )
  loop
    execute format('drop policy if exists %I on %I.%I', item.policyname, item.schemaname, item.tablename);
  end loop;
end $$;

alter table public.portfolio_projects enable row level security;
alter table public.portfolio_content_blocks enable row level security;
alter table public.portfolio_gallery enable row level security;
alter table public.portfolio_tags enable row level security;
alter table public.portfolio_project_tags enable row level security;
alter table public.portfolio_media enable row level security;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.update_updated_at_column() from public, anon, authenticated;
grant execute on function public.update_updated_at_column() to service_role;

revoke all on table public.portfolio_projects from public, anon, authenticated;
revoke all on table public.portfolio_content_blocks from public, anon, authenticated;
revoke all on table public.portfolio_gallery from public, anon, authenticated;
revoke all on table public.portfolio_tags from public, anon, authenticated;
revoke all on table public.portfolio_project_tags from public, anon, authenticated;
revoke all on table public.portfolio_media from public, anon, authenticated;

create policy "Public reads published projects" on public.portfolio_projects
for select to anon, authenticated using (status = 'published');
create policy "Public reads published blocks" on public.portfolio_content_blocks
for select to anon, authenticated using (exists (
  select 1 from public.portfolio_projects p
  where p.id = portfolio_content_blocks.project_id and p.status = 'published'
));
create policy "Public reads gallery" on public.portfolio_gallery
for select to anon, authenticated using (true);

grant select on table public.portfolio_projects to anon, authenticated;
grant select on table public.portfolio_content_blocks to anon, authenticated;
grant select on table public.portfolio_gallery to anon, authenticated;

grant all on table public.portfolio_projects to service_role;
grant all on table public.portfolio_content_blocks to service_role;
grant all on table public.portfolio_gallery to service_role;
grant all on table public.portfolio_tags to service_role;
grant all on table public.portfolio_project_tags to service_role;
grant all on table public.portfolio_media to service_role;

create or replace function public.save_portfolio_project(project_data jsonb, blocks_data jsonb default '[]'::jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare saved public.portfolio_projects; target_id uuid;
begin
  if jsonb_typeof(blocks_data) <> 'array' then raise exception 'blocks_data must be an array'; end if;
  target_id := nullif(project_data->>'id', '')::uuid;
  if target_id is null then
    insert into public.portfolio_projects (
      title, slug, subtitle, description, category, cover_image_url, cover_image_alt,
      year, status, is_featured, display_order, client, role, duration, services, published_at
    ) values (
      project_data->>'title', project_data->>'slug', nullif(project_data->>'subtitle', ''),
      project_data->>'description', project_data->>'category', project_data->>'cover_image_url',
      nullif(project_data->>'cover_image_alt', ''), nullif(project_data->>'year', ''),
      coalesce(project_data->>'status', 'draft'), coalesce((project_data->>'is_featured')::boolean, false),
      coalesce((project_data->>'display_order')::integer, 0), nullif(project_data->>'client', ''),
      nullif(project_data->>'role', ''), nullif(project_data->>'duration', ''),
      case when project_data ? 'services' then array(select jsonb_array_elements_text(coalesce(project_data->'services', '[]'))) else null end,
      case when project_data->>'status' = 'published' then now() else null end
    ) returning * into saved;
  else
    update public.portfolio_projects set
      title = coalesce(project_data->>'title', title), slug = coalesce(project_data->>'slug', slug),
      subtitle = case when project_data ? 'subtitle' then nullif(project_data->>'subtitle', '') else subtitle end,
      description = coalesce(project_data->>'description', description), category = coalesce(project_data->>'category', category),
      cover_image_url = coalesce(project_data->>'cover_image_url', cover_image_url),
      cover_image_alt = case when project_data ? 'cover_image_alt' then nullif(project_data->>'cover_image_alt', '') else cover_image_alt end,
      year = case when project_data ? 'year' then nullif(project_data->>'year', '') else year end,
      status = coalesce(project_data->>'status', status),
      is_featured = coalesce((project_data->>'is_featured')::boolean, is_featured),
      display_order = coalesce((project_data->>'display_order')::integer, display_order),
      client = case when project_data ? 'client' then nullif(project_data->>'client', '') else client end,
      role = case when project_data ? 'role' then nullif(project_data->>'role', '') else role end,
      duration = case when project_data ? 'duration' then nullif(project_data->>'duration', '') else duration end,
      services = case when project_data ? 'services' then array(select jsonb_array_elements_text(coalesce(project_data->'services', '[]'))) else services end,
      published_at = case when project_data->>'status' = 'published' then coalesce(published_at, now()) when project_data->>'status' = 'draft' then null else published_at end
    where id = target_id returning * into saved;
    if saved.id is null then raise exception 'Project not found'; end if;
  end if;
  delete from public.portfolio_content_blocks where project_id = saved.id;
  insert into public.portfolio_content_blocks (project_id, block_type, block_order, content_json)
  select saved.id, coalesce(block->>'block_type', 'paragraph'),
    coalesce((block->>'block_order')::integer, ordinality::integer), coalesce(block->'content_json', '{}')
  from jsonb_array_elements(blocks_data) with ordinality as item(block, ordinality);
  return to_jsonb(saved);
end $$;

create or replace function public.replace_portfolio_gallery(gallery_data jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if jsonb_typeof(gallery_data) <> 'array' then raise exception 'gallery_data must be an array'; end if;
  delete from public.portfolio_gallery;
  insert into public.portfolio_gallery (id, url, alt, caption, category, display_order)
  select item->>'id', item->>'url', coalesce(item->>'alt', ''), coalesce(item->>'caption', ''),
    coalesce(item->>'category', 'Visual'), coalesce((item->>'display_order')::integer, ordinality::integer)
  from jsonb_array_elements(gallery_data) with ordinality as entry(item, ordinality);
end $$;

revoke all on function public.save_portfolio_project(jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.replace_portfolio_gallery(jsonb) from public, anon, authenticated;
grant execute on function public.save_portfolio_project(jsonb, jsonb) to service_role;
grant execute on function public.replace_portfolio_gallery(jsonb) to service_role;

-- Public buckets serve files by URL. Only service_role may mutate objects.
drop policy if exists "Public Read Access" on storage.objects;
drop policy if exists "Admin Upload Access" on storage.objects;
drop policy if exists "Admin Update Access" on storage.objects;
drop policy if exists "Admin Delete Access" on storage.objects;
create policy "Public Read Access" on storage.objects
for select to anon, authenticated using (bucket_id = 'portfolio-public');
