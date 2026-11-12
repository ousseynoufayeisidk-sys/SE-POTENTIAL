-- =====================================================
-- ÉTAPE 1 : VÉRIFIER LES USERS EXISTANTS
-- =====================================================
-- Exécutez d'abord cette partie pour voir quels users 
-- existent déjà dans auth.users
-- =====================================================

-- Afficher tous les users avec leurs profils (ou NULL si pas de profil)
SELECT 
  au.id,
  au.email,
  au.created_at as user_created_at,
  au.confirmed_at,
  p.role,
  p.full_name,
  CASE 
    WHEN p.id IS NULL THEN '❌ Pas de profil'
    ELSE '✅ Profil OK'
  END as profile_status
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
ORDER BY au.created_at DESC;

-- Statistiques
SELECT 
  '📊 STATISTIQUES' as info,
  COUNT(DISTINCT au.id) as total_users,
  COUNT(DISTINCT p.id) as users_avec_profil,
  COUNT(DISTINCT au.id) - COUNT(DISTINCT p.id) as users_sans_profil
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id;

-- =====================================================
-- ÉTAPE 2 : CRÉER LES PROFILS MANQUANTS
-- =====================================================
-- Décommentez et exécutez SEULEMENT les lignes 
-- correspondant aux users que vous avez créés
-- =====================================================

/*
-- Pour fayeouz84@gmail.com (remplacez l'UUID)
INSERT INTO profiles (id, role, full_name, phone, locale)
SELECT 
  id, 
  'candidat'::role_t, 
  'Ousseynou Faye', 
  '774006235', 
  'fr'
FROM auth.users 
WHERE email = 'fayeouz84@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Pour candidat@test.com
INSERT INTO profiles (id, role, full_name, phone, locale)
SELECT 
  id, 
  'candidat'::role_t, 
  'Candidat Test', 
  '771234567', 
  'fr'
FROM auth.users 
WHERE email = 'candidat@test.com'
ON CONFLICT (id) DO NOTHING;

-- Pour evaluateur@test.com
INSERT INTO profiles (id, role, full_name, phone, locale)
SELECT 
  id, 
  'evaluateur'::role_t, 
  'Évaluateur Test', 
  '779876543', 
  'fr'
FROM auth.users 
WHERE email = 'evaluateur@test.com'
ON CONFLICT (id) DO NOTHING;

-- Pour jury@test.com
INSERT INTO profiles (id, role, full_name, phone, locale)
SELECT 
  id, 
  'jury'::role_t, 
  'Jury Test', 
  '778888888', 
  'fr'
FROM auth.users 
WHERE email = 'jury@test.com'
ON CONFLICT (id) DO NOTHING;

-- Pour admin@test.com
INSERT INTO profiles (id, role, full_name, phone, locale)
SELECT 
  id, 
  'admin'::role_t, 
  'Admin Test', 
  '779999999', 
  'fr'
FROM auth.users 
WHERE email = 'admin@test.com'
ON CONFLICT (id) DO NOTHING;
*/

-- =====================================================
-- ÉTAPE 3 : VERSION TOUT-EN-UN (Plus simple)
-- =====================================================
-- Décommentez et exécutez cette section pour créer
-- TOUS les profils manquants en une seule fois
-- =====================================================

/*
-- Créer tous les profils manquants
INSERT INTO profiles (id, role, full_name, phone, locale)
SELECT 
  au.id,
  CASE 
    WHEN au.email = 'fayeouz84@gmail.com' THEN 'candidat'::role_t
    WHEN au.email = 'candidat@test.com' THEN 'candidat'::role_t
    WHEN au.email = 'evaluateur@test.com' THEN 'evaluateur'::role_t
    WHEN au.email = 'jury@test.com' THEN 'jury'::role_t
    WHEN au.email = 'admin@test.com' THEN 'admin'::role_t
    ELSE 'candidat'::role_t
  END as role,
  CASE 
    WHEN au.email = 'fayeouz84@gmail.com' THEN 'Ousseynou Faye'
    WHEN au.email = 'candidat@test.com' THEN 'Candidat Test'
    WHEN au.email = 'evaluateur@test.com' THEN 'Évaluateur Test'
    WHEN au.email = 'jury@test.com' THEN 'Jury Test'
    WHEN au.email = 'admin@test.com' THEN 'Admin Test'
    ELSE COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1))
  END as full_name,
  CASE 
    WHEN au.email = 'fayeouz84@gmail.com' THEN '774006235'
    WHEN au.email = 'candidat@test.com' THEN '771234567'
    WHEN au.email = 'evaluateur@test.com' THEN '779876543'
    WHEN au.email = 'jury@test.com' THEN '778888888'
    WHEN au.email = 'admin@test.com' THEN '779999999'
    ELSE NULL
  END as phone,
  'fr' as locale
FROM auth.users au
WHERE au.email IN (
  'fayeouz84@gmail.com',
  'candidat@test.com',
  'evaluateur@test.com',
  'jury@test.com',
  'admin@test.com'
)
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone;
*/

-- =====================================================
-- ÉTAPE 4 : VÉRIFICATION FINALE
-- =====================================================
-- Exécutez cette partie pour vérifier que tout est OK
-- =====================================================

SELECT 
  '🎉 RÉSULTAT FINAL' as info,
  p.role,
  p.full_name,
  p.phone,
  au.email,
  CASE 
    WHEN au.confirmed_at IS NOT NULL THEN '✅ Confirmé'
    ELSE '⏳ En attente'
  END as status
FROM profiles p
JOIN auth.users au ON au.id = p.id
ORDER BY 
  CASE p.role
    WHEN 'admin' THEN 1
    WHEN 'jury' THEN 2
    WHEN 'evaluateur' THEN 3
    WHEN 'candidat' THEN 4
  END,
  p.created_at DESC;
