-- =====================================================
-- SEED AUTOMATIQUE : Créer des profils pour les users existants
-- =====================================================
-- PRÉREQUIS : Les users doivent déjà exister dans auth.users
-- Ce script les retrouve par email et crée leurs profils
-- =====================================================

-- Fonction helper pour créer un profil à partir d'un email
CREATE OR REPLACE FUNCTION create_profile_from_email(
  user_email text,
  user_role role_t,
  user_full_name text,
  user_phone text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Trouver l'UUID de l'utilisateur par email
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = user_email;

  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'User avec email % non trouvé dans auth.users', user_email;
  END IF;

  -- Créer ou mettre à jour le profil
  INSERT INTO profiles (id, role, full_name, phone, locale)
  VALUES (user_uuid, user_role, user_full_name, user_phone, 'fr')
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone;

  RAISE NOTICE 'Profil créé pour % (%) avec UUID %', user_full_name, user_email, user_uuid;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EXÉCUTION : Créer les profils de test
-- =====================================================
-- Ce script crée les profils UNIQUEMENT pour les users 
-- qui existent déjà dans auth.users
-- =====================================================

-- D'abord, listons les users existants
DO $$
DECLARE
  existing_users_count int;
BEGIN
  SELECT COUNT(*) INTO existing_users_count FROM auth.users;
  RAISE NOTICE '📊 Nombre de users dans auth.users: %', existing_users_count;
  
  IF existing_users_count = 0 THEN
    RAISE NOTICE '⚠️  AUCUN USER TROUVÉ !';
    RAISE NOTICE '📋 Créez d''abord des users dans Authentication > Users';
    RAISE NOTICE '   Puis réexécutez ce script.';
  ELSE
    RAISE NOTICE '✅ Users trouvés, création des profils...';
  END IF;
END $$;

-- Créer les profils pour les users existants
-- (ignore silencieusement si le user n'existe pas)

-- Votre compte personnel (si créé)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'fayeouz84@gmail.com') THEN
    PERFORM create_profile_from_email(
      'fayeouz84@gmail.com',
      'candidat',
      'Ousseynou Faye',
      '774006235'
    );
    RAISE NOTICE '✅ Profil créé pour fayeouz84@gmail.com';
  ELSE
    RAISE NOTICE '⏭️  User fayeouz84@gmail.com non trouvé, ignoré';
  END IF;
END $$;

-- Candidat test (si créé)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'candidat@test.com') THEN
    PERFORM create_profile_from_email(
      'candidat@test.com',
      'candidat',
      'Candidat Test',
      '771234567'
    );
    RAISE NOTICE '✅ Profil créé pour candidat@test.com';
  ELSE
    RAISE NOTICE '⏭️  User candidat@test.com non trouvé, ignoré';
  END IF;
END $$;

-- Évaluateur test (si créé)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'evaluateur@test.com') THEN
    PERFORM create_profile_from_email(
      'evaluateur@test.com',
      'evaluateur',
      'Évaluateur Test',
      '779876543'
    );
    RAISE NOTICE '✅ Profil créé pour evaluateur@test.com';
  ELSE
    RAISE NOTICE '⏭️  User evaluateur@test.com non trouvé, ignoré';
  END IF;
END $$;

-- Jury test (si créé)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'jury@test.com') THEN
    PERFORM create_profile_from_email(
      'jury@test.com',
      'jury',
      'Jury Test',
      '778888888'
    );
    RAISE NOTICE '✅ Profil créé pour jury@test.com';
  ELSE
    RAISE NOTICE '⏭️  User jury@test.com non trouvé, ignoré';
  END IF;
END $$;

-- Admin test (si créé)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@test.com') THEN
    PERFORM create_profile_from_email(
      'admin@test.com',
      'admin',
      'Admin Test',
      '779999999'
    );
    RAISE NOTICE '✅ Profil créé pour admin@test.com';
  ELSE
    RAISE NOTICE '⏭️  User admin@test.com non trouvé, ignoré';
  END IF;
END $$;

-- =====================================================
-- VÉRIFICATION : Afficher tous les profils créés
-- =====================================================
SELECT 
  p.role,
  p.full_name,
  p.phone,
  au.email,
  CASE 
    WHEN au.confirmed_at IS NOT NULL THEN '✅ Confirmé'
    ELSE '⏳ En attente'
  END as status,
  p.created_at
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

-- Nettoyer la fonction helper (optionnel, décommentez si besoin)
-- DROP FUNCTION IF EXISTS create_profile_from_email;
