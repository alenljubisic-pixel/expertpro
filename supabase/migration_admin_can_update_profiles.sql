-- BUG FIX: "Odobri" (approve) on /admin/users silently did nothing.
--
-- Root cause: public.profiles has exactly one UPDATE policy —
--   "Users can update own profile" ... using (auth.uid() = id)
-- RLS policies of the same command are OR'd, but with only that one policy
-- present, an UPDATE where auth.uid() != id matches ZERO rows — Postgres
-- doesn't error, it just silently filters the row out. The
-- prevent_privilege_escalation trigger (migration_admin_security.sql /
-- _v2.sql) correctly allows an admin to flip is_admin/is_verified/is_approved
-- on someone else's row, but that check never even runs, because RLS drops
-- the row before the trigger fires. This is why the admin's approveUser
-- server action ran without error yet nothing changed.
--
-- Fix: add a second UPDATE policy so an existing admin can update ANY
-- profile row. This does not grant anyone new admin rights by itself — the
-- existing prevent_privilege_escalation trigger still guards is_admin /
-- is_verified / is_approved the same way regardless of which policy let the
-- row through, so a non-admin still cannot self-escalate, and an admin can
-- now actually do what the /admin UI has always assumed was possible
-- (approve/reject companies & agencies).
drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile" on public.profiles
  for update using (
    exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.is_admin = true)
  );
