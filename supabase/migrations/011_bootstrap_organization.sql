-- Migration 011 : RPC pour bootstraper une organisation depuis l'onboarding
--
-- Contexte : un utilisateur fraichement inscrit a un profil créé par le
-- trigger de la migration 010, mais avec organization_id = NULL. Il ne
-- peut donc pas insérer directement dans `public.organizations` car la
-- table n'expose qu'une politique SELECT/UPDATE pour les membres de
-- l'organisation (cf. migration 002), et il n'a pas encore d'org.
--
-- Cette migration ajoute `public.bootstrap_organization()` :
--   * SECURITY DEFINER pour bypasser la RLS,
--   * vérifie que l'appelant est authentifié,
--   * vérifie qu'il n'a pas déjà une organisation (idempotence stricte),
--   * crée la nouvelle org,
--   * rattache l'appelant comme `admin_of` de cette org en une seule
--     transaction (atomique : si l'UPDATE échoue, le INSERT est rollback).

CREATE OR REPLACE FUNCTION public.bootstrap_organization(
  org_name    TEXT,
  org_siret   TEXT,
  org_nda     TEXT  DEFAULT NULL,
  org_address JSONB DEFAULT NULL
)
RETURNS public.organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid          UUID := auth.uid();
  v_existing_org UUID;
  v_org          public.organizations;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  IF org_name IS NULL OR length(trim(org_name)) = 0 THEN
    RAISE EXCEPTION 'Organization name is required' USING ERRCODE = '22023';
  END IF;

  IF org_siret IS NULL OR length(trim(org_siret)) = 0 THEN
    RAISE EXCEPTION 'SIRET is required' USING ERRCODE = '22023';
  END IF;

  -- L'utilisateur a-t-il déjà une organisation ?
  SELECT organization_id INTO v_existing_org
    FROM public.profiles
    WHERE id = v_uid;

  IF v_existing_org IS NOT NULL THEN
    RAISE EXCEPTION 'User already belongs to organization %', v_existing_org
      USING ERRCODE = '23505';
  END IF;

  -- Crée l'organisation
  INSERT INTO public.organizations (name, siret, nda, address)
  VALUES (trim(org_name), trim(org_siret), NULLIF(trim(org_nda), ''), org_address)
  RETURNING * INTO v_org;

  -- Rattache l'appelant comme admin_of
  UPDATE public.profiles
     SET organization_id = v_org.id,
         role            = 'admin_of'::public.user_role
   WHERE id = v_uid;

  RETURN v_org;
END;
$$;

-- Seuls les utilisateurs authentifiés peuvent l'appeler
REVOKE ALL ON FUNCTION public.bootstrap_organization(TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bootstrap_organization(TEXT, TEXT, TEXT, JSONB) TO authenticated;
