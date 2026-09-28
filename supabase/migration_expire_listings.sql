-- =============================================
-- Auto-expiry: server-side function that flips old
-- listings to 'expired', called by a daily Vercel Cron.
-- Runs as SECURITY DEFINER so it can update listings
-- across all users without needing the service_role key
-- anywhere in the app.
-- Run this ONCE in Supabase Dashboard -> SQL Editor.
-- =============================================

create or replace function public.expire_old_listings()
returns integer as $$
declare
  updated_count integer;
begin
  update public.listings
  set status = 'expired'
  where status = 'active'
    and expires_at is not null
    and expires_at < now();
  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$ language plpgsql security definer;

-- Allow the anon/authenticated API roles to call it (the function itself
-- still only ever touches expired listings, nothing else).
grant execute on function public.expire_old_listings() to anon, authenticated;
