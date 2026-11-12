# 🚀 Démarrage rapide - SE-POTENTIAL 360°

## En 5 minutes

### 1️⃣ Installer Node.js (SI PAS ENCORE FAIT)

**Téléchargez Node.js** : https://nodejs.org/

Installez la version LTS (recommandée). Node.js inclut npm automatiquement.

### 2️⃣ Ouvrir PowerShell dans ce dossier

Clic droit dans le dossier > "Ouvrir dans le Terminal" (Windows 11)

Ou bien :
```bash
cd "c:\Users\Ouz\Documents\Se potential 360"
```

### 3️⃣ Installer les dépendances

```bash
npm install
```

⏱️ Cela prend 2-3 minutes la première fois.

### 4️⃣ Tester que tout fonctionne

```bash
npm test
```

✅ Vous devriez voir : **14 tests passed**

### 5️⃣ Créer votre projet Supabase

1. Allez sur https://supabase.com/dashboard
2. Cliquez sur "New project"
3. Donnez un nom : "SE-POTENTIAL-360"
4. Choisissez un mot de passe (gardez-le précieusement)
5. Sélectionnez une région (Europe recommandée)
6. Cliquez sur "Create new project"

⏱️ La création prend 1-2 minutes.

### 6️⃣ Configurer les variables d'environnement

Dans votre projet Supabase :
1. Allez dans **Settings** (icône engrenage) > **API**
2. Copiez ces 3 valeurs :
   - Project URL
   - anon public key
   - service_role key (cliquez sur "Reveal" pour la voir)

Dans votre éditeur :
1. Ouvrez le fichier `.env.local.example`
2. Copiez tout son contenu
3. Créez un nouveau fichier `.env.local` (sans le `.example`)
4. Collez le contenu
5. Remplacez les valeurs par celles de Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...votre_cle
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...votre_cle_service
```

### 7️⃣ Créer la base de données

Dans Supabase :
1. Allez dans **SQL Editor**
2. Cliquez sur "New query"
3. Ouvrez le fichier `supabase/migrations/20240101000000_init.sql`
4. Copiez tout son contenu et collez-le dans SQL Editor
5. Cliquez sur **Run** ▶️
6. Attendez "Success" ✅

Répétez pour le second fichier :
1. Nouvelle requête
2. Ouvrez `supabase/migrations/20240101000001_rls.sql`
3. Copiez-collez
4. Run ▶️

### 8️⃣ Insérer les données de test

Toujours dans SQL Editor, créez une nouvelle requête et exécutez :

```sql
-- Organisation de test
INSERT INTO organizations (id, name) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Organisation Test');

-- Modèle de scoring
INSERT INTO scoring_models (id, name, version, is_active, config) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'SE-POTENTIAL 360° v1',
  1,
  true,
  '{
    "bands": [
      {"min": 80, "key": "ELEVE", "label": "Potentiel élevé"},
      {"min": 65, "key": "INTERESSANT", "label": "Potentiel intéressant"},
      {"min": 50, "key": "A_CONSOLIDER", "label": "À consolider"},
      {"min": 0, "key": "INSUFFISANT", "label": "Insuffisamment démontré"}
    ],
    "disagreementThreshold": 2,
    "dimensionMinimums": {
      "PEOPLE": 30,
      "EXECUTION": 30,
      "BUSINESS": 30,
      "IMPACT": 20
    }
  }'::jsonb
);

-- 19 critères de scoring
INSERT INTO criteria (model_id, code, dimension, label, weight, position) VALUES
  ('00000000-0000-0000-0000-000000000001', 'B_VISION', 'PEOPLE', 'Vision stratégique et ambition', 5, 1),
  ('00000000-0000-0000-0000-000000000001', 'B_PROACT', 'PEOPLE', 'Esprit entrepreneurial et proactivité', 5, 2),
  ('00000000-0000-0000-0000-000000000001', 'B_RESIL', 'PEOPLE', 'Résilience et intelligence émotionnelle', 6, 3),
  ('00000000-0000-0000-0000-000000000001', 'B_LEAD', 'PEOPLE', 'Leadership et intelligence relationnelle', 5, 4),
  ('00000000-0000-0000-0000-000000000001', 'B_AGILE', 'PEOPLE', 'Agilité et capacité d''adaptation', 5, 5),
  ('00000000-0000-0000-0000-000000000001', 'B_DISC', 'PEOPLE', 'Discipline et culture de la performance', 5, 6),
  ('00000000-0000-0000-0000-000000000001', 'B_CLIENT', 'PEOPLE', 'Orientation client et capacité commerciale', 5, 7),
  ('00000000-0000-0000-0000-000000000001', 'B_ETHIC', 'PEOPLE', 'Éthique, responsabilité et vision durable', 4, 8),
  ('00000000-0000-0000-0000-000000000001', 'E_PLAN', 'EXECUTION', 'Planification et priorisation', 7, 9),
  ('00000000-0000-0000-0000-000000000001', 'E_DECIDE', 'EXECUTION', 'Décision et arbitrage', 6, 10),
  ('00000000-0000-0000-0000-000000000001', 'E_RESS', 'EXECUTION', 'Gestion des ressources / trésorerie', 6, 11),
  ('00000000-0000-0000-0000-000000000001', 'E_REGUL', 'EXECUTION', 'Régularité des résultats et engagements', 6, 12),
  ('00000000-0000-0000-0000-000000000001', 'P_PROBLEME', 'BUSINESS', 'Problème client et besoin vérifié', 7, 13),
  ('00000000-0000-0000-0000-000000000001', 'P_VALID', 'BUSINESS', 'Validation marché / preuves de demande', 6, 14),
  ('00000000-0000-0000-0000-000000000001', 'P_MODELE', 'BUSINESS', 'Modèle économique et viabilité', 6, 15),
  ('00000000-0000-0000-0000-000000000001', 'P_DIFF', 'BUSINESS', 'Différenciation et potentiel de croissance', 6, 16),
  ('00000000-0000-0000-0000-000000000001', 'I_CONF', 'IMPACT', 'Éthique, conformité et transparence', 4, 17),
  ('00000000-0000-0000-0000-000000000001', 'I_IMPACT', 'IMPACT', 'Impact social / environnemental pertinent', 3, 18),
  ('00000000-0000-0000-0000-000000000001', 'I_PEREN', 'IMPACT', 'Pérennité et parties prenantes', 3, 19);
```

### 9️⃣ Lancer l'application

```bash
npm run dev
```

✅ Ouvrez votre navigateur sur : **http://localhost:3000**

Vous devriez voir la page d'accueil avec :
- Le titre "SE-POTENTIAL 360°"
- Le bouton "Commencer ma candidature"
- Le bouton "Espace évaluateur"

## 🎉 C'est terminé !

Vous avez :
- ✅ Installé toutes les dépendances
- ✅ Testé le moteur de scoring (14 tests passés)
- ✅ Configuré Supabase
- ✅ Créé la base de données
- ✅ Lancé l'application

## 📋 Prochaines étapes

Maintenant que la base fonctionne, vous pouvez :

### Option 1 : Explorer le code existant
- Regardez `lib/scoring/engine.ts` (le cœur du système)
- Testez avec `npm test`
- Modifiez `app/page.tsx` pour personnaliser la page d'accueil

### Option 2 : Développer de nouvelles fonctionnalités
Consultez `PLAN.md` pour voir la liste complète.

Les prochaines fonctionnalités à développer :
1. **Clients Supabase** : connexion front ↔ back
2. **Authentification** : magic link pour se connecter
3. **Préqualification** : les 13 questions pour les candidats
4. **Grille d'évaluation** : interface pour les évaluateurs
5. **Tableau jury** : visualisation et décisions

### Option 3 : Personnaliser le design
- Modifiez les couleurs dans `tailwind.config.ts`
- Ajustez les styles dans `app/globals.css`
- Créez de nouveaux composants dans `components/`

## ❓ Problèmes ?

### Le serveur ne démarre pas
```bash
# Vérifiez qu'il n'y a pas d'erreur dans .env.local
# Vérifiez que les URL Supabase sont correctes
```

### Les tests échouent
```bash
# Vérifiez que criteria.json existe et contient 19 critères
npm test -- --reporter=verbose
```

### "Cannot find module"
```bash
# Réinstallez les dépendances
rm -rf node_modules
npm install
```

### Page blanche sur http://localhost:3000
```bash
# Vérifiez la console du navigateur (F12)
# Vérifiez les logs dans le terminal
```

## 📚 Documentation complète

Pour plus de détails :
- **Installation complète** : `INSTALLATION.md`
- **Plan de développement** : `PLAN.md`
- **Statut actuel** : `STATUT.md`
- **Documentation projet** : `README.md`
- **Spécifications techniques** : `SE-POTENTIAL-360_Cahier-de-developpement.md`

## 🆘 Besoin d'aide ?

1. Consultez les logs dans le terminal
2. Ouvrez la console du navigateur (F12)
3. Vérifiez le dashboard Supabase (onglet Logs)
4. Relisez `INSTALLATION.md` pour les détails

---

**Bon développement ! 🚀**
