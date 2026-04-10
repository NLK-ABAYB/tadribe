-- Migration 003: OPCO, Entreprises, Contacts, Pipeline + RLS
-- Dependances : 002

-- ===================== OPCOS (referentiel) =====================

CREATE TABLE public.opcos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  code            VARCHAR(20) UNIQUE NOT NULL,
  website         TEXT,
  portal_url      TEXT,
  contact_email   TEXT,
  contact_phone   VARCHAR(20),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.opcos (name, code) VALUES
  ('AFDAS', 'AFDAS'),
  ('ATLAS', 'ATLAS'),
  ('Constructys', 'CONSTRUCTYS'),
  ('AKTO', 'AKTO'),
  ('OCAPIAT', 'OCAPIAT'),
  ('OPCO 2i', 'OPCO2I'),
  ('OPCO Mobilites', 'MOBILITES'),
  ('OPCO EP', 'OPCOEP'),
  ('OPCO Sante', 'SANTE'),
  ('Uniformation', 'UNIFORMATION'),
  ('OPCO Commerce', 'COMMERCE');

ALTER TABLE public.opcos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "opcos_select_all"
  ON public.opcos FOR SELECT
  USING (true);

CREATE POLICY "opcos_manage_admin"
  ON public.opcos FOR ALL
  USING (auth.is_admin());

-- ===================== COMPANIES =====================

CREATE TABLE public.companies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  siret           VARCHAR(14),
  siren           VARCHAR(9),
  naf_code        VARCHAR(6),
  idcc            VARCHAR(4),
  opco_id         UUID REFERENCES public.opcos(id),
  workforce_size  INTEGER,
  address         JSONB,
  phone           VARCHAR(20),
  email           TEXT,
  website         TEXT,
  notes           TEXT,
  is_client       BOOLEAN DEFAULT FALSE,
  is_prospect     BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_companies_org ON public.companies(organization_id);
CREATE INDEX idx_companies_siret ON public.companies(siret);

CREATE TRIGGER set_updated_at_companies
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "companies_staff_all"
  ON public.companies FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "companies_formateur_select"
  ON public.companies FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'formateur'
  );

CREATE POLICY "companies_entreprise_select"
  ON public.companies FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'entreprise'
    AND id IN (SELECT company_id FROM public.contacts WHERE user_id = auth.uid())
  );

-- ===================== CONTACTS =====================

CREATE TABLE public.contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  company_id      UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT,
  phone           VARCHAR(20),
  job_title       TEXT,
  contact_type    TEXT,
  notes           TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contacts_org ON public.contacts(organization_id);
CREATE INDEX idx_contacts_company ON public.contacts(company_id);

CREATE TRIGGER set_updated_at_contacts
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_staff_all"
  ON public.contacts FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "contacts_entreprise_select"
  ON public.contacts FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'entreprise'
    AND company_id IN (SELECT company_id FROM public.contacts WHERE user_id = auth.uid())
  );

-- ===================== OPPORTUNITIES =====================

CREATE TABLE public.opportunities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  company_id      UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  contact_id      UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  stage           public.pipeline_stage DEFAULT 'prospect',
  probability     INTEGER CHECK (probability BETWEEN 0 AND 100),
  amount          NUMERIC(12,2),
  expected_close  DATE,
  assigned_to     UUID REFERENCES public.profiles(id),
  lost_reason     TEXT,
  source          TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_opportunities_org ON public.opportunities(organization_id);
CREATE INDEX idx_opportunities_stage ON public.opportunities(stage);

CREATE TRIGGER set_updated_at_opportunities
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "opportunities_staff_all"
  ON public.opportunities FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

-- ===================== INTERACTIONS =====================

CREATE TABLE public.interactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  contact_id      UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  company_id      UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  opportunity_id  UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  interaction_type TEXT NOT NULL,
  subject         TEXT,
  content         TEXT,
  interaction_date TIMESTAMPTZ DEFAULT now(),
  performed_by    UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_interactions_org ON public.interactions(organization_id);
CREATE INDEX idx_interactions_contact ON public.interactions(contact_id);

ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interactions_staff_all"
  ON public.interactions FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());
