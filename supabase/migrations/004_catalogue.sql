-- Migration 004: Certifications, Formations, Versions, Ressources + RLS
-- Dependances : 002

-- ===================== CERTIFICATIONS (referentiel RNCP/RS) =====================

CREATE TABLE public.certifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL,
  registry        TEXT NOT NULL CHECK (registry IN ('rncp', 'rs')),
  title           TEXT NOT NULL,
  level           INTEGER,
  certifier       TEXT,
  valid_until     DATE,
  blocks          JSONB DEFAULT '[]',
  equivalences    TEXT,
  pathways        TEXT,
  outcomes        TEXT,
  france_competences_url TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_certifications_code ON public.certifications(code);

CREATE TRIGGER set_updated_at_certifications
  BEFORE UPDATE ON public.certifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certifications_select_all"
  ON public.certifications FOR SELECT
  USING (true);

CREATE POLICY "certifications_manage_admin"
  ON public.certifications FOR ALL
  USING (auth.is_admin());

-- ===================== FORMATIONS =====================

CREATE TABLE public.formations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code            TEXT,
  title           TEXT NOT NULL,
  category        public.action_category NOT NULL DEFAULT 'af',
  certification_id UUID REFERENCES public.certifications(id) ON DELETE SET NULL,
  -- Indicateur 1
  objectives      TEXT[] DEFAULT '{}',
  prerequisites   TEXT,
  target_audience TEXT,
  duration_hours  NUMERIC(8,2),
  duration_days   NUMERIC(6,1),
  modality        TEXT,
  teaching_methods TEXT,
  assessment_methods TEXT,
  accessibility   TEXT,
  price_ht        NUMERIC(12,2),
  price_ttc       NUMERIC(12,2),
  price_per_hour  NUMERIC(8,2),
  access_delay    TEXT,
  -- Indicateur 2
  satisfaction_rate NUMERIC(4,1),
  success_rate    NUMERIC(4,1),
  completion_rate NUMERIC(4,1),
  insertion_rate  NUMERIC(4,1),
  results_updated_at DATE,
  -- Indicateur 7
  certification_mapping JSONB,
  -- Indicateur 6
  program_content JSONB DEFAULT '[]',
  pedagogical_scenario TEXT,
  -- Metadata
  is_active       BOOLEAN DEFAULT TRUE,
  is_cpf_eligible BOOLEAN DEFAULT FALSE,
  mcf_id          TEXT,
  version         INTEGER DEFAULT 1,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_formations_org ON public.formations(organization_id);
CREATE INDEX idx_formations_category ON public.formations(category);
CREATE INDEX idx_formations_active ON public.formations(is_active);

CREATE TRIGGER set_updated_at_formations
  BEFORE UPDATE ON public.formations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "formations_staff_all"
  ON public.formations FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "formations_formateur_select"
  ON public.formations FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'formateur'
  );

CREATE POLICY "formations_apprenant_select"
  ON public.formations FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() IN ('apprenant', 'apprenti')
  );

CREATE POLICY "formations_entreprise_select"
  ON public.formations FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'entreprise'
  );

-- ===================== FORMATION VERSIONS (ind. 6) =====================

CREATE TABLE public.formation_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id    UUID NOT NULL REFERENCES public.formations(id) ON DELETE CASCADE,
  version_number  INTEGER NOT NULL,
  program_content JSONB NOT NULL,
  objectives      TEXT[],
  change_reason   TEXT,
  created_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_formation_versions_formation ON public.formation_versions(formation_id);

ALTER TABLE public.formation_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "formation_versions_staff_all"
  ON public.formation_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.formations f
      WHERE f.id = formation_versions.formation_id
      AND f.organization_id = auth.organization_id()
    )
    AND auth.is_staff()
  );

CREATE POLICY "formation_versions_read_org"
  ON public.formation_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.formations f
      WHERE f.id = formation_versions.formation_id
      AND f.organization_id = auth.organization_id()
    )
  );

-- ===================== RESSOURCES PEDAGOGIQUES (ind. 19) =====================

CREATE TABLE public.pedagogical_resources (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  formation_id    UUID REFERENCES public.formations(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  resource_type   TEXT,
  file_url        TEXT,
  is_public       BOOLEAN DEFAULT FALSE,
  created_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_resources_org ON public.pedagogical_resources(organization_id);
CREATE INDEX idx_resources_formation ON public.pedagogical_resources(formation_id);

CREATE TRIGGER set_updated_at_resources
  BEFORE UPDATE ON public.pedagogical_resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.pedagogical_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resources_staff_all"
  ON public.pedagogical_resources FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "resources_public_select"
  ON public.pedagogical_resources FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND is_public = true
  );
