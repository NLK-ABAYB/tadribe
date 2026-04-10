-- Migration 006: Financements, Facturation, Paiements, Documents + RLS
-- Dependances : 002, 003, 005

-- ===================== FUNDING DOSSIERS =====================

CREATE TABLE public.funding_dossiers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  enrollment_id   UUID REFERENCES public.enrollments(id) ON DELETE SET NULL,
  session_id      UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  beneficiary_id  UUID REFERENCES public.beneficiaries(id) ON DELETE SET NULL,
  company_id      UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  funding_type    public.funding_type NOT NULL,
  status          public.funding_status DEFAULT 'brouillon',
  funder_name     TEXT,
  opco_id         UUID REFERENCES public.opcos(id) ON DELETE SET NULL,
  funder_reference TEXT,
  amount_requested NUMERIC(12,2),
  amount_granted  NUMERIC(12,2),
  amount_paid     NUMERIC(12,2) DEFAULT 0,
  remainder_beneficiary NUMERIC(12,2) DEFAULT 0,
  remainder_company NUMERIC(12,2) DEFAULT 0,
  is_subrogation  BOOLEAN DEFAULT FALSE,
  submitted_at    DATE,
  deadline_date   DATE,
  decision_date   DATE,
  payment_date    DATE,
  cpf_dossier_id  TEXT,
  cpf_reste_charge NUMERIC(8,2),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_funding_org ON public.funding_dossiers(organization_id);
CREATE INDEX idx_funding_type ON public.funding_dossiers(funding_type);
CREATE INDEX idx_funding_status ON public.funding_dossiers(status);
CREATE INDEX idx_funding_enrollment ON public.funding_dossiers(enrollment_id);

CREATE TRIGGER set_updated_at_funding
  BEFORE UPDATE ON public.funding_dossiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.funding_dossiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "funding_staff_all"
  ON public.funding_dossiers FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "funding_apprenant_select"
  ON public.funding_dossiers FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() IN ('apprenant', 'apprenti')
    AND beneficiary_id IN (
      SELECT id FROM public.beneficiaries WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "funding_entreprise_select"
  ON public.funding_dossiers FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'entreprise'
    AND company_id IN (
      SELECT company_id FROM public.contacts WHERE user_id = auth.uid()
    )
  );

-- ===================== INVOICES =====================

CREATE TABLE public.invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invoice_number  TEXT NOT NULL,
  status          public.invoice_status DEFAULT 'brouillon',
  invoice_type    TEXT DEFAULT 'facture' CHECK (invoice_type IN ('facture', 'avoir', 'acompte')),
  company_id      UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  beneficiary_id  UUID REFERENCES public.beneficiaries(id) ON DELETE SET NULL,
  funding_dossier_id UUID REFERENCES public.funding_dossiers(id) ON DELETE SET NULL,
  recipient_name  TEXT NOT NULL,
  recipient_address JSONB,
  session_id      UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  total_ht        NUMERIC(12,2) NOT NULL,
  tva_rate        NUMERIC(4,2) DEFAULT 0,
  tva_amount      NUMERIC(12,2) DEFAULT 0,
  total_ttc       NUMERIC(12,2) NOT NULL,
  amount_paid     NUMERIC(12,2) DEFAULT 0,
  nda_mention     TEXT,
  tva_mention     TEXT,
  issue_date      DATE NOT NULL,
  due_date        DATE NOT NULL,
  payment_date    DATE,
  payment_schedule JSONB,
  notes           TEXT,
  pdf_url         TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, invoice_number)
);

