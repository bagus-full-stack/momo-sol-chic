-- ============================================================
-- Sol-Chic — Migration 002 : Row Level Security
-- ============================================================

-- Activer RLS sur toutes les tables
alter table services          enable row level security;
alter table realisations      enable row level security;
alter table devis             enable row level security;
alter table temoignages       enable row level security;
alter table knowledge_chunks  enable row level security;
alter table catalogue_produits enable row level security;

-- ── Services : lecture publique, écriture admin uniquement ────
create policy "services_read_public"
  on services for select using (true);

create policy "services_write_admin"
  on services for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ── Réalisations : lecture publique, écriture admin ───────────
create policy "realisations_read_public"
  on realisations for select using (true);

create policy "realisations_write_admin"
  on realisations for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ── Devis : insertion publique, lecture admin uniquement ──────
create policy "devis_insert_public"
  on devis for insert with check (true);

create policy "devis_read_admin"
  on devis for select
  using (auth.role() = 'authenticated');

create policy "devis_update_admin"
  on devis for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ── Témoignages : lecture publique (publiés), écriture admin ──
create policy "temoignages_read_published"
  on temoignages for select
  using (is_published = true or auth.role() = 'authenticated');

create policy "temoignages_write_admin"
  on temoignages for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ── Knowledge chunks : lecture publique, écriture service role─
create policy "knowledge_read_public"
  on knowledge_chunks for select using (true);

create policy "knowledge_write_service"
  on knowledge_chunks for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ── Catalogue produits : lecture publique, écriture admin ─────
create policy "catalogue_read_public"
  on catalogue_produits for select using (is_active = true or auth.role() = 'authenticated');

create policy "catalogue_write_admin"
  on catalogue_produits for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
