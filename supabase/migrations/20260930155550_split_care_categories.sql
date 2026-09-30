-- Separate everyday care from child/pet sitting. This is not a medical-services category.
update public.categories
set name_sr = 'Čuvanje dece i ljubimaca',
    name_en = 'Child and pet care',
    icon = '👶'
where slug = 'cuvanje';

insert into public.categories (name_sr, name_en, icon, slug, sort_order, is_active)
values ('Nega i pomoć u kući', 'Non-medical home care', '🏠', 'nega-pomoc-u-kuci', 13, true)
on conflict (slug) do update set
  name_sr = excluded.name_sr,
  name_en = excluded.name_en,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
