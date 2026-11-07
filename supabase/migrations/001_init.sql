-- ============================================================
-- Sol-Chic — Migration 001 : Schéma initial
-- ============================================================

-- Extension pgvector pour embeddings RAG
create extension if not exists vector;

-- ── Services ─────────────────────────────────────────────────
create table if not exists services (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  short_description text not null default '',
  long_description  text not null default '',
  icon          text not null default '🏠',
  price_range   text not null default 'Sur devis',
  images        text[] not null default '{}',
  "order"       integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ── Réalisations ─────────────────────────────────────────────
create table if not exists realisations (
  id            uuid primary key default gen_random_uuid(),
  service_id    uuid references services(id) on delete set null,
  title         text not null,
  description   text not null default '',
  images        text[] not null default '{}',
  before_image  text,
  after_image   text,
  realized_at   date,
  created_at    timestamptz not null default now()
);

-- ── Devis ────────────────────────────────────────────────────
create table if not exists devis (
  id            uuid primary key default gen_random_uuid(),
  nom           text not null,
  telephone     text not null,
  email         text,
  service       text not null,
  surface_m2    numeric,
  message       text,
  disponibilite text,
  statut        text not null default 'nouveau'
                check (statut in ('nouveau','en_cours','traite','annule')),
  created_at    timestamptz not null default now()
);

-- ── Témoignages ───────────────────────────────────────────────
create table if not exists temoignages (
  id            uuid primary key default gen_random_uuid(),
  prenom        text not null,
  ville         text not null,
  service_id    uuid references services(id) on delete set null,
  note          integer not null check (note between 1 and 5),
  commentaire   text not null,
  photo_url     text,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ── Knowledge chunks (RAG) ────────────────────────────────────
create table if not exists knowledge_chunks (
  id            uuid primary key default gen_random_uuid(),
  content       text not null,
  category      text not null default 'faq'
                check (category in ('service','faq','tarifs','delais','contact','zone')),
  service_id    uuid references services(id) on delete set null,
  embedding     vector(768),
  indexed_at    timestamptz,
  created_at    timestamptz not null default now()
);

-- Index cosinus pour la recherche sémantique
create index if not exists knowledge_chunks_embedding_idx
  on knowledge_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 50);

-- ── Catalogue produits ────────────────────────────────────────
create table if not exists catalogue_produits (
  id            uuid primary key default gen_random_uuid(),
  nom           text not null,
  type          text not null default 'carrelage'
                check (type in ('carrelage','peinture','autre')),
  description   text not null default '',
  formats       text[] not null default '{}',
  image_url     text,
  is_active     boolean not null default true
);

-- ── Seed services par défaut ──────────────────────────────────
insert into services (slug, name, short_description, long_description, icon, price_range, "order")
values
  ('carrelage-faience',       'Carrelage-faïence',         'Pose de carrelage, faïence et mosaïque pour sols et murs.', 'Spécialistes de la pose de carrelage, nous intervenons pour tous types de surfaces : sols, murs, terrasses. Nous travaillons avec les meilleures marques pour un résultat durable et esthétique.', '🏠', 'À partir de 5 000 FCFA/m²', 1),
  ('peinture',                'Peinture',                  'Application de peinture intérieure et extérieure de qualité.', 'Notre équipe de peintres professionnels vous offre des finitions de qualité, que ce soit pour votre maison, appartement ou local commercial.', '🎨', 'À partir de 1 500 FCFA/m²', 2),
  ('staff',                   'Staff, faux plafonds & placo','Création de faux plafonds décoratifs et cloisons en staff.', 'Nous concevons et installons des faux plafonds en staff, plâtre ou placo pour embellir vos espaces et améliorer l''isolation phonique.', '🏗️', 'Sur devis', 3),
  ('toiture-charpente',       'Toiture-charpente',         'Construction et réfection de toitures et charpentes.', 'Sol-Chic assure la pose de couvertures en tôles, tuiles ou shingles, ainsi que la construction et réparation de charpentes en bois ou métal.', '🏡', 'Sur devis', 4),
  ('etancheite',              'Étanchéité',                'Traitement d''imperméabilisation contre les infiltrations.', 'Nos experts en étanchéité protègent vos structures contre l''humidité avec des membranes bitumineuses et des enduits spéciaux.', '💧', 'Sur devis', 5),
  ('vitrerie-et-autres-finitions','Vitrerie & autres finitions','Pose de vitres, menuiserie aluminium et finitions haut de gamme.', 'De la pose de vitres à la menuiserie aluminium, en passant par les garde-corps et les verrières, nous finalisons vos espaces avec soin.', '🪟', 'Sur devis', 6)
on conflict (slug) do nothing;
