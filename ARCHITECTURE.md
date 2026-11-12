# Architecture SE-POTENTIAL 360°

## 📐 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                      NAVIGATEUR                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │  Candidat  │  │ Évaluateur │  │    Jury    │           │
│  │  /candidater│  │/evaluateur │  │   /jury    │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│         │               │               │                   │
│         └───────────────┴───────────────┘                  │
│                         │                                   │
│         ┌───────────────▼───────────────┐                  │
│         │    Next.js 15 App Router      │                  │
│         │    (Client Components)        │                  │
│         └───────────────┬───────────────┘                  │
└─────────────────────────┼─────────────────────────────────┘
                          │
┌─────────────────────────▼─────────────────────────────────┐
│                   SERVEUR (Next.js)                        │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │            Server Actions / API Routes              │  │
│  │  • startApplication()   • saveScore()              │  │
│  │  • uploadProof()        • submitEvaluation()       │  │
│  │  • raiseAlert()         • recordDecision()         │  │
│  └────────────┬────────────────────────┬───────────────┘  │
│               │                        │                   │
│  ┌────────────▼──────────┐  ┌─────────▼────────────────┐ │
│  │  Moteur de Scoring    │  │   Client Supabase        │ │
│  │  lib/scoring/engine.ts│  │   (avec RLS activé)      │ │
│  │  • computeScore()     │  │                           │ │
│  │  • 4 dimensions       │  └──────────┬────────────────┘ │
│  │  • Bandes             │             │                  │
│  │  • Flags              │             │                  │
│  └───────────────────────┘             │                  │
└─────────────────────────────────────────┼──────────────────┘
                                          │
┌─────────────────────────────────────────▼──────────────────┐
│                   SUPABASE (Backend)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   PostgreSQL    │  │     Auth     │  │   Storage    │  │
│  │                 │  │              │  │              │  │
│  │  • profiles     │  │ • Magic link │  │ • Preuves    │  │
│  │  • candidates   │  │ • OTP        │  │ • Photos     │  │
│  │  • applications │  │ • Rôles      │  │ • Documents  │  │
│  │  • evaluations  │  │              │  │              │  │
│  │  • criteria     │  └──────────────┘  └──────────────┘  │
│  │  • scores       │                                       │
│  │  • decisions    │   ┌──────────────────────────────┐  │
│  │  ...17 tables   │   │    Row Level Security (RLS)  │  │
│  └─────────────────┘   │  • Par rôle                  │  │
│                        │  • Notation en aveugle       │  │
│                        │  • Isolation des données     │  │
│                        └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Flux de données principaux

### 1. Parcours Candidat

```
Candidat → /candidater
    │
    ├─ Étape 1: Connexion (magic link)
    │      │
    │      ▼
    │  startApplication()
    │      │
    │      ▼
    │  Création candidat + application
    │
    ├─ Étapes 2-14: Questions (13 questions)
    │      │
    │      ▼
    │  savePrequalAnswer() [auto-save 800ms]
    │      │
    │      ▼
    │  prequal_answers (base)
    │
    ├─ Preuves optionnelles
    │      │
    │      ▼
    │  uploadProof()
    │      │
    │      ▼
    │  Supabase Storage + compression
    │
    └─ Étape 15: Soumission
           │
           ▼
       submitPrequal()
           │
           ▼
       Stage = QUALIFICATION
           │
           ▼
       Notification évaluateurs
```

### 2. Évaluation

```
Évaluateur → /evaluateur/[appId]
    │
    ├─ Lecture des réponses candidat (RLS: assigned only)
    │      │
    │      ▼
    │  prequal_answers, proofs
    │
    ├─ Notation critère par critère
    │      │
    │      ▼
    │  saveScore(evaluation_id, criterion_id, note, evidences)
    │      │
    │      ▼
    │  Validation Zod:
    │    • note 4-5 → ≥ 2 preuves OU strong_proof
    │      │
    │      ▼
    │  evaluation_scores (draft)
    │
    └─ Soumission
           │
           ▼
       submitEvaluation()
           │
           ▼
       Vérification complétude (19 critères)
           │
           ▼
       Status = submitted
           │
           ▼
       Les notes deviennent visibles au jury
       (mais pas aux autres évaluateurs)
```

