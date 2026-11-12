# SE-POTENTIAL 360° — Cahier de développement (back + front + design)

> **Mission** : plateforme web qui permet à un incubateur / fonds / programme de **détecter, évaluer et sélectionner** les entrepreneurs à fort potentiel au Sénégal, sur la base de **preuves comportementales** et non du seul pitch.
> **Cible de livraison** : MVP utilisable en conditions réelles le plus vite possible, puis extensions par phases.
> **Comment utiliser ce fichier** : le déposer à la racine du repo (`SPEC.md`), le référencer dans `CLAUDE.md`, puis suivre la section 12 (prompts prêts à coller) phase par phase avec Claude Code.

---

## 0. Ce que disent vos 4 documents (synthèse exploitable)

| Source | Ce qu'on en retient pour la plateforme |
|---|---|
| **Playbook – persona de l'entrepreneur à succès** | 5 personas (A Bâtisseur formalisé, B Informel à fort potentiel, C Fondateur tech, D Transformation locale, E Diaspora), continuum de formalisation en 4 stades (informel pur → semi-formel → formalisé → structuré), entonnoir en 5 étapes, questionnaire A→J (marqué ★ pour le scoring), red flags d'intégrité, due diligence légère, indicateurs de pilotage, plan 90 jours. |
| **Support PBE** | Philosophie « détecter / évaluer / prédire », 8 compétences distinctives, scorecard 4 familles (40/25/25/10), entretien **STAR**, assessment center, **Business Challenge 48 h**, seuils minimaux par dimension, suivi à 6/12/24 mois, nom **SE-POTENTIAL 360°** (PEOPLE · BUSINESS · EXECUTION · IMPACT). |
| **Support outil de profilage (EPA Sénégal)** | Deux scores **séparés** (potentiel de l'entrepreneur vs maturité du projet) + matrice de décision, architecture en 5 phases, « l'IA assiste, ne décide jamais », consentement et conservation des données, validation sur 100–150 candidats, stack progressive (Tally/Airtable → app propriétaire). |
| **SE_POTENTIAL_360_Scorecard.xlsx** | 19 critères pondérés (total 100), note 1–5, formule `score pondéré = poids × note / 5`, bandes ≥80 / ≥65 / ≥50, 5 onglets (Scorecard, Guide de notation, 40 questions STAR, Préqualification 13 questions, Assessment Center 4 exercices, Synthèse jury). **Source de vérité du moteur de scoring.** |

### ⚠️ Incohérences à trancher (ne pas les coder en dur)

1. **Trois jeux de seuils coexistent** : Playbook 75/55/35 · Support PBE + Excel 80/65/50 · EPA A/B/C/D 85/70/55. → **Les seuils et pondérations sont de la donnée versionnée en base** (table `scoring_models`), jamais des constantes dans le code. Valeur par défaut au démarrage : **Excel (80/65/50)**.
2. **Red flag d'intégrité** : le Playbook dit « élimine le dossier », l'EPA dit « aucune exclusion automatique sur un seul score ». → La plateforme **lève une alerte factuelle et documentée qui impose une revue du jury** ; elle n'exclut jamais automatiquement (cohérent avec la ligne « Alerte / revue humaine » de l'Excel).
3. **Ce n'est pas un test psychométrique validé.** Pas de prétention prédictive tant que le pilote (20–30 puis 100–150 candidats) n'a pas validé les scores. Le produit doit l'afficher honnêtement.

---

## 1. Les meilleurs skills Claude pour ce projet

> Sources : classement DesignRevision (juillet 2026) et articles comparatifs d'octobre 2026. **Étoiles et commandes d'installation évoluent vite : vérifier chaque dépôt avant d'installer** (un skill = des instructions + parfois des scripts exécutés sur votre machine ; lire le `SKILL.md` avant d'installer, privilégier les sources officielles).

### 1.1 Socle recommandé (à installer en premier)

| Priorité | Skill / plugin | Rôle dans SE-POTENTIAL | Installation (Claude Code) |
|---|---|---|---|
| 1 | **frontend-design** (Anthropic, officiel) | UI distinctive, pas de rendu « template IA ». Indispensable pour l'objectif « design fluide ». | `/plugin install frontend-design@claude-plugins-official` |
| 2 | **Superpowers** (obra/superpowers) | Méthode complète : brainstorm → spec → plan → TDD → revue. Empêche Claude de construire la mauvaise chose. | `/plugin marketplace add obra/superpowers-marketplace` puis `/plugin install superpowers@superpowers-marketplace` |
| 3 | **Context7** (upstash/context7) | Documentation **à jour** de Next.js, Supabase, Tailwind, shadcn… évite les API obsolètes. | `/plugin marketplace add upstash/context7` puis `/plugin install context7@context7-marketplace` |
| 4 | **Vercel React Best Practices** (vercel-labs/agent-skills) | ~70 règles de perf/qualité React-Next (server vs client components, data fetching). | `npx skills add vercel-labs/agent-skills` |
| 5 | **security-guidance** (officiel) | Détecte injection, XSS, secrets exposés, IDOR, contournement d'auth — critique avec des données personnelles. | `/plugin install security-guidance@claude-plugins-official` |
| 6 | **webapp-testing** / **Playwright** | Claude pilote un vrai navigateur pour vérifier que le parcours candidat et la grille évaluateur fonctionnent. | copier `webapp-testing` (anthropics/skills) dans `~/.claude/skills/` ou `/plugin install playwright@claude-plugins-official` |
| 7 | **Planning with Files** | Le plan vit dans des fichiers `.md` : survit au `/clear` et aux longues sessions. | `/plugin marketplace add OthmanAdi/planning-with-files` puis `/plugin install planning-with-files@planning-with-files` |

### 1.2 Utiles en renfort

- **Grill Me** (`npx skills@latest add mattpocock/skills`, commande `/grill-me`) : à lancer **avant** de coder pour faire trancher les points de la section 14.
- **theme-factory** (anthropics/skills) : cohérence palette/typo une fois le design system posé.
- **Skill Creator** (officiel) : pour créer vos **skills maison** (ci-dessous).
- **docx / pdf / xlsx** (Anthropic) : génération des rapports individuels et exports jury.
- **Claude Mem** (`npx claude-mem install`) : mémoire persistante entre sessions si le projet dure plusieurs semaines.
- **mcp-builder** : seulement si vous voulez exposer SE-POTENTIAL comme outil à d'autres agents (phase 3).

