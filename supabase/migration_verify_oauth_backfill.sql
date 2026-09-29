-- =============================================
-- Google/Facebook nalog garantuje da je email/identitet već potvrđen kod tog
-- provajdera, pa takvi korisnici treba odmah da imaju "verifikovan" bedž
-- (is_verified = true), bez čekanja da admin ručno klikne.
--
-- Kod (app/auth/callback/route.ts) je već izmenjen tako da SVAKI NOVI nalog
-- napravljen preko Google/Facebook login-a od sada automatski dobija
-- is_verified = true čim se prvi put uloguje.
--
-- OVA migracija je jednokratno dopunjavanje za naloge koji su NAPRAVLJENI
-- PRE ove izmene (već postoje u bazi sa is_verified = false, iako su se
-- ulogovali preko Google/Facebook). Mora se pokrenuti ručno u SQL Editoru
-- jer:
--   1) Agent ne sme sam da menja is_verified na produkciji.
--   2) trg_prevent_privilege_escalation trigger (iz migration_admin_security_v2.sql)
--      tiho poništava SVAKI pokušaj da se is_verified podigne, osim kad je
--      pozivalac service_role ili već admin — a Supabase SQL Editor nema ni
--      jedno od to dvoje po difoltu (isti razlog zašto je ranije `is_admin`
--      update tiho "nije radio" dok se trigger nije privremeno isključio).
--      Zato se ovde, isto kao i tada, trigger privremeno isključuje.
-- =============================================

begin;

alter table public.profiles disable trigger trg_prevent_privilege_escalation;

update public.profiles p
set is_verified = true
where p.is_verified = false
  and exists (
    select 1
    from auth.identities i
    where i.user_id = p.id
      and i.provider in ('google', 'facebook')
  );

alter table public.profiles enable trigger trg_prevent_privilege_escalation;

commit;

-- Provera posle pokretanja — treba da vrati listu naloga koji su sada verifikovani:
-- select p.id, p.email, p.name, p.is_verified, i.provider
-- from public.profiles p
-- join auth.identities i on i.user_id = p.id
-- where i.provider in ('google','facebook')
-- order by p.created_at desc;