### 3. Décision Jury

```
Jury → /jury/[appId]
    │
    ├─ Lecture de toutes les évaluations soumises
    │      │
    │      ▼
    │  evaluations, evaluation_scores
    │      │
    │      ▼
    │  Agrégation par le moteur de scoring
    │      │
    │      ▼
    │  computeScore(criteria, ratings[][], config)
    │      │
    │      ├─ Moyenne des notes
    │      ├─ Score par dimension
    │      ├─ Indice potentiel
    │      ├─ Maturité projet
    │      ├─ Bande finale
    │      └─ Flags (désaccord, minimum, incomplet)
    │
    ├─ Visualisation
    │      │
    │      ├─ Radar 4 dimensions
    │      ├─ Preuves principales
    │      ├─ Risques
    │      └─ Comparaison évaluateurs
    │
    ├─ Décision
    │      │
    │      ▼
    │  recordDecision(appId, {
    │    decision, justification,
    │    conditions, plan_90d
    │  })
    │      │
    │      ▼
    │  jury_decisions
    │      │
    │      ▼
    │  Audit log
    │      │
    │      ▼
    │  Notification candidat
    │
    └─ Génération rapport PDF
           │
           ▼
       @react-pdf/renderer
           │
           ▼
       Rapport individuel complet
```

## 🔐 Sécurité : Row Level Security (RLS)

### Candidat
```sql
-- Peut LIRE ses propres données
SELECT * FROM candidates WHERE user_id = auth.uid()

-- Peut ÉCRIRE ses réponses
INSERT INTO prequal_answers WHERE application_id IN (
  SELECT id FROM applications WHERE candidate_id IN (
    SELECT id FROM candidates WHERE user_id = auth.uid()
  )
)

-- NE PEUT JAMAIS lire les scores
-- evaluation_scores: NO ACCESS
```

### Évaluateur
```sql
-- Peut lire les candidatures assignées
SELECT * FROM applications WHERE id IN (
  SELECT application_id FROM evaluations 
  WHERE evaluator_id = auth.uid()
)

-- Notation en aveugle: peut SEULEMENT lire SES scores
SELECT * FROM evaluation_scores WHERE evaluation_id IN (
  SELECT id FROM evaluations WHERE evaluator_id = auth.uid()
)

-- Ne voit les autres scores que APRÈS soumission
-- et SEULEMENT si jury/admin
```

### Jury
```sql
-- Peut lire toutes les évaluations SOUMISES
SELECT * FROM evaluations WHERE status = 'submitted'

-- Peut lire tous les scores soumis
SELECT * FROM evaluation_scores WHERE evaluation_id IN (
  SELECT id FROM evaluations WHERE status = 'submitted'
)

-- Peut créer des décisions
INSERT INTO jury_decisions (...)
```

### Admin
```sql
-- Accès complet pour gestion
-- + création de programmes
-- + affectation évaluateurs
-- + gestion modèles de scoring
```

## 📊 Moteur de Scoring : Algorithme

```typescript
function computeScore(
  criteria: Criterion[],        // 19 critères avec poids
  ratingsByEvaluator: Rating[][], // Notes de chaque évaluateur
  config: ModelConfig           // Bandes, seuils, minimums
): ScoreResult {
  
  // 1. Agréger les notes de tous les évaluateurs
  const notes = new Map<string, number[]>();
  for (const ratings of ratingsByEvaluator) {
    for (const r of ratings) {
      notes.set(r.criterionCode, [...notes.get(r.criterionCode), r.note]);
    }
  }
  
  // 2. Calculer score par dimension
  for (const criterion of criteria) {
    const notesForCriterion = notes.get(criterion.code);
    const moyenne = sum(notesForCriterion) / notesForCriterion.length;
    
    // Score pondéré = poids × moyenne / 5
    dimension[criterion.dimension].score += (criterion.weight × moyenne) / 5;
  }
  
  // 3. Calculer les métriques
  const total = sum(allDimensionScores);  // Sur 100
  const potentialIndex = (PEOPLE + EXECUTION) / max × 100;
  const projectMaturity = BUSINESS / max × 100;
  
  // 4. Déterminer la bande
  const band = bands.find(b => total >= b.min);
  
  // 5. Détecter les flags
  if (!complete) flags.push('INCOMPLETE');
  if (disagreement >= threshold) flags.push('DISAGREEMENT');
  if (dimension < minimum) flags.push('DIMENSION_BELOW_MIN');
  
  return { total, band, potentialIndex, projectMaturity, flags };
}
```

