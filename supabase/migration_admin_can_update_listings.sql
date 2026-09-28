-- BUG FIX: admin actions in /admin/oglasi (Obriši / pauziraj-aktiviraj tuđi oglas)
-- silently do nothing, for the exact same reason the "Odobri" button on
-- /admin/users did nothing (see migration_admin_can_update_profiles.sql).
--
-- Root cause: public.listings has exactly 4 RLS policies (select/insert/update/delete),
-- and select/update/delete are ALL scoped to `auth.uid() = user_id`. There is no
-- policy letting an admin touch a listing owned by someone else, so an admin's
-- UPDATE/DELETE on another user's listing matches zero rows — no error, just a
-- silent no-op — before deleteListing/toggleStatus in app/admin/oglasi/page.tsx
-- ever get a chance to do anything.
--
-- Fix: add admin UPDATE and DELETE policies on public.listings, using the same
-- proven-safe "is this caller an existing admin" check already used on profiles,
-- payment_settings, listing_promotions, and credit_purchases.
drop policy if exists "Admins can update any listing" on public.listings;
create policy "Admins can update any listing" on public.listings
  for update using (
    exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.is_admin = true)
  );

drop policy if exists "Admins can delete any listing" on public.listings;
create policy "Admins can delete any listing" on public.listings
  for delete using (
    exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.is_admin = true)
  );
