# Création de compte manuelle (contourner la limite email)

## 🚨 Problème
Supabase limite l'envoi d'emails en mode gratuit : **"limite de débit de courrier électronique dépassée"**

## ✅ Solution : Créer l'utilisateur manuellement

### Étape 1 : Créer l'utilisateur dans Supabase

1. **Allez sur Authentication** :
   - https://supabase.com/dashboard/project/kmrphnmviesuxltywjvk/auth/users

2. **Cliquez sur "Add user" en haut à droite**

3. **Sélectionnez "Create new user"**

4. **Remplissez le formulaire** :
   - Email : `fayeouz84@gmail.com`
   - Password : `Test123456!` (vous pourrez le changer après)
   - ✅ **IMPORTANT** : Cochez "Auto Confirm User"

5. **Cliquez sur "Create user"**

6. **Copiez l'UUID de l'utilisateur** qui vient d'être créé (colonne `id`)
   - Il ressemble à : `123e4567-e89b-12d3-a456-426614174000`

### Étape 2 : Créer le profil dans la table `profiles`

1. **Allez dans Table Editor** :
   - https://supabase.com/dashboard/project/kmrphnmviesuxltywjvk/editor

2. **Sélectionnez la table "profiles"**

3. **Cliquez sur "Insert" → "Insert row"**

4. **Remplissez les champs** :
   ```
   id: [Collez l'UUID de l'utilisateur créé à l'étape 1]
   org_id: [Laissez vide pour l'instant]
   role: candidat
   full_name: Ousseynou Faye
   phone: 774006235
   locale: fr
   ```

5. **Cliquez sur "Save"**

### Étape 3 : Se connecter à l'application

Maintenant vous pouvez vous connecter avec mot de passe :

**URL de connexion** :
```
https://reimagined-parakeet-xrw56vxx6j4wf9pjv-3000.app.github.dev/login-password
```

**Identifiants** :
- Email : `fayeouz84@gmail.com`
- Mot de passe : `Test123456!`

Après connexion, vous serez automatiquement redirigé vers `/candidater` 🎉

---

## 🔧 Pour créer d'autres comptes de test

### Compte Évaluateur

1. Créez un utilisateur avec un autre email (ex: `evaluateur@test.com`)
2. Créez le profil avec `role: evaluateur`
3. Connectez-vous sur `/login-password`

### Compte Jury

1. Créez un utilisateur avec un autre email (ex: `jury@test.com`)
2. Créez le profil avec `role: jury`
3. Connectez-vous sur `/login-password`

---

## 🎯 Prochaines étapes après connexion

Une fois connecté en tant que **candidat** :

1. ✅ Vous verrez le parcours de pré-qualification
2. ✅ 13 questions à remplir
3. ✅ Upload de preuves pour chaque réponse
4. ✅ Sauvegarde automatique

---

## 📧 Pour utiliser les magic links en production

Pour un usage réel (sans limite d'emails), configurez un fournisseur SMTP :

1. **Resend** (gratuit jusqu'à 3000 emails/mois) : https://resend.com
2. **SendGrid** (gratuit jusqu'à 100 emails/jour) : https://sendgrid.com
3. Dans Supabase : **Settings → Auth → SMTP Settings**

---

**Créé le** : $(date)
**Pour** : Ousseynou Faye (fayeouz84@gmail.com)
