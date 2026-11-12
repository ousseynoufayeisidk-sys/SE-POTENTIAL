# 📝 TODO - SE-POTENTIAL 360°

## 🔴 Urgent - Phase 1 MVP

### Parcours Candidat

#### Upload de preuves
- [ ] Créer le bucket Supabase Storage "proofs"
- [ ] Implémenter `uploadProof()` dans `ProofUploader.tsx`
- [ ] Générer URLs signées pour accès sécurisé
- [ ] Tester compression < 300Ko
- [ ] Gérer suppression de preuve
- [ ] Afficher preview de l'image uploadée

#### Récapitulatif et soumission
- [ ] Créer `/candidater/recapitulatif/page.tsx`
- [ ] Afficher toutes les réponses
- [ ] Bouton "Modifier" par question
- [ ] Page consentement avec checkboxes
- [ ] Texte de consentement versionné
- [ ] Enregistrer consentement en base
- [ ] Confirmation "Candidature envoyée"
- [ ] Générer lien de reprise unique
- [ ] Envoyer email/SMS avec lien

#### Page de statut
- [ ] Créer `/candidature/[id]/page.tsx`
- [ ] Afficher statut simple (Reçue, En évaluation, Décision)
- [ ] Accès via lien de reprise
- [ ] Message clair des prochaines étapes

### Grille d'Évaluation

#### Page évaluateur détails
- [ ] Créer `/evaluateur/[appId]/page.tsx`
- [ ] Layout split screen (mobile: tabs, desktop: côte à côte)
- [ ] Volet gauche: charger réponses candidat
- [ ] Afficher les preuves uploadées
- [ ] Volet droit: charger les 19 critères
- [ ] Ordre par dimension (PEOPLE → EXECUTION → BUSINESS → IMPACT)

#### Composant ScoreSelector
- [ ] Créer `components/evaluation/ScoreSelector.tsx`
- [ ] Radio buttons 1-5 stylés
- [ ] Ancrages au survol/tap:
  - 1: Non démontré
  - 2: Émergent
  - 3: Opérationnel
  - 4: Confirmé
  - 5: Très solide
- [ ] Afficher le poids du critère
- [ ] Total provisoire en temps réel

#### Validation et preuves
- [ ] Champ "Preuves" (textarea, bullets)
- [ ] Compteur de preuves (minimum 2)
- [ ] Blocage si note ≥ 4 et < 2 preuves
- [ ] Checkbox "Preuve très forte" (bypass 2 preuves)
- [ ] Checkbox "À vérifier"
- [ ] Champ commentaire
- [ ] Message explicatif si blocage

#### Soumission évaluation
- [ ] Vérifier complétude (19 critères notés)
- [ ] Modal de confirmation
- [ ] Changer status → 'submitted'
- [ ] Notification jury (optionnel)
- [ ] Redirection vers liste

### Tableau Jury

#### Page synthèse candidat
- [ ] Créer `/jury/[appId]/page.tsx`
- [ ] Charger toutes les évaluations soumises
- [ ] Calculer score avec moteur existant
- [ ] Appeler `computeScore(criteria, ratings, config)`

#### Composant DimensionRadar
- [ ] Créer `components/jury/DimensionRadar.tsx`
- [ ] Utiliser Recharts RadarChart
- [ ] 4 dimensions (PEOPLE, EXECUTION, BUSINESS, IMPACT)
- [ ] Légende avec couleurs
- [ ] Responsive

#### Synthèse et flags
- [ ] Afficher score total + bande
- [ ] Badge coloré selon bande
- [ ] Liste des 2 preuves principales (saisie manuelle)
- [ ] Liste des 2 risques principaux (saisie manuelle)
- [ ] Afficher flags:
  - Incomplet
  - Désaccord ≥ 2 points
  - Dimension < minimum
- [ ] Comparaison des évaluateurs (tableau)

#### Formulaire de décision
- [ ] Créer `components/jury/DecisionForm.tsx`
- [ ] Select décision (5 options)
- [ ] Textarea justification (obligatoire, min 50 caractères)
- [ ] Textarea conditions (optionnel)
- [ ] Textarea plan 90 jours (optionnel)
- [ ] Validation avant soumission
- [ ] Enregistrer dans `jury_decisions`
- [ ] Enregistrer dans `audit_log`
- [ ] Confirmation

### Génération PDF

