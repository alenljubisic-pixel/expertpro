-- A user can send a test push to their own subscribed device at most once
-- per minute. The cooldown column is server-controlled, not writable via REST.
alter table public.push_subscriptions add column last_test_at timestamptz;
revoke update on public.push_subscriptions from authenticated;
grant update(user_id,endpoint,p256dh,auth,updated_at)
  on public.push_subscriptions to authenticated;

create function public.claim_my_push_test(p_endpoint text)
returns table (endpoint text,p256dh text,auth text)
language sql security definer set search_path = '' as $$
  update public.push_subscriptions s
  set last_test_at=now()
  where s.user_id=(select auth.uid()) and s.endpoint=p_endpoint
    and (s.last_test_at is null or s.last_test_at<=now()-interval '1 minute')
  returning s.endpoint,s.p256dh,s.auth
$$;
revoke all on function public.claim_my_push_test(text) from public, anon, authenticated;
grant execute on function public.claim_my_push_test(text) to authenticated;
