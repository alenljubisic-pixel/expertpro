-- Counts are derived from mutually confirmed applications, never from a
-- listing being assigned or from a user-editable profile field.
create index if not exists applications_completed_applicant_idx
  on public.applications (applicant_id, completed_at desc)
  where completed_at is not null;
create index if not exists applications_completed_listing_idx
  on public.applications (listing_id, completed_at desc)
  where completed_at is not null;

create or replace function public.completed_job_count(p_user_id uuid)
returns bigint language sql stable security definer set search_path = '' as $$
  select count(*) from public.applications a
  join public.listings l on l.id = a.listing_id
  where a.completed_at is not null
    and (a.applicant_id = p_user_id or l.user_id = p_user_id);
$$;
revoke all on function public.completed_job_count(uuid) from public, anon, authenticated;
grant execute on function public.completed_job_count(uuid) to anon, authenticated;

create or replace function public.my_completed_jobs()
returns table (listing_id uuid, title text, my_role text, completed_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Potrebna je prijava.'; end if;
  return query
  select l.id, l.title,
    case when (l.type = 'offer' and l.user_id = auth.uid())
           or (l.type <> 'offer' and a.applicant_id = auth.uid())
      then 'izvodjac' else 'klijent' end,
    a.completed_at
  from public.applications a
  join public.listings l on l.id = a.listing_id
  where a.completed_at is not null
    and (a.applicant_id = auth.uid() or l.user_id = auth.uid())
  order by a.completed_at desc
  limit 20;
end;
$$;
revoke all on function public.my_completed_jobs() from public, anon, authenticated;
grant execute on function public.my_completed_jobs() to authenticated;

-- Replace the legacy multiplicative joins with independent aggregates.
create or replace function public.admin_get_user_stats_v2(p_user_ids uuid[])
returns table (
  id uuid, active_listings bigint, total_listings bigint,
  completed_as_worker bigint, completed_as_client bigint,
  credits_paid_total numeric, credits_pending_total numeric,
  promotions_paid_total numeric, promotions_pending_total numeric
) language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin
  ) then raise exception 'Samo admin može da vidi statistiku korisnika.'; end if;
  if coalesce(array_length(p_user_ids, 1), 0) > 100 then
    raise exception 'Najviše 100 korisnika po zahtevu.';
  end if;

  return query
  with listing_stats as (
    select l.user_id, count(*) as total_count,
      count(*) filter (where l.status = 'active') as active_count
    from public.listings l where l.user_id = any(p_user_ids) group by l.user_id
  ), job_events as (
    select a.applicant_id as user_id,
      (l.type <> 'offer')::int as worker,
      (l.type = 'offer')::int as client
    from public.applications a join public.listings l on l.id = a.listing_id
    where a.completed_at is not null and a.applicant_id = any(p_user_ids)
    union all
    select l.user_id,
      (l.type = 'offer')::int,
      (l.type <> 'offer')::int
    from public.applications a join public.listings l on l.id = a.listing_id
    where a.completed_at is not null and l.user_id = any(p_user_ids)
  ), job_stats as (
    select je.user_id, sum(je.worker) as worker_count, sum(je.client) as client_count
    from job_events je group by je.user_id
  ), credit_stats as (
    select cp.user_id,
      coalesce(sum(cp.price_amount) filter (where cp.status = 'paid_confirmed'),0) as paid,
      coalesce(sum(cp.price_amount) filter (where cp.status in ('pending_payment','user_confirmed')),0) as pending
    from public.credit_purchases cp where cp.user_id = any(p_user_ids) group by cp.user_id
  ), promo_stats as (
    select lp.user_id,
      coalesce(sum(lp.price_amount) filter (where lp.status = 'paid_confirmed'),0) as paid,
      coalesce(sum(lp.price_amount) filter (where lp.status in ('pending_payment','user_confirmed')),0) as pending
    from public.listing_promotions lp where lp.user_id = any(p_user_ids) group by lp.user_id
  )
  select p.id, coalesce(ls.active_count,0), coalesce(ls.total_count,0),
    coalesce(js.worker_count,0), coalesce(js.client_count,0),
    coalesce(cs.paid,0), coalesce(cs.pending,0),
    coalesce(ps.paid,0), coalesce(ps.pending,0)
  from public.profiles p
  left join listing_stats ls on ls.user_id = p.id
  left join job_stats js on js.user_id = p.id
  left join credit_stats cs on cs.user_id = p.id
  left join promo_stats ps on ps.user_id = p.id
  where p.id = any(p_user_ids);
end;
$$;
revoke all on function public.admin_get_user_stats_v2(uuid[]) from public, anon, authenticated;
grant execute on function public.admin_get_user_stats_v2(uuid[]) to authenticated;
