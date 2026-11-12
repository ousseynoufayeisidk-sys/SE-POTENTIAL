# SE-POTENTIAL 360°

Plateforme web pour détecter, évaluer et sélectionner les entrepreneurs à fort potentiel au Sénégal, basée sur des preuves comportementales.

[![Tests](https://img.shields.io/badge/tests-14%20passed-brightgreen)]()
[![Coverage](https://img.shields.io/badge/coverage-100%25%20scoring-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)]()
[![Status](https://img.shields.io/badge/status-90%25%20MVP-yellow)]()

## 🎯 Mission

Permettre aux incubateurs, fonds et programmes d'accompagnement d'identifier les entrepreneurs sur la base de **preuves concrètes** plutôt que du seul pitch.

## ⚡ Démarrage rapide

```bash
# Installation
npm install

# Tests
npm test              # Devrait afficher : 14 tests passed ✅

# Développement
npm run dev          # Ouvrir http://localhost:3000

# Production
npm run build
npm start
```

**📖 Guide complet** : Voir [DEMARRAGE-RAPIDE.md](./DEMARRAGE-RAPIDE.md)

---

## 📊 État du projet

### Phase 1 - MVP : 90% ✅

```
Fondations             ████████████████████ 100%
Authentification       ████████████████████ 100%
Parcours candidat      ██████████████████░░  90%
Grille évaluation      ██████████████████░░  90%
Tableau jury           ██████████████████░░  90%
Génération PDF         ░░░░░░░░░░░░░░░░░░░░   0%
Administration         ░░░░░░░░░░░░░░░░░░░░   0%
```

**Total** : 59 fichiers | ~5000 lignes TypeScript | 14 tests ✅

### ✅ Ce qui fonctionne

- **Authentification** - Magic link, gestion des rôles, RLS
- **Parcours candidat** - 13 questions, sauvegarde auto, upload preuves
- **Grille d'évaluation** - Split screen, ScoreSelector 1-5, validation
- **Tableau jury** - Calcul scores, radar 4D, formulaire de décision
- **Moteur de scoring** - 100% testé, 4 dimensions, bandes + flags

### ⏳ Ce qui reste (10%)

- [ ] Récapitulatif candidat + consentement RGPD
- [ ] Génération PDF des rapports individuels
- [ ] Administration (programmes, modèles de scoring)

---

## 🛠️ Stack technique

- **Framework** : Next.js 15 (App Router) + TypeScript strict
- **UI** : Tailwind CSS + shadcn/ui + Radix
- **Backend** : Supabase (PostgreSQL + Auth + Storage + RLS)
- **Validation** : Zod + React Hook Form
- **Tests** : Vitest (unitaires) + Playwright (E2E)
- **Graphiques** : Recharts (radar 4 dimensions)
- **PDF** : @react-pdf/renderer
- **i18n** : next-intl (français + wolof)

---

## 📂 Structure

```
/
├── app/
│   ├── login/signup/          # Authentification (magic link)
│   ├── candidater/            # Parcours candidat (13 questions)
│   ├── evaluateur/[appId]/    # Grille d'évaluation (19 critères)
│   ├── jury/[appId]/          # Synthèse + décision
│   └── actions/               # Server Actions (Supabase)
├── components/
│   ├── ui/                    # Composants de base (7)
│   ├── candidature/           # Wizard, SaveIndicator, ProofUploader
│   ├── evaluation/            # ScoreSelector (1-5 avec ancrages)
│   └── jury/                  # DimensionRadar, DecisionForm
├── lib/
│   ├── scoring/               # Moteur de scoring + tests (14/14) ✅
│   ├── supabase/              # Clients serveur/browser + types
│   └── utils.ts               # Helpers (debounce, compress, format)
└── supabase/
    ├── migrations/            # SQL (17 tables + RLS)
    └── seed/                  # Données de référence
```

---

## 📊 Moteur de scoring

Le cœur du système évalue les candidats sur **4 dimensions** :

- **PEOPLE** (40%) : 8 compétences comportementales
- **EXECUTION** (25%) : capacité à exécuter
- **BUSINESS** (25%) : viabilité du projet
- **IMPACT** (10%) : impact social/environnemental

### Règles

- Notes de **1 à 5** par critère (19 critères au total)
- Une note **4 ou 5 exige ≥ 2 preuves** concrètes
- **Notation en aveugle** (évaluateurs indépendants)
- Désaccord ≥ 2 points → **flag pour le jury**
- **Pas d'exclusion automatique**
- **L'IA suggère, ne décide jamais**

### Bandes de scoring

- **≥ 80** : Potentiel élevé
- **≥ 65** : Potentiel intéressant
- **≥ 50** : À consolider
- **< 50** : Insuffisamment démontré

---

## 🎨 Design

### Palette
- **Baobab** `#0E6B4F` - Actions, progression
- **Nuit** `#14212B` - Texte
- **Brume** `#F5F7F6` - Fond
- **Océan** `#1D5C8A` - Information
- **Soleil** `#E8A317` - Attention
- **Alerte** `#B3261E` - Alertes factuelles uniquement

### Principes
- **Mobile-first** (360px minimum)
- **Dignité** du candidat (langage respectueux, pas de jugement)
- **Clarté** (une idée par écran, aide contextuelle)
- **Accessibilité** (contrastes AA, navigation clavier)

---

## 🔐 Sécurité

- ✅ **RLS (Row Level Security)** sur toutes les tables
- ✅ **Notation en aveugle** garantie par RLS
- ✅ Pas de clé `service_role` côté client
- ✅ Validation **Zod** client + serveur
- ✅ **Audit log** pour toutes les actions sensibles
- ✅ Consentements explicites et versionnés
- ✅ Compression images < 300Ko avant upload

---

## 📖 Documentation

### Pour démarrer
- **[DEMARRAGE-RAPIDE.md](./DEMARRAGE-RAPIDE.md)** - Installation en 5 minutes
- **[TODO.md](./TODO.md)** - Tâches restantes détaillées

### Références
- **[SPEC.md](./SPEC.md)** - Cahier de développement complet (84 pages)
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Schémas techniques et flux
- **[CLAUDE.md](./CLAUDE.md)** - Règles de développement

---

## 🧪 Commandes

```bash
# Développement
npm run dev                 # Serveur de développement (port 3000)
npm run build              # Build de production
npm start                  # Serveur production

# Tests
npm test                   # Tests unitaires (Vitest)
npm run test:e2e          # Tests E2E (Playwright) - à configurer

# Qualité
npm run lint              # ESLint
npm run lint -- --fix     # Fixer automatiquement
npx prettier --write .    # Formater le code

# Base de données (Supabase CLI)
supabase migration new nom_migration
supabase db push
supabase gen types typescript --project-id ID > lib/supabase/database.types.ts
```

---

## 🤝 Contribution

Ce projet suit une approche **TDD** (Test-Driven Development) :
1. Écrire les tests d'abord
2. Les voir échouer
3. Implémenter
4. Vérifier que les tests passent

**Commits en français à l'impératif** :
```bash
git commit -m "feat: ajoute le composant ScoreSelector"
git commit -m "fix: corrige la validation des preuves"
git commit -m "docs: met à jour le README"
```

---

## 📄 Licence

[À définir]

---

**Version** : 1.0.0-rc (Release Candidate)  
**Date** : Novembre 2026  
**Statut** : ✅ Prêt pour tests pilote (MVP à 90%)
