create or replace function public.admin_user_job_history_monthly(p_user_id uuid, p_month date)
returns table (listing_id uuid, title text, user_role text, completed_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.is_admin
  ) then raise exception 'Samo admin može da vidi istoriju poslova.'; end if;
  if p_month is null then raise exception 'Mesec je obavezan.'; end if;

  return query
  select l.id, l.title,
    case when (l.type = 'offer' and l.user_id = p_user_id)
           or (l.type <> 'offer' and a.applicant_id = p_user_id)
      then 'izvodjac' else 'klijent' end,
    a.completed_at
  from public.applications a join public.listings l on l.id = a.listing_id
  where a.completed_at >= (date_trunc('month', p_month::timestamp) at time zone 'Europe/Belgrade')
    and a.completed_at < ((date_trunc('month', p_month::timestamp) + interval '1 month') at time zone 'Europe/Belgrade')
    and (a.applicant_id = p_user_id or l.user_id = p_user_id)
  order by a.completed_at desc limit 100;
end;
$$;
revoke all on function public.admin_user_job_history_monthly(uuid,date) from public, anon, authenticated;
grant execute on function public.admin_user_job_history_monthly(uuid,date) to authenticated;
