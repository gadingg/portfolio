begin;
create table if not exists public.portfolio_engagement_events (
  event_id uuid primary key,
  event_type text not null check (event_type in ('work_open','design_open','video_open','contact_click','app_click')),
  work_id text check (length(work_id) <= 100),
  occurred_at timestamptz not null default now()
);
create index if not exists portfolio_engagement_time_idx on public.portfolio_engagement_events(occurred_at);
alter table public.portfolio_engagement_events enable row level security;
revoke all on public.portfolio_engagement_events from anon, authenticated;
grant select, insert on public.portfolio_engagement_events to service_role;

create or replace function public.portfolio_record_engagement(event_key uuid, event_kind text, work_key text default null)
returns boolean language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if event_kind not in ('work_open','design_open','video_open','contact_click','app_click') then return false; end if;
  perform pg_advisory_xact_lock(740617006);
  if (select count(*) from portfolio_engagement_events where occurred_at > now() - interval '1 minute') >= 1000 then return false; end if;
  insert into portfolio_engagement_events(event_id,event_type,work_id) values(event_key,event_kind,work_key) on conflict(event_id) do nothing;
  return true;
end;
$$;
revoke all on function public.portfolio_record_engagement(uuid,text,text) from public, anon, authenticated;
grant execute on function public.portfolio_record_engagement(uuid,text,text) to service_role;

create or replace function public.portfolio_engagement_summary(period_days integer default 30)
returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
with dates as (
  select generate_series((now() at time zone 'Asia/Jakarta')::date - (least(90,greatest(1,period_days))-1), (now() at time zone 'Asia/Jakarta')::date, interval '1 day')::date as day
), events as (
  select * from portfolio_engagement_events
  where occurred_at >= (((now() at time zone 'Asia/Jakarta')::date - (least(90,greatest(1,period_days))-1))::timestamp at time zone 'Asia/Jakarta')
), daily as (
  select dates.day, count(events.event_id)::integer as clicks from dates left join events on (events.occurred_at at time zone 'Asia/Jakarta')::date=dates.day group by dates.day order by dates.day
), types as (
  select event_type, count(*)::integer as clicks from events group by event_type
), popular as (
  select work_id,count(*)::integer as clicks from events where work_id is not null group by work_id order by clicks desc,work_id limit 8
)
select jsonb_build_object(
  'total',(select count(*) from events),
  'daily',coalesce((select jsonb_agg(jsonb_build_object('date',day,'clicks',clicks)) from daily),'[]'::jsonb),
  'types',coalesce((select jsonb_object_agg(event_type,clicks) from types),'{}'::jsonb),
  'popular',coalesce((select jsonb_agg(jsonb_build_object('id',work_id,'clicks',clicks)) from popular),'[]'::jsonb),
  'firstEventAt',(select min(occurred_at) from portfolio_engagement_events)
);
$$;
revoke all on function public.portfolio_engagement_summary(integer) from public, anon, authenticated;
grant execute on function public.portfolio_engagement_summary(integer) to service_role;
commit;
