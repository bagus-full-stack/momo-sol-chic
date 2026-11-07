# Sol-Chic — Application Web

Application web de **Sol-Chic**, entreprise de revêtement et rénovation sols & murs à Ouagadougou, Burkina Faso : site vitrine, assistant IA (RAG) et back-office d'administration.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14 (App Router, **export statique**) |
| Styling | Tailwind CSS + composants shadcn/ui |
| Backend | Supabase Edge Functions (Deno) |
| IA / RAG | Gemini 2.0 Flash + text-embedding-004 |
| BDD | Supabase PostgreSQL + pgvector |
| Stockage | Supabase Storage (buckets `services`, `realisations`) |
| Emails | Resend |
| Hébergement | GitHub Pages |
| CI/CD | GitHub Actions |

## Architecture

```
GitHub Pages (Next.js SSG)
        ↓ fetch (clé anon)
Supabase Edge Functions
  ├── chat   (RAG + Gemini, rate limit)
  ├── devis  (enregistrement + emails admin/client, honeypot, rate limit)
  └── embed  (indexation d'un chunk, JWT admin requis)
        ↓
Supabase PostgreSQL + pgvector · Auth · Storage · Realtime
```

## Fonctionnalités

**Public** : 7 services (fiche détaillée), galerie de réalisations (filtres service/année, lightbox, slider avant/après), formulaire de devis (validation client + serveur, email de confirmation si email fourni), calculateur de surface (préremplit le devis), page contact (téléphone, WhatsApp, carte OpenStreetMap chargée au clic), FAQ, témoignages, bouton WhatsApp flottant, assistant IA flottant.

**Admin** (`/admin`, Supabase Auth) : devis (statut, détail, export CSV, compteur temps réel), statistiques (12 mois, par service, par statut, conversion), services, réalisations (upload de photos), témoignages (modération), catalogue, base de connaissances IA (ajout, indexation, réindexation, suppression).

**Assistant IA** : l'embedding de la question est comparé aux chunks (`pgvector`, similarité ≥ 0,4). Sans chunk pertinent, il répond par la phrase de repli avec le numéro de téléphone, sans appeler le LLM. Il ne donne jamais de prix ferme ni de date, et ne collecte ni téléphone ni email.

**Sécurité** : RLS sur toutes les tables, CSP en balise meta, clés Gemini/Resend/service role uniquement dans les secrets Supabase, rate limiting persistant en base (migration 007), uploads limités à JPG/PNG/WebP de 5 Mo côté serveur.

## Démarrage local

```bash
npm install
cp .env.local.example .env.local
# Remplir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Build de production : `npm run build` (génère `out/`).

## Déploiement

### Secrets GitHub Actions (Settings → Secrets and variables → Actions → Secrets)

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anon |
| `SUPABASE_ACCESS_TOKEN` | Token Supabase CLI (supabase.com → Account) |
| `SUPABASE_PROJECT_REF` | Référence du projet |
| `SUPABASE_DB_PASSWORD` | Mot de passe de la base |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service (Edge Functions uniquement) |
| `GEMINI_API_KEY` | Clé Google AI Studio |
| `RESEND_API_KEY` | Clé Resend (emails). Le domaine expéditeur `sol-chic.com` doit être vérifié |
| `ADMIN_EMAIL` | Destinataire des notifications de devis |

### Variables GitHub Actions (onglet Variables)

| Variable | Description |
|----------|-------------|
| `SITE_URL` | URL publique du site (sitemap, robots) |
| `BASE_PATH` | `/momo-sol-chic` sans domaine personnalisé, vide sinon |

### Mise en ligne

1. `Settings → Pages → Source : GitHub Actions`.
2. Pousser sur `main` : `deploy-pages.yml` publie le site, `deploy-supabase.yml` applique les migrations et déploie les fonctions.
3. Créer l'admin : Supabase → Authentication → Users → Invite user (mot de passe fort). Désactiver les inscriptions publiques, car tout utilisateur connecté est administrateur.
4. Renseigner les contenus : 7 services avec photo, 10 réalisations (dont 3 avant/après), 20 chunks de base de connaissances (puis cliquer sur l'indexation), 3 témoignages publiés, 10 questions de FAQ.

### Accès à l'administration

Aucun lien du site public ne mène à l'administration : saisir l'adresse à la main.

| Environnement | URL |
|---------------|-----|
| En ligne | `https://<compte-github>.github.io/momo-sol-chic/admin/login/` (sans domaine personnalisé) |
| Domaine personnalisé | `https://<domaine>/admin/login/` |
| Local | `http://localhost:3100/admin/login` (après `npm run dev`) |

Le préfixe `/momo-sol-chic` correspond à la variable `BASE_PATH`. Après connexion, le tableau de bord est à `/admin/dashboard/`. Le compte administrateur doit exister au préalable (étape 3 ci-dessus). Sans session, les pages `/admin/*` redirigent vers `/admin/login/`.

Le contenu des services, réalisations et FAQ est lu au build : après une modification dans l'admin, relancer le workflow `Deploy to GitHub Pages` (Actions → Run workflow) ou pousser un commit.

## Structure du projet

```
src/
├── app/
│   ├── (public)/      accueil, services, réalisations, devis, contact, faq, calculateur
│   ├── (admin)/admin/ login, dashboard, devis, services, realisations,
│   │                  temoignages, knowledge-base, catalogue
│   ├── sitemap.ts, robots.ts
├── components/        ui/ (primitives), public/, admin/ (ImageUpload)
├── lib/               supabase.ts, supabase-functions.ts, utils.ts
└── types/
supabase/
├── migrations/        001 schéma · 002 RLS · 003 recherche vectorielle · 004 KB admin
│                      005 Realtime devis · 006 Storage + 7e service · 007 rate limit
└── functions/         chat/, devis/, embed/
.github/workflows/
├── deploy-pages.yml        build + déploiement GitHub Pages
├── deploy-supabase.yml     migrations + Edge Functions
└── supabase-keepalive.yml  cron anti-pause (tous les 3 jours)
```

## Qualité

Lighthouse (build statique, mobile 3G simulée) : performance 88–91, accessibilité 96–100, SEO 100 ; desktop 100. Mesuré avec des données factices (sans photos) : à refaire sur le site déployé. Restent à tester sur appareils réels : Chrome Android, iOS Safari, Firefox.

## Services

1. Carrelage-faïence
2. Peinture
3. Staff
4. Faux plafonds et placo
5. Toiture-charpente
6. Étanchéité
7. Vitrerie & autres finitions