### 1.3 Deux skills maison à créer (grande valeur, 20 min chacun avec Skill Creator)

Ils encodent **votre méthodologie** pour que chaque session Claude respecte les règles sans qu'on les répète.

**`.claude/skills/se-potential-method/SKILL.md`**
```markdown
---
name: se-potential-method
description: Règles métier de SE-POTENTIAL 360° (scoring, alertes, éthique, vocabulaire). À utiliser dès qu'on touche au scoring, aux modèles d'évaluation, aux rapports, aux alertes ou aux textes visibles par les candidats ou le jury.
---
# Règles non négociables
- Poids et seuils = données versionnées (`scoring_models`), jamais en dur.
- Score pondéré d'un critère = poids × note / 5. Notes entières de 1 à 5.
- Une note 4 ou 5 exige au moins 2 preuves, ou 1 preuve marquée « très forte ».
- Pas de bande finale tant que tous les critères ne sont pas notés (afficher « provisoire »).
- Notation en aveugle : un évaluateur ne voit pas les notes des autres avant d'avoir soumis la sienne.
- Écart ≥ 2 points entre évaluateurs sur un critère => signalé au jury.
- Une alerte (intégrité, fraude documentaire, refus de vérification) = factuelle, documentée, revue par le jury. Aucune exclusion automatique.
- L'IA propose (synthèses, incohérences), ne décide jamais, et son usage est tracé.
- Ne jamais pénaliser l'informalité : le stade de formalisation oriente le parcours, il ne note pas.
- Preuves alternatives acceptées : historique mobile money, carnets, témoignages clients, photos.
- Notes = faits observés, pas le charisme.
```

**`.claude/skills/se-potential-copy-fr/SKILL.md`** : ton de l'interface (français simple, tutoiement interdit côté candidat → « vous », phrases courtes, verbes d'action, erreurs qui expliquent comment corriger, zéro jargon type « scorecard » côté candidat).

---

## 2. Stack et architecture (choisie pour la vitesse)

| Couche | Choix | Pourquoi |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript strict** | Front + back dans un seul repo, Server Actions, déploiement immédiat. |
| UI | **Tailwind CSS + shadcn/ui + Radix** | Composants accessibles prêts à l'emploi, personnalisables via tokens. |
| Formulaires | **react-hook-form + zod** | Un schéma zod = validation client + serveur. |
| Données/Auth | **Supabase (Postgres + Auth + Storage + RLS)** | Back complet sans écrire d'API REST : auth, base, fichiers, sécurité par ligne. |
| Scoring | **Module TypeScript pur** (`src/lib/scoring`) | Testable, sans dépendance, réutilisable front/back. |
| Graphiques | **Recharts** (radar, barres) | Radar des 4 dimensions / 8 compétences. |
| PDF | **@react-pdf/renderer** | Rapport individuel et synthèse jury. |
| i18n | **next-intl** (fr par défaut, wolof en phase 3) | Textes externalisés dès le jour 1. |
| PWA hors-ligne | **Serwist** | Évaluateurs sur le terrain (marchés, ateliers) avec réseau instable. |
| E-mail / SMS | **Resend** + OTP SMS ou WhatsApp (fournisseur à choisir) | Lien de reprise de candidature, notifications. |
| IA | **SDK Anthropic**, modèle via variable `ANTHROPIC_MODEL` | Synthèses et détection d'incohérences, jamais de décision. |
| Tests | **Vitest** (unitaires) + **Playwright** (parcours) | Le moteur de scoring doit être couvert à 100 %. |
| Qualité | ESLint, Prettier, Husky, **Sentry** | |
| Déploiement | **Vercel + Supabase** | Mise en ligne en minutes (voir réserve données § 9). |

### Arborescence

```
/
├─ SPEC.md                       # ce fichier
├─ CLAUDE.md                     # règles du repo (section 12.0)
├─ .claude/skills/               # skills maison
├─ supabase/
│  ├─ migrations/                # SQL versionné
│  └─ seed/                      # criteria.json, prequal.json, star.json, exercises.json
├─ scripts/import-xlsx.ts        # importe l'Excel -> seeds (évite de retaper 40 questions)
├─ src/
│  ├─ app/
│  │  ├─ (public)/               # accueil, candidater
│  │  ├─ (candidat)/             # candidature/[id]
│  │  ├─ (evaluateur)/           # evaluateur, evaluateur/[appId]
│  │  ├─ (jury)/                 # jury, jury/[appId]
│  │  └─ (admin)/                # programmes, modele-de-scoring, equite
│  ├─ components/                # ui/ (shadcn), score/, forms/, jury/
│  ├─ lib/
│  │  ├─ scoring/                # engine.ts, bands.ts, engine.test.ts
│  │  ├─ supabase/               # clients server/browser
│  │  ├─ ai/                     # assistants (suggestions uniquement)
│  │  └─ pdf/
│  ├─ messages/                  # fr.json (wo.json plus tard)
│  └─ styles/tokens.css
└─ tests/e2e/
```

---

## 3. Périmètre par phase (du plus rapide au plus complet)

Estimations indicatives pour un développeur assisté de Claude Code ; à ajuster.

