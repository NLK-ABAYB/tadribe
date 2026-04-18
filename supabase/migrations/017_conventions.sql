-- Migration 017: Conventions de formation + RLS
-- Dependances : 003 (companies), 005 (sessions), 015 (entreprise helpers)

-- ===================== ENUMS =====================

CREATE TYPE public.convention_type AS ENUM (
  'intra', 'inter'
);

CREATE TYPE public.convention_status AS ENUM (
  'draft', 'sent', 'signed', 'cancelled'
);

-- ===================== CONVENTIONS =====================

CREATE TABLE public.conventions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  company_id      UUID NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
  session_id      UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  reference       TEXT NOT NULL,
  type            public.convention_type NOT NULL DEFAULT 'inter',
  funding_type    public.funding_type,
  status          public.convention_status NOT NULL DEFAULT 'draft',
  start_date      DATE,
  end_date        DATE,
  amount_ht       NUMERIC(12,2) NOT NULL DEFAULT 0,
  terms           TEXT,
  notes           TEXT,
  sent_at         TIMESTAMPTZ,
  signed_at       TIMESTAMPTZ,
  signed_by_name  TEXT,
  pdf_url         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, reference)
);

CREATE INDEX idx_conventions_org ON public.conventions(organization_id);
CREATE INDEX idx_conventions_company ON public.conventions(company_id);
CREATE INDEX idx_conventions_session ON public.conventions(session_id);
CREATE INDEX idx_conventions_status ON public.conventions(status);

CREATE TRIGGER set_updated_at_conventions
  BEFORE UPDATE ON public.conventions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.conventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conventions_staff_all"
  ON public.conventions FOR ALL
  USING (organization_id = public.organization_id() AND public.is_staff());

CREATE POLICY "conventions_entreprise_select"
  ON public.conventions FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );
