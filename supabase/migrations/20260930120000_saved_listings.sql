-- Lets a signed-in user bookmark a listing ("sačuvaj u omiljeno") to find it
-- again later, without messaging anyone or affecting the listing itself.
create table if not exists public.saved_listings (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create index if not exists saved_listings_listing_id_idx on public.saved_listings(listing_id);

alter table public.saved_listings enable row level security;

drop policy if exists "Users manage own saved listings" on public.saved_listings;
create policy "Users manage own saved listings" on public.saved_listings
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on public.saved_listings from public, anon;
grant select, insert, delete on public.saved_listings to authenticated;
