-- Migration 012 : autoriser un utilisateur à lire son propre profil
--
-- La policy historique `profiles_select_org` repose sur le helper
-- `public.organization_id()` qui interroge `public.profiles` pour récupérer
-- l'organisation de l'utilisateur courant. Tant qu'un utilisateur n'a pas
-- encore d'organisation (organization_id IS NULL après migration 010), ce
-- helper retourne NULL et la condition `organization_id = NULL` s'évalue
-- en NULL → l'utilisateur ne peut PAS lire son propre profil.
--
-- Conséquences en frontend :
--   - `useAuth.fetchProfile()` reçoit un PGRST116 (no rows)
--   - `profile` reste null dans `AuthProvider`
--   - `RequireAuth` bloque sur "Profil non trouvé" / spinner
--   - L'utilisateur ne peut jamais atteindre /onboarding
--
-- Cette migration ajoute une seconde policy SELECT permissive sur soi-même.
-- PostgreSQL combine les policies SELECT en OR : un user peut lire son
-- propre profil (via cette nouvelle policy) ET tous les profils de son
-- organisation (via la policy existante, une fois qu'il a une org).

CREATE POLICY "profiles_select_self"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());