#### Configuration
- [ ] Installer/vérifier `@react-pdf/renderer`
- [ ] Créer `lib/pdf/template.tsx`
- [ ] Définir styles PDF (polices, couleurs)

#### Rapport individuel
- [ ] En-tête avec logo + nom candidat
- [ ] Section scores:
  - Score total
  - Bande
  - Scores par dimension
  - Radar (image PNG générée)
- [ ] Section forces/risques
- [ ] Section décision:
  - Décision
  - Justification
  - Conditions
  - Plan 90 jours
- [ ] Pied de page (date, jury)

#### Endpoint API
- [ ] Créer `/app/api/reports/[appId]/route.ts`
- [ ] Vérifier permissions (jury/admin only)
- [ ] Générer PDF à la volée
- [ ] Headers pour téléchargement
- [ ] Gestion des erreurs

### Administration

#### Page programmes
- [ ] Créer `/admin/programmes/page.tsx`
- [ ] Liste des programmes/campagnes
- [ ] Formulaire création programme
- [ ] Dates début/fin
- [ ] Affectation modèle de scoring
- [ ] Affectation évaluateurs à candidatures

#### Page modèle de scoring
- [ ] Créer `/admin/modele-de-scoring/page.tsx`
- [ ] Tableau des 19 critères
- [ ] Édition poids (input number)
- [ ] Total automatique (doit = 100)
- [ ] Blocage si ≠ 100
- [ ] Édition seuils des bandes
- [ ] Édition minimums par dimension
- [ ] Bouton "Créer nouvelle version"
- [ ] Versioning automatique
- [ ] Liste des versions historiques

## 🟡 Important - Améliorations Phase 1

### UX
- [ ] Raccourcis clavier (1-5, ↑↓)
- [ ] Navigation par critère (Tab)
- [ ] Bouton "Question STAR suivante"
- [ ] Comparaison 2-3 candidats côte à côte
- [ ] Export Excel des candidatures
- [ ] Impression-friendly des rapports

### Performance
- [ ] Lazy loading des composants lourds
- [ ] Optimisation images (next/image)
- [ ] Prefetch des pages suivantes
- [ ] Cache Supabase (React Query?)
- [ ] Indexation BDD (vérifier explain analyze)

### Accessibilité
- [ ] Tests avec screen reader
- [ ] aria-live pour SaveIndicator
- [ ] aria-labels sur boutons icônes
- [ ] Tester navigation clavier complète
- [ ] Contrastes AAA pour texte principal

### Tests
- [ ] Tests E2E Playwright:
  - [ ] Parcours candidat complet
  - [ ] Upload de preuve
  - [ ] Notation évaluateur
  - [ ] Soumission évaluation
  - [ ] Décision jury
- [ ] Tests viewport 360px
- [ ] Tests réseau Slow 3G
- [ ] Tests RLS (notation en aveugle)
- [ ] Lighthouse: Performance ≥ 85, A11y ≥ 95

### Internationalisation
- [ ] Créer `messages/fr.json`
- [ ] Extraire TOUS les textes des composants
- [ ] Configurer next-intl
- [ ] Tester changement de langue
- [ ] Préparer `messages/wo.json` (wolof)

## 🟢 Nice to have - Phase 1

### Notifications
- [ ] Email de bienvenue (Resend)
- [ ] Email lien de reprise
- [ ] Notification évaluateur (nouveau dossier)
- [ ] Notification jury (évaluation soumise)
- [ ] SMS via Twilio/Vonage (optionnel)

### Dashboard
- [ ] Page `/dashboard` selon rôle
- [ ] Stats candidat (étape, temps restant)
- [ ] Stats évaluateur (nb dossiers à faire/faits)
- [ ] Stats jury (nb décisions à prendre)
- [ ] Stats admin (nb candidatures par jour/semaine)

### Mode hors-ligne (PWA)
- [ ] Service Worker avec Serwist
- [ ] Manifest.json
- [ ] Cache des assets critiques
- [ ] IndexedDB pour brouillons
- [ ] Détection online/offline
- [ ] Synchronisation au retour réseau
- [ ] Résolution conflits
- [ ] Indicateur état de sync

## 🔵 Phase 2 - Évaluation approfondie

### Entretien STAR
- [ ] Import 40 questions depuis Excel
- [ ] Table `star_questions`
- [ ] Page `/evaluateur/[appId]/star`
- [ ] 8 compétences × 5 questions
- [ ] Relances automatiques (S.T.A.R.)
- [ ] Prise de notes par question
- [ ] Scoring par compétence
- [ ] Timeline de l'entretien

