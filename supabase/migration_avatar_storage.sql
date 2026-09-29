-- =============================================
-- Upload profilne slike za korisnike koji se NISU ulogovali preko
-- Google/Facebook (email/lozinka nalozi trenutno nemaju NIKAKAV način da
-- postave profilnu sliku — avatar_url se popunjava samo iz OAuth podataka,
-- videti app/auth/callback/route.ts).
--
-- Ovo pravi Supabase Storage "bucket" za profilne slike:
--   - javno čitljiv (svako može da VIDI sliku, kao i do sada za
--     Google/Facebook slike koje su takođe javne),
--   - korisnik sme da upload-uje/menja/briše SAMO fajlove unutar SVOG
--     sopstvenog foldera (prvi deo putanje = njegov user id) — ne može da
--     dira tuđe slike.
--
-- Pokreni OVO RUČNO u Supabase Dashboard -> SQL Editor (kao i sve ostale
-- migracije — agent ne sme sam da menja storage/RLS na produkciji).
-- =============================================

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  3145728, -- 3MB po slici
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 3145728,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "Avatar images are publicly accessible" on storage.objects;
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

commit;

-- Provera posle pokretanja:
-- select id, public, file_size_limit, allowed_mime_types from storage.buckets where id = 'avatars';
-- select policyname, cmd from pg_policies where tablename = 'objects' and policyname ilike '%avatar%';