CREATE INDEX idx_invoices_org ON public.invoices(organization_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_company ON public.invoices(company_id);
CREATE INDEX idx_invoices_due ON public.invoices(due_date);

CREATE TRIGGER set_updated_at_invoices
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_staff_all"
  ON public.invoices FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "invoices_apprenant_select"
  ON public.invoices FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() IN ('apprenant', 'apprenti')
    AND beneficiary_id IN (
      SELECT id FROM public.beneficiaries WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "invoices_entreprise_select"
  ON public.invoices FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'entreprise'
    AND company_id IN (
      SELECT company_id FROM public.contacts WHERE user_id = auth.uid()
    )
  );

-- ===================== INVOICE LINES =====================

CREATE TABLE public.invoice_lines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description     TEXT NOT NULL,
  quantity        NUMERIC(8,2) NOT NULL DEFAULT 1,
  unit_price_ht   NUMERIC(12,2) NOT NULL,
  total_ht        NUMERIC(12,2) NOT NULL,
  formation_id    UUID REFERENCES public.formations(id) ON DELETE SET NULL,
  line_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_invoice_lines_invoice ON public.invoice_lines(invoice_id);

ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_lines_staff_all"
  ON public.invoice_lines FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.id = invoice_lines.invoice_id
      AND i.organization_id = auth.organization_id()
    )
    AND auth.is_staff()
  );

CREATE POLICY "invoice_lines_read_via_invoice"
  ON public.invoice_lines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.id = invoice_lines.invoice_id
      AND i.organization_id = auth.organization_id()
    )
  );

-- ===================== PAYMENTS =====================

CREATE TABLE public.payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invoice_id      UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount          NUMERIC(12,2) NOT NULL,
  payment_date    DATE NOT NULL,
  payment_method  TEXT,
  reference       TEXT,
  payer_name      TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payments_org ON public.payments(organization_id);
CREATE INDEX idx_payments_invoice ON public.payments(invoice_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_staff_all"
  ON public.payments FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "payments_entreprise_select"
  ON public.payments FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'entreprise'
    AND invoice_id IN (
      SELECT id FROM public.invoices
      WHERE company_id IN (SELECT company_id FROM public.contacts WHERE user_id = auth.uid())
    )
  );

-- ===================== PAYMENT REMINDERS =====================

CREATE TABLE public.payment_reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  reminder_level  INTEGER NOT NULL,
  sent_at         TIMESTAMPTZ NOT NULL,
  sent_by         UUID REFERENCES public.profiles(id),
  channel         TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reminders_invoice ON public.payment_reminders(invoice_id);

ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reminders_staff_all"
  ON public.payment_reminders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.id = payment_reminders.invoice_id
      AND i.organization_id = auth.organization_id()
    )
    AND auth.is_staff()
  );

-- ===================== DOCUMENTS / GED =====================

CREATE TABLE public.documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_type   public.document_type NOT NULL,
  title           TEXT NOT NULL,
  file_url        TEXT NOT NULL,
  file_size       BIGINT,
  mime_type       TEXT,
  session_id      UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  enrollment_id   UUID REFERENCES public.enrollments(id) ON DELETE SET NULL,
  beneficiary_id  UUID REFERENCES public.beneficiaries(id) ON DELETE SET NULL,
  company_id      UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  trainer_id      UUID REFERENCES public.trainers(id) ON DELETE SET NULL,
  invoice_id      UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  funding_dossier_id UUID REFERENCES public.funding_dossiers(id) ON DELETE SET NULL,
  version         INTEGER DEFAULT 1,
  is_signed       BOOLEAN DEFAULT FALSE,
  signed_at       TIMESTAMPTZ,
  uploaded_by     UUID REFERENCES public.profiles(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_documents_org ON public.documents(organization_id);
CREATE INDEX idx_documents_type ON public.documents(document_type);
CREATE INDEX idx_documents_session ON public.documents(session_id);
CREATE INDEX idx_documents_enrollment ON public.documents(enrollment_id);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_staff_all"
  ON public.documents FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "documents_formateur_select"
  ON public.documents FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'formateur'
    AND (
      trainer_id IN (SELECT id FROM public.trainers WHERE profile_id = auth.uid())
      OR session_id IN (
        SELECT s.id FROM public.sessions s
        JOIN public.trainers t ON t.id = s.trainer_id
        WHERE t.profile_id = auth.uid()
      )
    )
  );

CREATE POLICY "documents_apprenant_select"
  ON public.documents FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() IN ('apprenant', 'apprenti')
    AND beneficiary_id IN (
      SELECT id FROM public.beneficiaries WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "documents_entreprise_select"
  ON public.documents FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'entreprise'
    AND company_id IN (
      SELECT company_id FROM public.contacts WHERE user_id = auth.uid()
    )
  );
