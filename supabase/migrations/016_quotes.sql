-- Migration 016: Quotes (devis) + quote_lines + RLS
-- Dependances : 003 (companies/contacts/opportunities), 004 (formations), 015 (entreprise helpers)

-- ===================== ENUM =====================

CREATE TYPE public.quote_status AS ENUM (
  'draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'
);

-- ===================== QUOTES =====================

CREATE TABLE public.quotes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  opportunity_id  UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  company_id      UUID NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
  contact_id      UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  quote_number    TEXT NOT NULL,
  status          public.quote_status NOT NULL DEFAULT 'draft',
  valid_until     DATE,
  subtotal_ht     NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate        NUMERIC(5,2) NOT NULL DEFAULT 20,
  tax_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_ttc       NUMERIC(12,2) NOT NULL DEFAULT 0,
  terms           TEXT,
  notes           TEXT,
  sent_at         TIMESTAMPTZ,
  accepted_at     TIMESTAMPTZ,
  rejected_at     TIMESTAMPTZ,
  converted_invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, quote_number)
);

CREATE INDEX idx_quotes_org ON public.quotes(organization_id);
CREATE INDEX idx_quotes_company ON public.quotes(company_id);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_quotes_opportunity ON public.quotes(opportunity_id);

CREATE TRIGGER set_updated_at_quotes
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quotes_staff_all"
  ON public.quotes FOR ALL
  USING (organization_id = public.organization_id() AND public.is_staff());

CREATE POLICY "quotes_entreprise_select"
  ON public.quotes FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT public.entreprise_company_ids())
  );

-- ===================== QUOTE LINES =====================

CREATE TABLE public.quote_lines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id        UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  formation_id    UUID REFERENCES public.formations(id) ON DELETE SET NULL,
  description     TEXT NOT NULL,
  quantity        NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price_ht   NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_ht        NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price_ht) STORED,
  line_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quote_lines_quote ON public.quote_lines(quote_id);

ALTER TABLE public.quote_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quote_lines_staff_all"
  ON public.quote_lines FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.quotes q
      WHERE q.id = quote_lines.quote_id
      AND q.organization_id = public.organization_id()
    )
    AND public.is_staff()
  );

CREATE POLICY "quote_lines_entreprise_select"
  ON public.quote_lines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quotes q
      WHERE q.id = quote_lines.quote_id
      AND q.organization_id = public.organization_id()
      AND public.user_role() = 'entreprise'
      AND q.company_id IN (SELECT public.entreprise_company_ids())
    )
  );
