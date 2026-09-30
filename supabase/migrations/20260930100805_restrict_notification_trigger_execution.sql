-- Trigger functions are not API endpoints.
revoke all on function public.set_notification_suppressed() from public, anon, authenticated;
