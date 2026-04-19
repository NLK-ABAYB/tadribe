-- Migration 020: track document emails sent (devis, convention, facture, certificat, convocation, emargement)
-- Dependencies: 002 (organizations), 003 (companies), 014 (is_staff), 016 (quotes), 017 (conventions)

-- Ensure sent_at columns exist on document tables (idempotent)
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS sent_at timestamptz;
ALTER TABLE public.conventions ADD COLUMN IF NOT EXISTS sent_at timestamptz;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS convocation_date date;

CREATE TABLE public.document_emails (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id    uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_type      text NOT NULL CHECK (document_type IN ('devis', 'convention', 'facture', 'certificat', 'convocation', 'emargement')),
  document_id        uuid NOT NULL,
  to_email           text NOT NULL,
  cc_email           text,
  subject            text NOT NULL,
  body               text,
  sent_at            timestamptz DEFAULT now(),
  sent_by            uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status             text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
  error_message      text,
  resend_message_id  text
);

CREATE INDEX idx_document_emails_org ON public.document_emails(organization_id);
CREATE INDEX idx_document_emails_doc ON public.document_emails(document_type, document_id);
CREATE INDEX idx_document_emails_sent_at ON public.document_emails(sent_at DESC);

ALTER TABLE public.document_emails ENABLE ROW LEVEL SECURITY;

-- Staff members see everything in their org
CREATE POLICY "document_emails_staff_all"
  ON public.document_emails FOR ALL
  USING (organization_id = public.organization_id() AND public.is_staff());

-- Entreprise role: read-only access to emails about their own company's documents
CREATE POLICY "document_emails_entreprise_select"
  ON public.document_emails FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND document_type IN ('devis', 'convention', 'facture')
    AND (
      (document_type = 'devis' AND document_id IN (
        SELECT q.id FROM public.quotes q
        WHERE q.company_id IN (SELECT company_id FROM public.contacts WHERE user_id = auth.uid())
      ))
      OR (document_type = 'convention' AND document_id IN (
        SELECT c.id FROM public.conventions c
        WHERE c.company_id IN (SELECT company_id FROM public.contacts WHERE user_id = auth.uid())
      ))
      OR (document_type = 'facture' AND document_id IN (
        SELECT i.id FROM public.invoices i
        WHERE i.company_id IN (SELECT company_id FROM public.contacts WHERE user_id = auth.uid())
      ))
    )
  );
