# Configuration GitHub Codespaces + Supabase

## ✅ Étapes déjà complétées

1. ✅ Projet Supabase créé
2. ✅ Variables d'environnement configurées dans `.env.local`
3. ✅ Migrations SQL exécutées (17 tables créées)
4. ✅ Serveur Next.js démarré

## 🔧 Configuration finale requise

### URL Codespaces
Votre application tourne sur :
```
https://reimagined-parakeet-xrw56vxx6j4wf9pjv-3000.app.github.dev
```

### Configuration Supabase Authentication

**⚠️ IMPORTANT** : Pour que la redirection magic link fonctionne, vous devez configurer les URLs autorisées dans Supabase.

#### Étapes à suivre :

1. **Allez sur le dashboard Supabase** :
   - https://supabase.com/dashboard/project/kmrphnmviesuxltywjvk

2. **Cliquez sur "Authentication"** (dans le menu de gauche)

3. **Cliquez sur "URL Configuration"**

4. **Configurez les champs suivants** :

   **Site URL :**
   ```
   https://reimagined-parakeet-xrw56vxx6j4wf9pjv-3000.app.github.dev
   ```

   **Redirect URLs (ajoutez ces 2 lignes) :**
   ```
   https://reimagined-parakeet-xrw56vxx6j4wf9pjv-3000.app.github.dev/auth/callback
   https://reimagined-parakeet-xrw56vxx6j4wf9pjv-3000.app.github.dev/**
   ```

5. **Cliquez sur "Save"**

## 🧪 Test de l'application

### 1. Créer votre premier compte

1. Ouvrez votre application : https://reimagined-parakeet-xrw56vxx6j4wf9pjv-3000.app.github.dev
2. Cliquez sur **"Créer un compte"** ou allez sur `/signup`
3. Remplissez le formulaire :
   - Nom complet : `Votre Nom`
   - Téléphone : `77 123 45 67`
   - Email : votre email réel
4. Cliquez sur **"Créer mon compte"**
5. **Vérifiez votre boîte email** pour recevoir le magic link
6. Cliquez sur le lien dans l'email
7. Vous serez redirigé vers `/candidature` (espace candidat)

### 2. Tester le parcours candidat

Une fois connecté, vous pouvez :
- ✅ Remplir le questionnaire de pré-qualification (13 questions)
- ✅ Uploader des preuves pour chaque réponse
- ✅ Sauvegarder automatiquement vos réponses
- ✅ Voir votre progression

### 3. Créer un compte évaluateur (pour tester)

Pour tester l'interface évaluateur, vous devez :

1. **Créer un deuxième compte** (avec un autre email)
2. **Modifier le rôle dans Supabase** :
   - Allez dans **Table Editor > profiles**
   - Trouvez votre deuxième compte
   - Changez le champ `role` de `candidat` à `evaluateur`
3. **Reconnectez-vous** avec ce compte
4. Vous serez redirigé vers `/evaluateur`

## 📋 URLs de l'application

| Page | URL | Description |
|------|-----|-------------|
| Accueil | `/` | Page d'accueil avec liens vers connexion/inscription |
| Connexion | `/login` | Magic link pour utilisateurs existants |
| Inscription | `/signup` | Créer un nouveau compte |
| Candidat | `/candidater` | Parcours de pré-qualification (13 questions) |
| Évaluateur | `/evaluateur` | Liste des candidatures assignées |
| Évaluateur (notation) | `/evaluateur/[appId]` | Grille de notation (19 critères) |
| Jury | `/jury/[appId]` | Dashboard avec radar 4D et décision |

## 🔐 Rôles dans l'application

| Rôle | Permissions | Page par défaut |
|------|-------------|-----------------|
| `candidat` | Remplir questionnaire, uploader preuves | `/candidature` |
| `evaluateur` | Noter les candidatures (1-5 sur 19 critères) | `/evaluateur` |
| `jury` | Voir scores agrégés, prendre décision finale | `/jury` |
| `admin` | Gérer programmes, utilisateurs, etc. | `/admin` |

## 🐛 Dépannage

### Problème : "Invalid supabaseUrl"
**Solution** : Vérifiez que `.env.local` contient vos vraies URLs Supabase (pas les placeholders)

### Problème : Magic link ne redirige pas
**Solution** : Configurez les Redirect URLs dans Supabase Authentication (voir ci-dessus)

### Problème : "Row Level Security policy violation"
**Solution** : Vérifiez que les migrations RLS ont bien été exécutées

### Problème : Page blanche après connexion
**Solution** : Vérifiez dans la console browser (F12) et les logs du serveur

## 📞 Prochaines étapes

Une fois que l'authentification fonctionne :

1. ✅ Tester le parcours candidat complet
2. ✅ Créer un compte évaluateur et tester la notation
3. 🔜 Créer la page récapitulatif candidat
4. 🔜 Implémenter la génération PDF
5. 🔜 Créer l'interface admin
6. 🔜 Déployer en production sur Vercel

---

**Date de configuration** : $(date)
**URL Codespaces** : https://reimagined-parakeet-xrw56vxx6j4wf9pjv-3000.app.github.dev
**Projet Supabase** : kmrphnmviesuxltywjvk
