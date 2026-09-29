-- Legacy application RPCs require a signed-in user. Trigger functions should
-- never be directly callable through the public REST API.
revoke all on function public.confirm_application(uuid) from public, anon, authenticated;
revoke all on function public.decline_application(uuid) from public, anon, authenticated;
revoke all on function public.select_application_candidate(uuid) from public, anon, authenticated;
revoke all on function public.unselect_application_candidate(uuid) from public, anon, authenticated;

grant execute on function public.confirm_application(uuid) to authenticated;
grant execute on function public.decline_application(uuid) to authenticated;
grant execute on function public.select_application_candidate(uuid) to authenticated;
grant execute on function public.unselect_application_candidate(uuid) to authenticated;

revoke all on function public.enforce_urgent_credits() from public, anon, authenticated;
revoke all on function public.grant_subscription_credit_bonus() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.notify_new_application() from public, anon, authenticated;
revoke all on function public.notify_new_message() from public, anon, authenticated;
revoke all on function public.notify_new_review() from public, anon, authenticated;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;
revoke all on function public.update_profile_rating() from public, anon, authenticated;

-- Supabase Auth inserts users through this database role.
grant execute on function public.handle_new_user() to supabase_auth_admin;