### Assessment Center
- [ ] Import 4 exercices depuis Excel
- [ ] Table `assessment_exercises`
- [ ] Page `/evaluateur/[appId]/assessment`
- [ ] Présentation scénario
- [ ] Grille d'observation
- [ ] Notation comportementale
- [ ] Synthèse des 4 exercices

### Business Challenge 48h
- [ ] Configuration challenge (budget, durée)
- [ ] Page candidat `/challenge`
- [ ] Upload des livrables:
  - 5 interviews clients
  - Proposition de valeur
  - Prototype
  - Modèle économique
  - Stratégie 3 premiers clients
- [ ] Grille évaluation challenge
- [ ] Critères: initiative, créativité, adaptation, etc.

### Personas et parcours
- [ ] Définir 5 personas (A-E)
- [ ] Questionnaire de profilage
- [ ] Orientation automatique du parcours
- [ ] Recommandations d'accompagnement
- [ ] Plan 90 jours personnalisé

### Assistant IA
- [ ] Configuration SDK Anthropic
- [ ] Endpoint `/api/ai/summarize`
- [ ] Schéma Zod de sortie
- [ ] Bouton "Suggestion IA"
- [ ] Étiquetage clair "Proposition IA"
- [ ] Journal d'audit appels IA
- [ ] Gestion textes wolof/français mixte

## 🟣 Phase 3 - Prédictivité et échelle

### Suivi longitudinal
- [ ] Pages suivi 6/12/24 mois
- [ ] Formulaires de collecte
- [ ] Métriques à tracker (CA, emplois, survie, etc.)
- [ ] Calcul indice de prédictivité
- [ ] Graphiques d'évolution
- [ ] Ajustement poids/seuils selon résultats

### Équité
- [ ] Page `/admin/equite`
- [ ] Analyse écarts par:
  - Genre
  - Région
  - Langue
  - Stade de formalisation
- [ ] Visualisations (boxplots, violin plots)
- [ ] Alertes sur écarts significatifs
- [ ] Export analyses

### Multi-organisations
- [ ] Gestion organisations
- [ ] Isolation données
- [ ] Configuration multi-tenant
- [ ] Permissions croisées (optionnel)

### Wolof et accessibilité
- [ ] Traduction complète `messages/wo.json`
- [ ] Relecture locuteurs natifs
- [ ] Saisie vocale (MediaRecorder)
- [ ] Transcription audio (Whisper API?)
- [ ] Lecture audio des questions (TTS)

### Intégrations
- [ ] Tests psychométriques externes
- [ ] API partenaires
- [ ] Export vers outils BI
- [ ] Webhooks

## 🛠️ Maintenance et DevOps

### Monitoring
- [ ] Sentry pour erreurs JS
- [ ] Logs structurés (Winston/Pino)
- [ ] Alertes performances
- [ ] Alertes erreurs critiques
- [ ] Dashboard monitoring

### CI/CD
- [ ] GitHub Actions
- [ ] Tests automatiques sur PR
- [ ] Lint automatique
- [ ] Build preview sur Vercel
- [ ] Deploy auto en production

### Sécurité
- [ ] Audit dépendances (npm audit)
- [ ] Rotation clés API
- [ ] Revue RLS annuelle
- [ ] Scan vulnérabilités (Snyk)
- [ ] Rate limiting API

### Documentation
- [ ] Storybook pour composants
- [ ] JSDoc pour fonctions complexes
- [ ] Guide contributeur
- [ ] Changelog
- [ ] Release notes

## 📊 Métriques de succès

### Technique
- [ ] Tests: 80%+ couverture
- [ ] Performance: Lighthouse ≥ 85
- [ ] Accessibilité: Lighthouse ≥ 95
- [ ] Temps de réponse API < 200ms (P95)
- [ ] Uptime ≥ 99.5%

### Produit
- [ ] Candidature complète < 15 min
- [ ] Taux d'abandon < 30%
- [ ] Satisfaction évaluateurs ≥ 4/5
- [ ] Accord inter-évaluateurs ≥ 80%
- [ ] Délai de sélection < 6 semaines

---

**Mis à jour le** : 11 novembre 2026
**Prochaine révision** : Après installation Node.js et premier lancement
