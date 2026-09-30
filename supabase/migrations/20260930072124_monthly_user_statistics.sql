-- Calendar months use Europe/Belgrade boundaries; timestamps remain UTC.
create or replace function public.completed_job_count_monthly(p_user_id uuid, p_month date)
returns bigint language sql stable security definer set search_path = '' as $$
  select count(*) from public.applications a
  join public.listings l on l.id = a.listing_id
  where a.completed_at >= (date_trunc('month', p_month::timestamp) at time zone 'Europe/Belgrade')
    and a.completed_at < ((date_trunc('month', p_month::timestamp) + interval '1 month') at time zone 'Europe/Belgrade')
    and (a.applicant_id = p_user_id or l.user_id = p_user_id);
$$;
revoke all on function public.completed_job_count_monthly(uuid,date) from public, anon, authenticated;
grant execute on function public.completed_job_count_monthly(uuid,date) to anon, authenticated;

create or replace function public.my_completed_jobs_monthly(p_month date)
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
  from public.applications a join public.listings l on l.id = a.listing_id
  where a.completed_at >= (date_trunc('month', p_month::timestamp) at time zone 'Europe/Belgrade')
    and a.completed_at < ((date_trunc('month', p_month::timestamp) + interval '1 month') at time zone 'Europe/Belgrade')
    and (a.applicant_id = auth.uid() or l.user_id = auth.uid())
  order by a.completed_at desc limit 20;
end;
$$;
revoke all on function public.my_completed_jobs_monthly(date) from public, anon, authenticated;
grant execute on function public.my_completed_jobs_monthly(date) to authenticated;

create or replace function public.admin_get_user_stats_monthly(p_user_ids uuid[], p_month date)
returns table (
  id uuid, listings_posted bigint, completed_as_worker bigint, completed_as_client bigint,
  credits_paid_total numeric, credits_pending_total numeric,
  promotions_paid_total numeric, promotions_pending_total numeric
) language plpgsql stable security definer set search_path = '' as $$
declare
  v_start timestamptz := date_trunc('month', p_month::timestamp) at time zone 'Europe/Belgrade';
  v_end timestamptz := (date_trunc('month', p_month::timestamp) + interval '1 month') at time zone 'Europe/Belgrade';
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin
  ) then raise exception 'Samo admin može da vidi statistiku korisnika.'; end if;
  if p_month is null or coalesce(array_length(p_user_ids, 1), 0) > 100 then
    raise exception 'Neispravan mesec ili previše korisnika.';
  end if;

  return query
  with listing_stats as (
    select l.user_id, count(*) as posted
    from public.listings l
    where l.user_id = any(p_user_ids) and l.created_at >= v_start and l.created_at < v_end
    group by l.user_id
  ), jobs as (
    select a.applicant_id as user_id,
      (l.type <> 'offer')::int as worker, (l.type = 'offer')::int as client
    from public.applications a join public.listings l on l.id = a.listing_id
    where a.completed_at >= v_start and a.completed_at < v_end
      and a.applicant_id = any(p_user_ids)
    union all
    select l.user_id, (l.type = 'offer')::int, (l.type <> 'offer')::int
    from public.applications a join public.listings l on l.id = a.listing_id
    where a.completed_at >= v_start and a.completed_at < v_end
      and l.user_id = any(p_user_ids)
  ), job_stats as (
    select j.user_id, sum(j.worker) as worker_count, sum(j.client) as client_count
    from jobs j group by j.user_id
  ), credit_stats as (
    select cp.user_id,
      coalesce(sum(cp.price_amount) filter (where cp.status = 'paid_confirmed' and cp.confirmed_at >= v_start and cp.confirmed_at < v_end),0) as paid,
      coalesce(sum(cp.price_amount) filter (where cp.status in ('pending_payment','user_confirmed')),0) as pending
    from public.credit_purchases cp
    where cp.user_id = any(p_user_ids)
      and ((cp.confirmed_at >= v_start and cp.confirmed_at < v_end)
        or (cp.created_at >= v_start and cp.created_at < v_end))
    group by cp.user_id
  ), promo_stats as (
    select lp.user_id,
      coalesce(sum(lp.price_amount) filter (where lp.status = 'paid_confirmed' and lp.confirmed_at >= v_start and lp.confirmed_at < v_end),0) as paid,
      coalesce(sum(lp.price_amount) filter (where lp.status in ('pending_payment','user_confirmed')),0) as pending
    from public.listing_promotions lp
    where lp.user_id = any(p_user_ids)
      and ((lp.confirmed_at >= v_start and lp.confirmed_at < v_end)
        or (lp.created_at >= v_start and lp.created_at < v_end))
    group by lp.user_id
  )
  select p.id, coalesce(ls.posted,0), coalesce(js.worker_count,0), coalesce(js.client_count,0),
    coalesce(cs.paid,0), coalesce(cs.pending,0), coalesce(ps.paid,0), coalesce(ps.pending,0)
  from public.profiles p
  left join listing_stats ls on ls.user_id = p.id
  left join job_stats js on js.user_id = p.id
  left join credit_stats cs on cs.user_id = p.id
  left join promo_stats ps on ps.user_id = p.id
  where p.id = any(p_user_ids);
end;
$$;
revoke all on function public.admin_get_user_stats_monthly(uuid[],date) from public, anon, authenticated;
grant execute on function public.admin_get_user_stats_monthly(uuid[],date) to authenticated;
