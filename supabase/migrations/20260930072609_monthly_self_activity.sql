create index if not exists listings_user_created_idx on public.listings (user_id, created_at desc);
create index if not exists applications_applicant_created_idx on public.applications (applicant_id, created_at desc);
create index if not exists reviews_reviewee_created_idx on public.reviews (reviewee_id, created_at desc);

create or replace function public.my_monthly_activity(p_month date)
returns table (listings_posted bigint, applications_sent bigint, reviews_received bigint)
language plpgsql stable security definer set search_path = '' as $$
declare
  v_start timestamptz := date_trunc('month', p_month::timestamp) at time zone 'Europe/Belgrade';
  v_end timestamptz := (date_trunc('month', p_month::timestamp) + interval '1 month') at time zone 'Europe/Belgrade';
begin
  if auth.uid() is null or p_month is null then raise exception 'Potrebna je prijava i mesec.'; end if;
  return query select
    (select count(*) from public.listings l where l.user_id = auth.uid() and l.created_at >= v_start and l.created_at < v_end),
    (select count(*) from public.applications a where a.applicant_id = auth.uid() and a.created_at >= v_start and a.created_at < v_end),
    (select count(*) from public.reviews r where r.reviewee_id = auth.uid() and r.moderated_at is null and r.created_at >= v_start and r.created_at < v_end);
end;
$$;
revoke all on function public.my_monthly_activity(date) from public, anon, authenticated;
grant execute on function public.my_monthly_activity(date) to authenticated;
