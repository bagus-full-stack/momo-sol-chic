-- Buckets publics : MIME et taille imposés côté serveur (5 Mo)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('services',     'services',     true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('realisations', 'realisations', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg','image/png','image/webp'];

create policy "storage_read_public" on storage.objects
  for select using (bucket_id in ('services','realisations'));

create policy "storage_write_admin" on storage.objects
  for all to authenticated
  using (bucket_id in ('services','realisations'))
  with check (bucket_id in ('services','realisations'));

-- 7 services : "Staff" et "Faux plafonds et placo" séparés
update services set name = 'Staff', short_description = 'Moulures, corniches et décors en staff.',
  long_description = 'Nos artisans créent des moulures, corniches et décors en staff sur mesure pour embellir vos espaces.'
  where slug = 'staff';

insert into services (slug, name, short_description, long_description, icon, price_range, "order")
values ('faux-plafonds-placo', 'Faux plafonds et placo', 'Faux plafonds et cloisons en plâtre ou placo.',
  'Nous installons des faux plafonds et cloisons en plâtre ou placo pour embellir vos espaces et améliorer l''isolation phonique.',
  '🏗️', 'Sur devis', 4)
on conflict (slug) do nothing;

update services set "order" = 5 where slug = 'toiture-charpente';
update services set "order" = 6 where slug = 'etancheite';
update services set "order" = 7 where slug = 'vitrerie-et-autres-finitions';
