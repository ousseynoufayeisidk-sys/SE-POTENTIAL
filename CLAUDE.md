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