### Phase 1 — MVP « utilisable en vrai » (≈ 2 à 3 semaines)
1. Auth (e-mail magic link) + 4 rôles : `candidat`, `evaluateur`, `jury`, `admin`.
2. **Préqualification digitale** (13 questions de l'Excel, sauvegarde auto, lien de reprise, preuves en option).
3. **Grille d'évaluation évaluateur** (19 critères, notes 1–5, preuves, « à vérifier », guide de notation en contexte).
4. **Moteur de scoring** versionné + bandes + flags (incomplet, désaccord, minimum de dimension).
5. **Tableau jury** : classement, radar, comparaison, alertes, **synthèse jury** et décision.
6. **Rapport individuel PDF**.
7. Consentement explicite + journal d'audit.

### Phase 2 — Évaluation approfondie (≈ 3 semaines)
8. Guide d'entretien **STAR** (40 questions, relances, notes par compétence).
9. **Assessment center** (4 exercices) et **Business Challenge 48 h** (consigne, livrables, grille).
10. Personas A–E + continuum de formalisation (orientent le parcours, ne notent pas).
11. Plans de développement à 90 jours et orientation coaching.
12. Mode terrain hors-ligne (PWA) pour évaluateurs.
13. Assistant IA (synthèse des preuves, incohérences à vérifier).

### Phase 3 — Preuve de valeur et échelle (≈ 4 semaines+)
14. **Suivi à 6 / 12 / 24 mois** (CA, emplois, survie, remboursement) + **indice de prédictivité** (corrélation score initial ↔ résultats).
15. **Tableau d'équité** (écarts par genre, région, langue, stade) — validation anti-biais.
16. Multi-organisations (incubateurs, fonds), wolof, saisie vocale, import de tests externes (META, Entrepreneur DNA) si les accès sont obtenus.
17. Partenariats « business ensemble » (critères §11 du Playbook, due diligence légère).

---

## 4. Modèle de données (PostgreSQL / Supabase)

```sql
-- Extensions
create extension if not exists "pgcrypto";

create type role_t as enum ('candidat','evaluateur','jury','admin');
create type dimension_t as enum ('PEOPLE','EXECUTION','BUSINESS','IMPACT');
create type stage_t as enum ('REPERAGE','QUALIFICATION','ENTRETIEN','IMMERSION','DECISION');
create type decision_t as enum ('SELECTION_PRIORITAIRE','ACCOMPAGNEMENT_CIBLE','PRE_INCUBATION','NON_RETENU_A_CE_STADE','COMPLEMENT_REQUIS');

create table organizations (id uuid primary key default gen_random_uuid(), name text not null);

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  org_id uuid references organizations(id),
  role role_t not null default 'candidat',
  full_name text, phone text, locale text default 'fr',
  created_at timestamptz default now()
);

create table programs (            -- une campagne / cohorte
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id),
  name text not null, opens_at date, closes_at date,
  scoring_model_id uuid, status text default 'draft'
);

create table scoring_models (      -- VERSIONNÉ : poids, seuils, minimums
  id uuid primary key default gen_random_uuid(),
  name text not null, version int not null, is_active boolean default false,
  config jsonb not null,           -- {bands:[{min:80,key:'ELEVE',label:'Potentiel élevé'},...], dimensionMinimums:{...}, disagreementThreshold:2}
  created_at timestamptz default now(), unique(name, version)
);

create table criteria (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references scoring_models(id) on delete cascade,
  code text not null, dimension dimension_t not null,
  label text not null, weight numeric not null check (weight > 0),
  position int not null, unique(model_id, code)
);

create table candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  region text, sector text, gender text,                 -- gender/region: pour l'équité, jamais pour le score
  business_stage text,                                   -- idée, prototype, test, premières ventes, établie, croissance
  formalization text check (formalization in ('INFORMEL_PUR','SEMI_FORMEL','FORMALISE','STRUCTURE')),
  persona text check (persona in ('A','B','C','D','E')),
  created_at timestamptz default now()
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id),
  program_id uuid not null references programs(id),
  stage stage_t not null default 'REPERAGE',
  submitted_at timestamptz, unique(candidate_id, program_id)
);

create table prequal_questions (id serial primary key, position int, text text not null, help text, proof_hint text);
create table prequal_answers (
  application_id uuid references applications(id) on delete cascade,
  question_id int references prequal_questions(id),
  answer text, proof_path text, no_proof_reason text,
  updated_at timestamptz default now(), primary key (application_id, question_id)
);

create table evaluations (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  evaluator_id uuid not null references profiles(id),
  kind text not null check (kind in ('PREQUAL','INTERVIEW','ASSESSMENT','CHALLENGE')),
  status text not null default 'draft' check (status in ('draft','submitted')),
  submitted_at timestamptz, unique(application_id, evaluator_id, kind)
);

create table evaluation_scores (
  evaluation_id uuid references evaluations(id) on delete cascade,
  criterion_id uuid references criteria(id),
  note smallint check (note between 1 and 5),
  evidences text[] default '{}',          -- >= 2 requis si note >= 4 (sinon strong_proof = true)
  strong_proof boolean default false,
  to_verify boolean default false, comment text,
  primary key (evaluation_id, criterion_id)
);

create table star_questions (id serial primary key, competency text, question text, follow_up text);
create table assessment_exercises (id serial primary key, name text, scenario text, behaviors text);
create table exercise_scores (
  evaluation_id uuid references evaluations(id) on delete cascade,
  exercise_id int references assessment_exercises(id),
  note smallint check (note between 1 and 5), observations text,
  primary key (evaluation_id, exercise_id)
);

create table alerts (               -- factuelles et documentées
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  type text not null,               -- INTEGRITE, FRAUDE_DOCUMENTAIRE, REFUS_VERIFICATION, DETTE_NON_ASSUMEE, AUTRE
  facts text not null, source text not null,
  raised_by uuid references profiles(id), status text default 'open',
  created_at timestamptz default now()
);

create table jury_decisions (
  application_id uuid primary key references applications(id) on delete cascade,
  decision decision_t not null, final_score numeric, model_id uuid references scoring_models(id),
  two_proofs text[], two_risks text[], strengths text[], to_develop text[],
  justification text not null, conditions text, plan_90d text,
  decided_by uuid references profiles(id), decided_at timestamptz default now()
);

create table followups (            -- phase 3 : 6 / 12 / 24 mois
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade,
  month smallint check (month in (6,12,24)),
  metrics jsonb, recorded_at timestamptz default now()
);

create table consents (
  candidate_id uuid references candidates(id) on delete cascade,
  purpose text not null, version text not null, granted_at timestamptz default now(),
  primary key (candidate_id, purpose, version)
);

create table audit_log (
  id bigserial primary key, actor uuid, action text not null,
  entity text, entity_id uuid, diff jsonb, at timestamptz default now()
);
```

### Règles RLS à implémenter (Row Level Security)

- **Candidat** : lit et écrit uniquement ses données (`candidates.user_id = auth.uid()`), **ne voit jamais** les scores ni les notes d'évaluateurs.
- **Évaluateur** : accède aux candidatures qui lui sont assignées ; **notation en aveugle** (policy sur `evaluation_scores` : il ne lit que ses propres notes tant que son évaluation est `draft`).
- **Jury** : lit toutes les évaluations `submitted` de son programme ; écrit `jury_decisions`.
- **Admin** : gère programmes, modèles de scoring, affectations ; toute modification de modèle actif crée une **nouvelle version**.
- Toutes les écritures sensibles alimentent `audit_log`.

### Seed : importer l'Excel plutôt que retaper

`scripts/import-xlsx.ts` lit `SE_POTENTIAL_360_Scorecard.xlsx` (feuilles *Scorecard*, *Questions STAR*, *Préqualification*, *Assessment Center*) et génère `supabase/seed/*.json`. Les critères sont :

```json
[
  {"code":"B_VISION","dimension":"PEOPLE","label":"Vision stratégique et ambition","weight":5},
  {"code":"B_PROACT","dimension":"PEOPLE","label":"Esprit entrepreneurial et proactivité","weight":5},
  {"code":"B_RESIL","dimension":"PEOPLE","label":"Résilience et intelligence émotionnelle","weight":6},
  {"code":"B_LEAD","dimension":"PEOPLE","label":"Leadership et intelligence relationnelle","weight":5},
  {"code":"B_AGILE","dimension":"PEOPLE","label":"Agilité et capacité d'adaptation","weight":5},
  {"code":"B_DISC","dimension":"PEOPLE","label":"Discipline et culture de la performance","weight":5},
  {"code":"B_CLIENT","dimension":"PEOPLE","label":"Orientation client et capacité commerciale","weight":5},
  {"code":"B_ETHIC","dimension":"PEOPLE","label":"Éthique, responsabilité et vision durable","weight":4},
  {"code":"E_PLAN","dimension":"EXECUTION","label":"Planification et priorisation","weight":7},
  {"code":"E_DECIDE","dimension":"EXECUTION","label":"Décision et arbitrage","weight":6},
  {"code":"E_RESS","dimension":"EXECUTION","label":"Gestion des ressources / trésorerie","weight":6},
  {"code":"E_REGUL","dimension":"EXECUTION","label":"Régularité des résultats et engagements","weight":6},
  {"code":"P_PROBLEME","dimension":"BUSINESS","label":"Problème client et besoin vérifié","weight":7},
  {"code":"P_VALID","dimension":"BUSINESS","label":"Validation marché / preuves de demande","weight":6},
  {"code":"P_MODELE","dimension":"BUSINESS","label":"Modèle économique et viabilité","weight":6},
  {"code":"P_DIFF","dimension":"BUSINESS","label":"Différenciation et potentiel de croissance","weight":6},
  {"code":"I_CONF","dimension":"IMPACT","label":"Éthique, conformité et transparence","weight":4},
  {"code":"I_IMPACT","dimension":"IMPACT","label":"Impact social / environnemental pertinent","weight":3},
  {"code":"I_PEREN","dimension":"IMPACT","label":"Pérennité et parties prenantes","weight":3}
]
```
Contrôle : PEOPLE 40 + EXECUTION 25 + BUSINESS 25 + IMPACT 10 = **100**. Le script d'import doit échouer si le total ≠ 100.

Barème d'ancrage (onglet *Guide de notation*) à afficher **dans la grille** : 1 Non démontré · 2 Émergent · 3 Opérationnel · 4 Confirmé · 5 Très solide. Règle : *noter les faits, pas le charisme* ; une note 4 ou 5 exige ≥ 2 preuves ou 1 preuve particulièrement forte.

---

## 5. Moteur de scoring (cœur du produit)

### 5.1 Spécification

- `score pondéré(critère) = poids × note_moyenne / 5` (la note moyenne agrège les évaluateurs).
- `total = Σ scores pondérés` (sur 100 si les poids somment à 100).
- **Deux lectures séparées** (EPA) :
  - `indice de potentiel` = (PEOPLE + EXECUTION) ramené sur 100 ;
  - `maturité du projet` = BUSINESS ramené sur 100 ;
  - combinées dans la **matrice de décision** (potentiel fort/à développer/faible × projet mature/immature).
- **Bande finale** seulement si tous les critères sont notés ; sinon `provisoire`.
- **Minimums par dimension** (config) : une dimension sous son minimum lève un flag, même si le total est élevé (pas de compensation par un bon pitch).
- **Désaccord** : écart ≥ `disagreementThreshold` entre évaluateurs sur un critère → flag pour le jury.
- Aucune exclusion automatique.

### 5.2 Implémentation de référence — `src/lib/scoring/engine.ts`

```ts
export type Dimension = "PEOPLE" | "EXECUTION" | "BUSINESS" | "IMPACT";

export interface Criterion { code: string; dimension: Dimension; label: string; weight: number }
export interface Rating { criterionCode: string; note: 1 | 2 | 3 | 4 | 5 }
export interface Band { min: number; key: string; label: string }

export interface ModelConfig {
  bands: Band[];                                          // ordre libre, triées en interne
  dimensionMinimums?: Partial<Record<Dimension, number>>; // en % du max de la dimension
  disagreementThreshold: number;                          // ex. 2
}

export type FlagType = "INCOMPLETE" | "DISAGREEMENT" | "DIMENSION_BELOW_MIN";
export interface Flag { type: FlagType; detail: string }

export interface DimensionScore { score: number; max: number; pct: number }
export interface ScoreResult {
  total: number | null;
  complete: boolean;
  byDimension: Record<Dimension, DimensionScore>;
  potentialIndex: number | null;   // (PEOPLE+EXECUTION) / max * 100
  projectMaturity: number | null;  // BUSINESS / max * 100
  band: Band | null;               // null tant que provisoire
  flags: Flag[];
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const DIMS: Dimension[] = ["PEOPLE", "EXECUTION", "BUSINESS", "IMPACT"];

export function computeScore(
  criteria: Criterion[],
  ratingsByEvaluator: Rating[][],
  config: ModelConfig,
): ScoreResult {
  const flags: Flag[] = [];
  const notes = new Map<string, number[]>();
  for (const ratings of ratingsByEvaluator)
    for (const r of ratings) notes.set(r.criterionCode, [...(notes.get(r.criterionCode) ?? []), r.note]);

  const dims = Object.fromEntries(DIMS.map((d) => [d, { score: 0, max: 0, pct: 0 }])) as Record<Dimension, DimensionScore>;
  let rated = 0;

  for (const c of criteria) {
    dims[c.dimension].max += c.weight;
    const n = notes.get(c.code);
    if (!n?.length) continue;
    rated++;
    const avg = n.reduce((s, x) => s + x, 0) / n.length;
    dims[c.dimension].score += (c.weight * avg) / 5;
    if (n.length > 1 && Math.max(...n) - Math.min(...n) >= config.disagreementThreshold)
      flags.push({ type: "DISAGREEMENT", detail: `${c.label} : notes ${n.join(" / ")}` });
  }

  for (const d of DIMS) {
    dims[d].score = r1(dims[d].score);
    dims[d].pct = dims[d].max ? r1((dims[d].score / dims[d].max) * 100) : 0;
  }

  const complete = criteria.length > 0 && rated === criteria.length;
  if (!complete) flags.push({ type: "INCOMPLETE", detail: `${rated}/${criteria.length} critères notés` });

  const total = rated ? r1(DIMS.reduce((s, d) => s + dims[d].score, 0)) : null;

  if (complete)
    for (const [d, min] of Object.entries(config.dimensionMinimums ?? {}) as [Dimension, number][])
      if (dims[d].pct < min)
        flags.push({ type: "DIMENSION_BELOW_MIN", detail: `${d} à ${dims[d].pct} % (minimum ${min} %)` });

  const pe = dims.PEOPLE.max + dims.EXECUTION.max;
  const potentialIndex = complete && pe ? r1(((dims.PEOPLE.score + dims.EXECUTION.score) / pe) * 100) : null;
  const projectMaturity = complete ? dims.BUSINESS.pct : null;

  const band =
    complete && total !== null
      ? [...config.bands].sort((a, b) => b.min - a.min).find((b) => total >= b.min) ?? null
      : null;

  return { total, complete, byDimension: dims, potentialIndex, projectMaturity, band, flags };
}
```

### 5.3 Tests obligatoires — `engine.test.ts` (Vitest)

```ts
import { describe, it, expect } from "vitest";
import { computeScore } from "./engine";
import criteria from "../../../supabase/seed/criteria.json";

const config = {
  bands: [
    { min: 80, key: "ELEVE", label: "Potentiel élevé" },
    { min: 65, key: "INTERESSANT", label: "Potentiel intéressant" },
    { min: 50, key: "A_CONSOLIDER", label: "À consolider" },
    { min: 0, key: "INSUFFISANT", label: "Insuffisamment démontré" },
  ],
  disagreementThreshold: 2,
};
const all = (note: 1 | 2 | 3 | 4 | 5) => criteria.map((c) => ({ criterionCode: c.code, note }));

describe("computeScore", () => {
  it("poids = 100", () => expect(criteria.reduce((s, c) => s + c.weight, 0)).toBe(100));
  it("tout à 5 => 100", () => expect(computeScore(criteria as any, [all(5)], config).total).toBe(100));
  it("tout à 4 => 80, Potentiel élevé", () => {
    const r = computeScore(criteria as any, [all(4)], config);
    expect(r.total).toBe(80); expect(r.band?.key).toBe("ELEVE");
  });
  it("tout à 3 => 60, À consolider", () => expect(computeScore(criteria as any, [all(3)], config).band?.key).toBe("A_CONSOLIDER"));
  it("tout à 1 => 20", () => expect(computeScore(criteria as any, [all(1)], config).total).toBe(20));
  it("incomplet => pas de bande", () => {
    const r = computeScore(criteria as any, [all(5).slice(0, 10)], config);
    expect(r.band).toBeNull(); expect(r.flags.some((f) => f.type === "INCOMPLETE")).toBe(true);
  });
  it("désaccord ≥ 2 => flag", () => {
    const r = computeScore(criteria as any, [all(5), all(2)], config);
    expect(r.flags.some((f) => f.type === "DISAGREEMENT")).toBe(true);
  });
  it("minimum de dimension => flag malgré un bon total", () => {
    const hi = criteria.map((c) => ({ criterionCode: c.code, note: (c.dimension === "IMPACT" ? 1 : 5) as 1 | 5 }));
    const r = computeScore(criteria as any, [hi], { ...config, dimensionMinimums: { IMPACT: 40 } });
    expect(r.flags.some((f) => f.type === "DIMENSION_BELOW_MIN")).toBe(true);
  });
});
```

### 5.4 Validation d'une note (zod, partagée client/serveur)

```ts
export const scoreInput = z.object({
  criterionCode: z.string(),
  note: z.number().int().min(1).max(5),
  evidences: z.array(z.string().min(5)).default([]),
  strongProof: z.boolean().default(false),
  toVerify: z.boolean().default(false),
  comment: z.string().optional(),
}).refine((s) => s.note < 4 || s.evidences.length >= 2 || s.strongProof, {
  message: "Une note 4 ou 5 demande au moins 2 preuves, ou 1 preuve très forte.",
  path: ["evidences"],
});
```

---

## 6. Back-end : Server Actions / endpoints

Tout passe par des **Server Actions** (ou Route Handlers) validés par zod, exécutés avec le client Supabase serveur (RLS active). Jamais de clé `service_role` côté navigateur.

| Action | Rôle autorisé | Comportement |
|---|---|---|
| `startApplication(programId)` | candidat | Crée candidat + candidature, enregistre le consentement versionné. |
| `savePrequalAnswer(appId, qId, data)` | candidat | **Sauvegarde auto** à chaque réponse (debounce 800 ms). |
| `uploadProof(appId, file)` | candidat | Storage privé, compression client (<300 Ko), URL signée courte. |
| `submitPrequal(appId)` | candidat | Verrouille, passe l'étape à `QUALIFICATION`, notifie. |
| `assignEvaluator(appId, evalId, kind)` | admin | Crée l'évaluation `draft`. |
| `saveScore(evalId, scoreInput)` | évaluateur | Upsert note + preuves (autosave). |
| `submitEvaluation(evalId)` | évaluateur | Vérifie complétude, passe `submitted`, ouvre la vue comparative. |
| `raiseAlert(appId, payload)` | évaluateur/jury | Exige faits + source ; notifie le jury. |
| `getApplicationScore(appId)` | jury/admin | Appelle `computeScore` avec le modèle de la campagne. |
| `recordDecision(appId, payload)` | jury | Refuse sans justification ; fige modèle + score utilisés ; alerte ouverte => confirmation explicite. |
| `exportReportPdf(appId)` | jury/admin | Rapport individuel (radar, forces, risques, plan 90 j). |
| `aiSummarize(appId)` | évaluateur/jury | **Suggestion** de synthèse des preuves et d'incohérences, étiquetée « proposition IA », journalisée. |

### Assistant IA — garde-fous
- Entrée : réponses du candidat + preuves déjà saisies. Sortie : JSON validé par zod (`{ strengths[], risks[], inconsistencies[], questions_to_ask[] }`).
- Jamais de note, de score ni de décision générés. Jamais de données identifiantes inutiles dans le prompt.
- Chaque appel est écrit dans `audit_log` (qui, quand, quelles données).
- Les textes en wolof/français mixte doivent être gérés ; ne pas supposer l'orthographe.

---

## 7. Front-end : parcours et écrans

### 7.1 Carte des pages

| Route | Public | Rôle |
|---|---|---|
| `/` | tous | Présentation, bouton « Commencer ma candidature ». |
| `/candidater` | candidat | **Assistant de préqualification** (13 questions, une par écran sur mobile). |
| `/candidature/[id]` | candidat | Statut simple (« Reçue », « En évaluation », « Décision communiquée ») + restitution. |
| `/evaluateur` | évaluateur | Mes dossiers (à faire / en cours / soumis), hors-ligne. |
| `/evaluateur/[appId]` | évaluateur | **Grille d'évaluation** (19 critères) + guide STAR + preuves. |
| `/jury` | jury | Classement, filtres (région, secteur, stade, persona, bande), alertes. |
| `/jury/[appId]` | jury | **Synthèse jury** : radar, preuves, risques, comparatif évaluateurs, décision. |
| `/admin/programmes` | admin | Campagnes, affectations, calendrier 6 semaines. |
| `/admin/modele-de-scoring` | admin | Poids, seuils, minimums (nouvelle version à chaque changement). |
| `/admin/equite` | admin | Écarts de scores par genre/région/langue/stade (phase 3). |

### 7.2 Parcours candidat (priorité absolue sur la fluidité)

1. **Entrée en 30 secondes** : prénom + téléphone ou e-mail. Aucun mot de passe : lien magique / code OTP.
2. **Une question par écran** (mobile), barre de progression avec temps restant (« Encore ~12 min »).
3. **Sauvegarde automatique** visible (« Enregistré ») ; reprise par lien envoyé par SMS/WhatsApp/e-mail.
4. **Preuves en option, jamais bloquantes** : bouton « Prendre une photo » (facture, capture Wave/Orange Money, carnet) ou « Je n'ai pas de preuve pour l'instant » (non pénalisant, la raison est notée).
5. Aide contextuelle courte sous chaque question + exemple de bonne réponse.
6. Écran final : récapitulatif modifiable, consentement relu, « Envoyer ma candidature ». Confirmation claire des prochaines étapes et délais.

### 7.3 Grille évaluateur (efficacité sur le terrain)

- Écran en **deux volets** (bureau) / onglets (mobile) : à gauche réponses du candidat et preuves, à droite la grille.
- Pour chaque critère : sélecteur **1–5 avec ancrage affiché au survol/tap** (« 3 – Opérationnel : exemple précis, action personnelle identifiable… »), champ preuves (ajout rapide en puces), case « À vérifier », commentaire.
- Le blocage « note 4–5 sans 2 preuves » s'explique **dans la ligne** (pas de popup).
- Total provisoire en pied d'écran, **sans afficher les notes des autres évaluateurs** tant qu'on n'a pas soumis.
- Raccourcis clavier (1–5, ↑↓), navigation par critère, bouton « Question STAR suivante ».
- Mode **hors-ligne** : brouillons en IndexedDB, synchronisation au retour du réseau, état de sync visible.

### 7.4 Tableau jury

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Programme : Cohorte Dakar-Thiès     Filtres : Région ▾ Secteur ▾ Stade ▾ Bande ▾│
├───────────────┬───────────┬────────┬──────────┬──────────────┬────────────────┤
│ Candidat      │ Région    │ Score  │ Bande    │ Potentiel/Projet │ Alertes     │
├───────────────┼───────────┼────────┼──────────┼──────────────┼────────────────┤
│ A. Diop       │ Thiès     │ 82,5   │ Élevé    │ Fort / Mature │ —             │
│ M. Ndiaye     │ Kaolack   │ 71,0   │ Intér.   │ Fort / Immature│ 1 à vérifier  │
└───────────────┴───────────┴────────┴──────────┴──────────────┴────────────────┘
        clic ligne → panneau latéral : radar 4 dimensions + 2 preuves + 2 risques + désaccords évaluateurs
```
- **Comparaison côte à côte** de 2 à 3 candidats (utile pour départager des scores proches).
- Décision : formulaire guidé (décision, justification obligatoire, conditions avant admission, recommandations à 90 jours). Le système affiche le score et les flags mais **le jury tranche**.
- Les scores ne sont **jamais présentés en rouge** pour un candidat faible ; le rouge est réservé aux alertes factuelles.

### 7.5 Composants à construire

`ScoreSelector` (1–5 avec ancrages), `EvidenceList`, `DimensionRadar`, `ScoreSummaryBar`, `BandBadge`, `AlertCard`, `ProgressWizard`, `SaveIndicator`, `ProofUploader` (caméra), `ApplicantTable`, `CompareDrawer`, `JuryDecisionForm`, `OfflineBanner`, `LocaleSwitch`.

---

## 8. Design et expérience (UI fluide, simple, locale)

> Appliquer le skill **frontend-design** : d'abord un mini plan (couleurs, typo, layout, principes), le critiquer par rapport au brief, puis coder. Ne pas se rabattre sur les défauts « IA » (fond crème + terracotta, noir + vert acide, cartes identiques avec ombre grise, eyebrows en capitales partout).

### 8.1 Principes
1. **Une seule chose mémorable** : le **radar de potentiel**, soigné et lisible. Le reste reste calme et sobre.
2. **Mobile d'abord, réseau faible d'abord** : JS initial < 150 Ko sur `/candidater`, images compressées, polices avec repli système, aucune animation bloquante.
3. **Dignité du candidat** : langage respectueux, pas de score humiliant, aucune équivalence « informel = faible ».
4. **Lisible en plein soleil** : contrastes AA minimum (idéalement AAA pour le texte), cibles tactiles ≥ 48 px, texte ≥ 16 px.
5. **Moins de champs, plus de clarté** : une idée par écran, aide courte, valeurs par défaut utiles.
6. **Mouvement utile seulement** : transitions en réponse à une action (étape suivante, enregistrement). `prefers-reduced-motion` respecté.

### 8.2 Tokens (`src/styles/tokens.css`)

```css
:root {
  /* Couleurs — 6 valeurs nommées */
  --baobab: #0E6B4F;   /* primaire : actions, progression */
  --nuit:   #14212B;   /* texte, titres */
  --brume:  #F5F7F6;   /* fond de page (neutre froid) */
  --ocean:  #1D5C8A;   /* information, liens, bande "Potentiel intéressant" */
  --soleil: #E8A317;   /* accent rare : point d'attention, sommet du radar */
  --alerte: #B3261E;   /* alertes FACTUELLES uniquement, jamais pour un faible score */

  /* Échelle de bandes (jamais rouge) */
  --band-eleve: #0E6B4F;
  --band-interessant: #1D5C8A;
  --band-consolider: #B7791F;
  --band-insuffisant: #5B6B78;

  /* Typo */
  --font-display: "Bricolage Grotesque", system-ui, sans-serif;
  --font-body: "Figtree", system-ui, sans-serif;
  --step-0: 1rem; --step-1: 1.25rem; --step-2: 1.563rem; --step-3: 1.953rem; --step-4: 2.441rem;
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px;
  --measure: 66ch;            /* longueur de ligne max */
  --focus: 3px solid var(--ocean);
}
@media (prefers-color-scheme: dark) {
  :root { --brume: #0F171D; --nuit: #E8EEF1; }
}
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
```
- **Typo** : Bricolage Grotesque (titres, caractère) + Figtree (corps, très lisible sur petits écrans). Alternative si le poids réseau est critique : polices système uniquement.
- **Rayons différenciés** par rôle (boutons, cartes, panneaux) plutôt qu'un rayon unique partout.
- **Nommer ce qui existe** : bandes affichées avec libellé texte + icône, jamais par la couleur seule.

### 8.3 Règles de rédaction de l'interface (français simple, côté candidat « vous »)

- Phrases courtes, verbes d'action, majuscule de phrase uniquement.
- Un bouton garde **le même nom dans tout le parcours** : « Envoyer ma candidature » → message « Candidature envoyée ».
- Les erreurs expliquent quoi faire : « Ce numéro semble trop court. Ajoutez les 9 chiffres, par exemple 77 123 45 67. »
- Les écrans vides invitent à agir : « Aucun dossier assigné pour l'instant. Votre coordinateur vous en attribuera bientôt. »
- Éviter le jargon (« scorecard », « assessment ») côté candidat ; garder les termes métier côté jury.
- Exemples de réponses locaux (marché, atelier, GIE, tontine, mobile money) plutôt que des exemples importés.

### 8.4 Accessibilité et inclusion
- Navigation clavier complète, focus visible, labels explicites, `aria-live` pour l'enregistrement auto.
- **Version orale** (phase 2/3) : enregistrement audio de la réponse (MediaRecorder) avec transcription optionnelle ; indispensable pour les entrepreneurs peu à l'aise à l'écrit.
- Wolof : tous les textes via `next-intl` dès le départ ; relecture par locuteurs natifs avant mise en ligne.
- Adapter les situations de mise en scène à Dakar **et** aux régions.

---

## 9. Sécurité, conformité, éthique

- **Données personnelles** : le Sénégal dispose d'une loi sur la protection des données (loi 2008-12) et d'une autorité de contrôle (CDP). **À vérifier avec un juriste** : déclarations/autorisations requises, transfert hors Sénégal (hébergement Supabase/Vercel en Europe), durée de conservation. Prévoir un choix d'hébergeur modifiable.
- Consentement explicite, **versionné et horodaté** (table `consents`) pour : évaluation, vérification des informations, usage anonymisé pour la recherche, usage de l'IA.
- Minimisation : ne collecter que le nécessaire ; `gender`/`region` servent à **l'équité**, pas au score.
- Chiffrement en transit/au repos, URL de fichiers signées, journal d'audit, rôles stricts, 2FA pour admin/jury, sauvegardes.
- **Droit d'accès/suppression** : écran « Mes données » (export + demande de suppression).
- **Équité** : mesurer les écarts de scores par genre, région, langue, stade ; documenter les corrections.
- Transparence candidat : expliquer comment le score est utilisé et que **la décision est humaine**.
- Revue sécurité automatique à chaque PR (skill `security-guidance`), dépendances auditées.

---

## 10. Plan de pilote et validation (à prévoir dans le produit)

1. **Pilote 20–30 entrepreneurs** (idée, premières ventes, établis, femmes, plusieurs régions) pour mesurer : homogénéité des évaluateurs, repérage forces/fragilités, premiers liens avec les performances.
2. Extension à **100–150** candidats : cohérence des scores, absence de désavantage systématique, comparaison automatique ↔ jury.
3. Suivi **6 / 12 / 24 mois** : CA, clients, emplois, remboursement, survie → **indice de prédictivité** (corrélation score initial ↔ résultat).
4. Ne figer ni pondérations ni seuils avant ces résultats ; exposer l'historique des versions de modèle.

Indicateurs du tableau de bord (Playbook §12 + Support PBE §9) : candidatures qualifiées et dossiers complets, conversion par étape, délai de sélection, diversité (régions, femmes, secteurs, stades), concordance score ↔ jury, score entrée vs 12 mois, taux de survie, croissance CA/emplois, formalisation progressive, remboursements, partenariats conclus, satisfaction.

---

## 11. Définition de « terminé » (qualité)

- [ ] Moteur de scoring couvert à 100 % (Vitest), poids = 100 vérifié à l'import.
- [ ] Parcours candidat complet testé en E2E (Playwright) sur viewport mobile 360 px, réseau « Slow 3G ».
- [ ] Notation en aveugle vérifiée (test RLS) ; un candidat ne peut lire aucun score.
- [ ] Lighthouse mobile : Performance ≥ 85, Accessibilité ≥ 95.
- [ ] Aucune clé secrète côté client ; revue `security-guidance` sans alerte ouverte.
- [ ] Rapport PDF généré pour un dossier de test complet.
- [ ] Tous les textes visibles dans `messages/fr.json` (aucun texte en dur dans les composants).

---

## 12. Prompts prêts à coller dans Claude Code

### 12.0 `CLAUDE.md` (à créer à la racine)

```markdown
# SE-POTENTIAL 360°
Lire SPEC.md avant toute tâche. Stack : Next.js 15 App Router, TypeScript strict, Tailwind, shadcn/ui, Supabase, zod, Vitest, Playwright.
Règles :
- Respecter le skill `se-potential-method` (scoring, alertes, éthique) et `se-potential-copy-fr` (textes).
- Utiliser Context7 pour toute API de bibliothèque ; ne pas deviner les signatures.
- Poids et seuils uniquement en base (scoring_models), jamais en dur.
- Toute logique de score passe par src/lib/scoring/engine.ts ; ajouter des tests avant de modifier.
- Aucun texte en dur dans les composants : next-intl (messages/fr.json).
- UI : suivre les tokens de SPEC.md §8 et le skill frontend-design ; mobile d'abord (360 px).
- Jamais de service_role côté client. RLS sur toutes les tables.
- Un commit par tâche, message en français à l'impératif.
```

### 12.1 Cadrage (avant de coder)
```
Lis SPEC.md. Utilise le skill Grill Me pour m'interroger, une question à la fois, sur les points
ouverts de la section 14 (seuils, hébergement des données, langues, fournisseur OTP). Puis utilise
Superpowers (brainstorm → spec → plan) et écris le plan de la Phase 1 dans PLAN.md avec cases à cocher.
```

### 12.2 Fondations
```
Initialise le projet selon SPEC.md §2 : Next.js 15 + TS strict + Tailwind + shadcn/ui + next-intl + Supabase.
Crée les migrations SQL de §4 (avec RLS de base), scripts/import-xlsx.ts qui lit
SE_POTENTIAL_360_Scorecard.xlsx et génère supabase/seed/*.json (échoue si somme des poids ≠ 100),
et src/styles/tokens.css de §8.2. Ajoute Vitest. Montre-moi la commande pour lancer en local.
```

### 12.3 Moteur de scoring (TDD)
```
Implémente src/lib/scoring/engine.ts et engine.test.ts exactement selon SPEC.md §5, en TDD :
écris d'abord les tests, vois-les échouer, puis implémente. Ajoute le schéma zod de §5.4.
Ne passe à la suite que lorsque tous les tests sont verts.
```

### 12.4 Parcours candidat
```
Construis /candidater selon SPEC.md §7.2 et §8 : assistant 1 question par écran, sauvegarde auto
(debounce 800 ms) avec indicateur « Enregistré », reprise par lien, upload de preuve par caméra avec
compression client, option « Je n'ai pas de preuve pour l'instant », récapitulatif + consentement.
Utilise le skill frontend-design : propose d'abord le mini plan design (couleurs, typo, layout) puis code.
Teste avec Playwright en viewport 360 px.
```

### 12.5 Grille évaluateur
```
Construis /evaluateur et /evaluateur/[appId] selon §7.3 : ScoreSelector 1–5 avec ancrages du Guide de
notation, preuves en puces, blocage explicite des notes 4–5 sans 2 preuves (message en ligne), total
provisoire, notation en aveugle (RLS + test). Ajoute le brouillon hors-ligne (IndexedDB) et l'indicateur de synchro.
```

### 12.6 Jury et rapport
```
Construis /jury et /jury/[appId] selon §7.4 : tableau filtrable, panneau latéral avec DimensionRadar,
flags (incomplet, désaccord, minimum de dimension), alertes, comparaison 2–3 candidats, formulaire de
décision avec justification obligatoire. Génère le rapport PDF individuel (@react-pdf/renderer).
```

### 12.7 Revue finale
```
Lance webapp-testing / Playwright sur les 3 parcours (candidat, évaluateur, jury) en 360 px et Slow 3G.
Lance la revue security-guidance. Vérifie la checklist de SPEC.md §11 et liste ce qui reste.
```

---

## 13. Annexe — référentiels à charger depuis l'Excel

- **Préqualification (13 questions)** : activité en 3 phrases · qui a le problème et comment il le résout aujourd'hui · stade actuel · preuves · réalisations des 90 derniers jours · CA/volume récent (période + source) · charges et marge · ressources mobilisées sans financement externe · équipe et rôles · obstacle majeur et ajustement · objectif mesurable à 6 mois · accompagnement utile · pièces partageables.
- **STAR** : 8 compétences × 5 questions = 40 questions, chacune avec relances « Situation ? Rôle personnel ? Actions précises ? Résultat vérifiable ? Apprentissage ? ».
- **Assessment center (4 exercices)** : *Client discovery sprint* · *Arbitrage sous contrainte* · *Changement de cap* · *Coopération et désaccord*.
- **Business Challenge 48 h** (Support PBE §8) : 100 000 FCFA et 48 h pour démontrer une demande réelle ; missions : 5 clients interviewés, proposition de valeur, prototype simple, modèle économique élémentaire, stratégie des 3 premiers clients, difficultés et ajustements ; critères : initiative, créativité, orientation client, adaptabilité, leadership, exécution, apprentissage. Budget et durée = paramètres adaptables ; les moyens personnels ne doivent pas conditionner la participation.
- **Synthèse jury** : candidat/entreprise · région/secteur/stade · 2 preuves majeures · 2 risques/points à vérifier · compétences fortes · à développer · score final · décision · justification · conditions avant admission · recommandations à 90 jours · évaluateurs et date.
- **Parcours d'accompagnement par persona (A–E)** et **critères « business ensemble »** : à modéliser en phase 2–3 d'après Playbook §8 et §11.

---

## 14. Points ouverts à trancher avant ou pendant la Phase 1

1. **Jeu de seuils par défaut** : 80/65/50 (Excel) — confirmé ?
2. **Minimums par dimension** : quelles valeurs (ex. IMPACT ≥ 40 %, BUSINESS ≥ 40 %) ?
3. **Hébergement des données** : Europe (rapide) ou solution locale/souveraine ? Besoin d'un avis juridique CDP.
4. **Connexion candidat** : e-mail, SMS OTP ou WhatsApp (et fournisseur) ?
5. **Langues au lancement** : français seul, ou wolof dès la V1 (texte + audio) ?
6. **Modèle de déploiement** : un seul incubateur au départ, ou multi-organisations dès la V1 ?
7. **Tests psychométriques externes** (META, Entrepreneur DNA, EntreComp) : intégration, licences, ou questionnaire propriétaire validé sur pilote ?
8. **Qui est le jury** et combien d'évaluateurs par dossier (recommandé : 2 minimum pour mesurer l'homogénéité) ?
9. **Nom et identité visuelle** : « SE-POTENTIAL 360° » confirmé ? Logo, couleurs institutionnelles éventuelles à intégrer aux tokens.
