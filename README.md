# Sol-Chic — Application Web

Application web complète pour **Sol-Chic**, entreprise de travaux de rénovation à Ouagadougou, Burkina Faso.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14 (App Router, **static export**) |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase Edge Functions (Deno) |
| IA / RAG | Gemini 2.0 Flash + text-embedding-004 |
| BDD | Supabase PostgreSQL + pgvector |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |

## Architecture

```
GitHub Pages (Next.js SSG)
        ↓ fetch
Supabase Edge Functions
  ├── /functions/v1/chat  (RAG + Gemini)
  ├── /functions/v1/devis (soumission + email)
  └── /functions/v1/embed (vectorisation)
        ↓
Supabase PostgreSQL + pgvector
```

## Démarrage local

```bash
# 1. Installer les dépendances
npm install

# 2. Copier les variables d'environnement
cp .env.local.example .env.local
# Remplir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Lancer le serveur de développement
npm run dev
```

## Déploiement

### Variables GitHub Actions à configurer (Settings → Secrets)

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anon |
| `SUPABASE_ACCESS_TOKEN` | Token Supabase CLI (`supabase.com → Account`) |
| `SUPABASE_PROJECT_REF` | Référence du projet (ex: `abcdefghijklm`) |
| `SUPABASE_DB_PASSWORD` | Mot de passe de la base de données |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service (côté Edge Functions uniquement) |
| `GEMINI_API_KEY` | Clé API Google AI Studio |
| `RESEND_API_KEY` | Clé Resend pour les emails (optionnel) |
| `ADMIN_EMAIL` | Email de notification des devis |

### Activer GitHub Pages

1. `Settings → Pages → Source : GitHub Actions`
2. Pousser sur `main` → le workflow `deploy-pages.yml` se déclenche automatiquement

### Créer l'admin

Dans Supabase Dashboard → Authentication → Users → Invite user :
- Email : votre adresse admin
- Mot de passe : fort et unique

## Structure du projet

```
src/
├── app/
│   ├── (public)/          # Pages publiques (layout avec Navbar+Footer)
│   │   ├── page.tsx       # Accueil
│   │   ├── services/      # Liste + détail par slug
│   │   ├── realisations/  # Galerie avant/après
│   │   ├── devis/         # Formulaire de devis
│   │   ├── contact/       # Page contact + carte
│   │   └── faq/           # Questions fréquentes
│   └── (admin)/           # Back-office (auth guard)
│       └── admin/
│           ├── login/     # Connexion admin
│           ├── dashboard/ # Tableau de bord
│           ├── services/  # CRUD services
│           ├── realisations/ # CRUD réalisations
│           ├── temoignages/  # Modération
│           ├── knowledge-base/ # Base IA
│           └── catalogue/    # Catalogue produits
├── components/
│   ├── ui/                # Primitives (Button, Input, Card…)
│   └── public/            # Navbar, Footer, ChatWidget, DevisForm…
├── lib/                   # supabase.ts, supabase-functions.ts, utils.ts
└── types/                 # index.ts (interfaces TypeScript)

supabase/
├── migrations/            # 001_init, 002_rls, 003_functions
└── functions/             # chat/, devis/, embed/

.github/workflows/
├── deploy-pages.yml       # Build + déploiement GitHub Pages
├── deploy-supabase.yml    # Migrations + Edge Functions
└── supabase-keepalive.yml # Cron anti-pause (tous les 3 jours)
```

## Services

1. 🏠 Carrelage-faïence
2. 🎨 Peinture
3. 🏗️ Staff, faux plafonds & placo
4. 🏡 Toiture-charpente
5. 💧 Étanchéité
6. 🪟 Vitrerie & autres finitions
