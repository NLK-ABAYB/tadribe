-- ============================================================
-- SCHEMA SUPABASE -- Partie 5 : Financements, Facturation, Documents
-- ============================================================

-- ===================== DOSSIERS DE FINANCEMENT =====================

CREATE TABLE funding_dossiers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  enrollment_id   UUID REFERENCES enrollments(id),
  session_id      UUID REFERENCES sessions(id),
  beneficiary_id  UUID REFERENCES beneficiaries(id),
  company_id      UUID REFERENCES companies(id),
  -- Type et statut
  funding_type    funding_type NOT NULL,
  status          funding_status DEFAULT 'brouillon',
  -- Financeur
  funder_name     TEXT,                            -- Nom du financeur
  opco_id         UUID REFERENCES opcos(id),
  funder_reference TEXT,                           -- Numero de dossier chez le financeur
  -- Montants
  amount_requested NUMERIC(12,2),
  amount_granted  NUMERIC(12,2),
  amount_paid     NUMERIC(12,2) DEFAULT 0,
  remainder_beneficiary NUMERIC(12,2) DEFAULT 0,   -- Reste a charge stagiaire
  remainder_company NUMERIC(12,2) DEFAULT 0,       -- Reste a charge entreprise
  -- Subrogation
  is_subrogation  BOOLEAN DEFAULT FALSE,           -- Paiement direct OF par le financeur
  -- Dates
  submitted_at    DATE,
  deadline_date   DATE,                            -- Date limite de depot
  decision_date   DATE,
  payment_date    DATE,
  -- CPF specifique
  cpf_dossier_id  TEXT,                            -- ID Mon Compte Formation
  cpf_reste_charge NUMERIC(8,2),                   -- 103.20 EUR en 2026
  -- Documents
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== FACTURES =====================

CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  invoice_number  TEXT NOT NULL,                    -- Numero sequentiel
  status          invoice_status DEFAULT 'brouillon',
  invoice_type    TEXT DEFAULT 'facture' CHECK (invoice_type IN ('facture', 'avoir', 'acompte')),
  -- Destinataire
  company_id      UUID REFERENCES companies(id),
  beneficiary_id  UUID REFERENCES beneficiaries(id),
  funding_dossier_id UUID REFERENCES funding_dossiers(id),
  recipient_name  TEXT NOT NULL,
  recipient_address JSONB,
  -- Lien session
  session_id      UUID REFERENCES sessions(id),
  -- Montants
  total_ht        NUMERIC(12,2) NOT NULL,
  tva_rate        NUMERIC(4,2) DEFAULT 0,          -- 0 si exonere, 20 sinon
  tva_amount      NUMERIC(12,2) DEFAULT 0,
  total_ttc       NUMERIC(12,2) NOT NULL,
  amount_paid     NUMERIC(12,2) DEFAULT 0,
  -- Mentions obligatoires
  nda_mention     TEXT,                            -- "Enregistre sous le numero..."
  tva_mention     TEXT,                            -- "TVA non applicable..." si exonere
  -- Dates
  issue_date      DATE NOT NULL,
  due_date        DATE NOT NULL,
  payment_date    DATE,
  -- Echeancier (B2C)
  payment_schedule JSONB,                          -- [{date, amount, paid}]
  -- Metadata
  notes           TEXT,
  pdf_url         TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, invoice_number)
);

-- Lignes de facture
CREATE TABLE invoice_lines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description     TEXT NOT NULL,
  quantity        NUMERIC(8,2) NOT NULL DEFAULT 1,
  unit_price_ht   NUMERIC(12,2) NOT NULL,
  total_ht        NUMERIC(12,2) NOT NULL,
  formation_id    UUID REFERENCES formations(id),
  line_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Paiements recus
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  invoice_id      UUID NOT NULL REFERENCES invoices(id),
  amount          NUMERIC(12,2) NOT NULL,
  payment_date    DATE NOT NULL,
  payment_method  TEXT,                            -- virement, cheque, CB, prelevement
  reference       TEXT,                            -- Reference du paiement
  payer_name      TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Relances
CREATE TABLE payment_reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID NOT NULL REFERENCES invoices(id),
  reminder_level  INTEGER NOT NULL,                -- 1, 2, 3 (mise en demeure)
  sent_at         TIMESTAMPTZ NOT NULL,
  sent_by         UUID REFERENCES profiles(id),
  channel         TEXT,                            -- email, courrier
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== DOCUMENTS / GED =====================

CREATE TABLE documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  document_type   document_type NOT NULL,
  title           TEXT NOT NULL,
  file_url        TEXT NOT NULL,                   -- URL dans Supabase Storage
  file_size       BIGINT,
  mime_type       TEXT,
  -- Liens polymorphiques
  session_id      UUID REFERENCES sessions(id),
  enrollment_id   UUID REFERENCES enrollments(id),
  beneficiary_id  UUID REFERENCES beneficiaries(id),
  company_id      UUID REFERENCES companies(id),
  trainer_id      UUID REFERENCES trainers(id),
  invoice_id      UUID REFERENCES invoices(id),
  funding_dossier_id UUID REFERENCES funding_dossiers(id),
  -- Metadata
  version         INTEGER DEFAULT 1,
  is_signed       BOOLEAN DEFAULT FALSE,
  signed_at       TIMESTAMPTZ,
  uploaded_by     UUID REFERENCES profiles(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);
