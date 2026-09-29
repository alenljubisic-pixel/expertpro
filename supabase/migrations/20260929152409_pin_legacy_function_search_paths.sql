-- These bodies use schema-qualified tables or only pg_catalog operators.
-- Pin resolution so caller-controlled schemas cannot shadow their names.
alter function public.handle_new_user() set search_path = '';
alter function public.flag_contact_in_message() set search_path = '';
alter function public.increment_view_count(uuid) set search_path = '';
alter function public.expire_old_listings() set search_path = '';
