-- Migration 010 : auto-création d'un profil lors de l'inscription
--
-- Quand un utilisateur s'inscrit via Supabase Auth, une ligne `auth.users`
-- est insérée mais aucun `public.profiles` n'existe, ce qui bloque l'app
-- (le hook `useAuthContext` reste en chargement et le login spinner
-- tourne indéfiniment).
--
-- Cette migration :
--   1. relâche la contrainte NOT NULL sur profiles.organization_id pour
--      autoriser la phase d'onboarding (l'utilisateur n'a pas encore
--      rejoint/créé son organisation),
--   2. crée la fonction `public.handle_new_user()` qui matérialise un
--      profil minimal à partir de `auth.users` (id, email, first_name,
--      last_name, role='admin_of', organization_id=NULL),
--   3. branche un trigger AFTER INSERT sur auth.users,
--   4. backfill les users déjà inscrits qui n'ont pas encore de profil.

-- 1) organization_id devient nullable pendant l'onboarding
ALTER TABLE public.profiles
  ALTER COLUMN organization_id DROP NOT NULL;

-- 2) Fonction trigger : matérialise le profil
--    SECURITY DEFINER pour bypasser la RLS de profiles (la policy
--    profiles_insert_admin exigerait sinon que l'appelant soit déjà
--    admin de l'org, ce qui n'a pas de sens à la création).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_meta      JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::JSONB);
  v_full_name TEXT  := NULLIF(TRIM(v_meta->>'full_name'), '');
  v_first     TEXT  := NULLIF(TRIM(v_meta->>'first_name'), '');
  v_last      TEXT  := NULLIF(TRIM(v_meta->>'last_name'), '');
BEGIN
  -- Si l'app envoie seulement `full_name`, on le split sur le 1er espace
  IF v_first IS NULL AND v_full_name IS NOT NULL THEN
    v_first := split_part(v_full_name, ' ', 1);
    v_last  := NULLIF(TRIM(substring(v_full_name FROM length(v_first) + 2)), '');
  END IF;

  INSERT INTO public.profiles (id, email, first_name, last_name, role, organization_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(v_first, split_part(NEW.email, '@', 1)),
    COALESCE(v_last, ''),
    'admin_of'::public.user_role,
    NULL
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 3) Trigger sur auth.users (pattern documenté Supabase)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4) Backfill des utilisateurs existants sans profil
INSERT INTO public.profiles (id, email, first_name, last_name, role, organization_id)
SELECT
  u.id,
  u.email,
  COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data->>'first_name'), ''),
    split_part(
      COALESCE(NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''), u.email),
      ' ',
      1
    )
  ),
  COALESCE(NULLIF(TRIM(u.raw_user_meta_data->>'last_name'), ''), ''),
  'admin_of'::public.user_role,
  NULL
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
