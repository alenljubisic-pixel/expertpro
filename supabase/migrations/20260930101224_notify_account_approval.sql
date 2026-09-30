-- Approval is an essential account notification, independent of optional email choices.
create or replace function private.notify_account_approval()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.notifications(user_id, type, title, message, link)
  values (new.id, 'account_approved', 'Nalog je odobren',
          'Tvoj nalog je odobren i možeš da koristiš ExpertPro.', '/dashboard');
  return new;
end;
$$;
revoke all on function private.notify_account_approval() from public, anon, authenticated;

drop trigger if exists notify_account_approval on public.profiles;
create trigger notify_account_approval
after update of is_approved on public.profiles
for each row when (old.is_approved is false and new.is_approved is true)
execute function private.notify_account_approval();
