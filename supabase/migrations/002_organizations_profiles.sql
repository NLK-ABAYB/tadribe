-- Migration 002: Organizations et Profiles + RLS
-- Dependances : 001

-- ===================== ORGANIZATIONS =====================

CREATE TABLE public.organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  siret           VARCHAR(14) UNIQUE NOT NULL,
  nda             VARCHAR(11),
  nda_valid_until DATE,
  qualiopi        BOOLEAN DEFAULT FALSE,
  qualiopi_valid_until DATE,
  qualiopi_categories public.action_category[] DEFAULT '{}',
  address         JSONB,
  phone           VARCHAR(20),
  email           TEXT,
  website         TEXT,
  tva_exempt      BOOLEAN DEFAULT FALSE,
  tva_number      VARCHAR(20),
  legal_form      TEXT,
  logo_url        TEXT,
  settings        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at_organizations
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===================== PROFILES =====================

CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role            public.user_role NOT NULL,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           VARCHAR(20),
  job_title       TEXT,
  avatar_url      TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  is_referent_handicap BOOLEAN DEFAULT FALSE,
  is_referent_mobilite BOOLEAN DEFAULT FALSE,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_org ON public.profiles(organization_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===================== FONCTIONS HELPER RLS =====================
-- Ces helpers vivent dans le schéma `public` : sur Supabase Cloud, le rôle
-- qui exécute les migrations n'a pas les droits d'écriture sur le schéma
-- `auth` (réservé à Supabase). Les politiques RLS appellent donc
-- `public.organization_id()` / `public.user_role()` / `public.is_staff()` /
-- `public.is_admin()`.

CREATE OR REPLACE FUNCTION public.organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.user_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT role IN ('admin_of', 'gestionnaire', 'commercial')
  FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'admin_of'
  FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ===================== RLS: ORGANIZATIONS =====================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_select_own"
  ON public.organizations FOR SELECT
  USING (id = public.organization_id());

CREATE POLICY "org_update_admin"
  ON public.organizations FOR UPDATE
  USING (id = public.organization_id() AND public.is_admin())
  WITH CHECK (id = public.organization_id() AND public.is_admin());

-- ===================== RLS: PROFILES =====================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_org"
  ON public.profiles FOR SELECT
  USING (organization_id = public.organization_id());

CREATE POLICY "profiles_update_self"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_insert_admin"
  ON public.profiles FOR INSERT
  WITH CHECK (organization_id = public.organization_id() AND public.is_admin());

CREATE POLICY "profiles_delete_admin"
  ON public.profiles FOR DELETE
  USING (organization_id = public.organization_id() AND public.is_admin());

CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (organization_id = public.organization_id() AND public.is_admin())
  WITH CHECK (organization_id = public.organization_id() AND public.is_admin());