### Exemple de calcul

**Critère** : "Vision stratégique et ambition" (poids: 5)
- Évaluateur 1 : note 4
- Évaluateur 2 : note 5

**Moyenne** : (4 + 5) / 2 = 4.5

**Score pondéré** : (5 × 4.5) / 5 = 4.5

Si tous les critères PEOPLE (40 points) sont à 4.5 :
- Score PEOPLE = 40 × 4.5 / 5 = **36 points**

## 🎨 Design Tokens

```css
:root {
  /* Couleurs sémantiques */
  --baobab: #0E6B4F;    /* Actions primaires */
  --nuit:   #14212B;    /* Texte principal */
  --brume:  #F5F7F6;    /* Fond de page */
  --ocean:  #1D5C8A;    /* Information */
  --soleil: #E8A317;    /* Attention */
  --alerte: #B3261E;    /* Alertes */
  
  /* Bandes de scoring (jamais rouge pour faible score) */
  --band-eleve:        #0E6B4F;  /* ≥80 */
  --band-interessant:  #1D5C8A;  /* ≥65 */
  --band-consolider:   #B7791F;  /* ≥50 */
  --band-insuffisant:  #5B6B78;  /* <50 */
  
  /* Typographie fluide */
  --step-0: 1rem;     /* 16px */
  --step-1: 1.25rem;  /* 20px */
  --step-2: 1.563rem; /* 25px */
  --step-3: 1.953rem; /* 31px */
  --step-4: 2.441rem; /* 39px */
}
```

## 🔄 États de l'application

### Candidature (stage)
```
REPERAGE → Candidat démarre le formulaire
    ↓
QUALIFICATION → Préqualification soumise, en attente d'évaluation
    ↓
ENTRETIEN → Entretien STAR (phase 2)
    ↓
IMMERSION → Assessment Center + Challenge 48h (phase 2)
    ↓
DECISION → Jury a statué
```

### Évaluation (status)
```
draft → Évaluateur en cours de notation
    ↓
submitted → Évaluation complète et soumise
```

### Décision (decision_t)
```
SELECTION_PRIORITAIRE    → Sélectionné, priorité haute
ACCOMPAGNEMENT_CIBLE     → Sélectionné, besoins spécifiques
PRE_INCUBATION           → Pré-incubation recommandée
NON_RETENU_A_CE_STADE    → Non retenu pour l'instant
COMPLEMENT_REQUIS        → Informations complémentaires requises
```

## 📱 Responsive Design

```
Mobile  (360px - 767px)   : 1 colonne, composants empilés
Tablet  (768px - 1023px)  : 2 colonnes, volets repliables
Desktop (1024px+)         : 2-3 colonnes, tout visible
```

### Breakpoints Tailwind
```javascript
screens: {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}
```

## 🧪 Stratégie de test

### Unitaires (Vitest)
- ✅ Moteur de scoring : 100%
- Validation Zod
- Utilitaires

### E2E (Playwright)
- Parcours candidat complet (360px, Slow 3G)
- Notation en aveugle (vérif RLS)
- Soumission et décision
- Génération PDF

### Lighthouse
- Performance ≥ 85
- Accessibilité ≥ 95
- SEO ≥ 90

## 📦 Build et déploiement

```bash
# Développement
npm run dev

# Tests
npm test              # Unitaires
npm run test:e2e      # E2E

# Production
npm run build         # Build optimisé
npm run start         # Serveur production

# Lint
npm run lint
```

### Vercel (recommandé)
1. Connecter le repo GitHub
2. Configurer les variables d'env
3. Deploy automatique sur chaque push

---

**Architecture validée** : 11 novembre 2026
**Version** : 1.0.0 (Phase 0 - Fondations)
