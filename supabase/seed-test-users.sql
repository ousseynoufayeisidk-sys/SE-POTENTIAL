-- =====================================================
-- SEED : Créer des utilisateurs de test
-- =====================================================
-- IMPORTANT : Vous devez d'abord créer les users dans 
-- Authentication > Users, puis remplacer les UUIDs ici
-- =====================================================

-- 1. CANDIDAT TEST
-- User à créer dans le dashboard:
--   Email: candidat@test.com
--   Password: Test123456!
--   ✅ Auto Confirm User
-- Ensuite, remplacez l'UUID ci-dessous par celui généré

INSERT INTO profiles (id, role, full_name, phone, locale)
VALUES (
  'REMPLACER_PAR_UUID_CANDIDAT'::uuid,
  'candidat',
  'Candidat Test',
  '771234567',
  'fr'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'candidat',
  full_name = 'Candidat Test',
  phone = '771234567';

-- 2. ÉVALUATEUR TEST
-- User à créer dans le dashboard:
--   Email: evaluateur@test.com
--   Password: Test123456!
--   ✅ Auto Confirm User
-- Ensuite, remplacez l'UUID ci-dessous par celui généré

INSERT INTO profiles (id, role, full_name, phone, locale)
VALUES (
  'REMPLACER_PAR_UUID_EVALUATEUR'::uuid,
  'evaluateur',
  'Évaluateur Test',
  '779876543',
  'fr'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'evaluateur',
  full_name = 'Évaluateur Test',
  phone = '779876543';

-- 3. JURY TEST (optionnel)
-- User à créer dans le dashboard:
--   Email: jury@test.com
--   Password: Test123456!
--   ✅ Auto Confirm User

INSERT INTO profiles (id, role, full_name, phone, locale)
VALUES (
  'REMPLACER_PAR_UUID_JURY'::uuid,
  'jury',
  'Jury Test',
  '778888888',
  'fr'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'jury',
  full_name = 'Jury Test',
  phone = '778888888';

-- 4. ADMIN TEST (optionnel)
-- User à créer dans le dashboard:
--   Email: admin@test.com
--   Password: Test123456!
--   ✅ Auto Confirm User

INSERT INTO profiles (id, role, full_name, phone, locale)
VALUES (
  'REMPLACER_PAR_UUID_ADMIN'::uuid,
  'admin',
  'Admin Test',
  '779999999',
  'fr'
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  full_name = 'Admin Test',
  phone = '779999999';

-- Vérification
SELECT 
  p.id,
  p.full_name,
  p.role,
  p.phone,
  au.email,
  au.confirmed_at
FROM profiles p
JOIN auth.users au ON au.id = p.id
ORDER BY p.role;
