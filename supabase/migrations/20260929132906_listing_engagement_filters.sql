-- Searchable engagement categories. This does not create an employment
-- contract or authorize agency staffing; those require separate checks.
alter table public.listings
  add column if not exists engagement_mode text not null default 'short_job'
    check (engagement_mode in ('short_job','multi_day','fixed_term','permanent')),
  add column if not exists foreign_workers_welcome boolean not null default false;
alter table public.profiles
  add column if not exists is_foreign_worker boolean not null default false;

create index if not exists listings_active_engagement_created_idx
  on public.listings (engagement_mode, created_at desc)
  where status = 'active' and type in ('request','urgent');
create index if not exists listings_active_foreign_worker_idx
  on public.listings (created_at desc)
  where status = 'active' and foreign_workers_welcome = true;
