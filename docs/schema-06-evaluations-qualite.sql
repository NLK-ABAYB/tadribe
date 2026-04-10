-- ============================================================
-- SCHEMA SUPABASE -- Partie 6 : Evaluations, Qualite, Qualiopi
-- ============================================================

-- ===================== EVALUATIONS (ind. 8, 11, 30) =====================

CREATE TABLE evaluations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  session_id      UUID REFERENCES sessions(id),
  formation_id    UUID REFERENCES formations(id),
  eval_type       eval_type NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  -- Contenu du questionnaire
  questions       JSONB NOT NULL DEFAULT '[]',     -- [{id, text, type, options, required}]
  -- Planning
  scheduled_date  DATE,
  deadline_date   DATE,
  is_active       BOOLEAN DEFAULT TRUE,
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Reponses aux evaluations
CREATE TABLE evaluation_responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id   UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  enrollment_id   UUID REFERENCES enrollments(id),
  beneficiary_id  UUID REFERENCES beneficiaries(id),
  respondent_type TEXT,                            -- beneficiaire, entreprise, formateur, financeur
  respondent_name TEXT,
  -- Reponses
  answers         JSONB NOT NULL DEFAULT '{}',     -- {question_id: answer}
  score           NUMERIC(5,2),                    -- Note globale calculee
  -- Metadata
  submitted_at    TIMESTAMPTZ DEFAULT now(),
  is_anonymous    BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== ATTESTATIONS DE FIN DE FORMATION =====================

CREATE TABLE certificates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  enrollment_id   UUID NOT NULL REFERENCES enrollments(id),
  certificate_type TEXT NOT NULL,                   -- attestation_fin, certificat_realisation, diplome
  -- Contenu
  title           TEXT NOT NULL,
  objectives_achieved TEXT[],                      -- Objectifs atteints
  duration_hours  NUMERIC(8,2),
  start_date      DATE,
  end_date        DATE,
  -- Certification
  certification_id UUID REFERENCES certifications(id),
  certification_obtained BOOLEAN,
  blocks_obtained JSONB,                           -- Blocs de competences valides
  -- Metadata
  issued_date     DATE NOT NULL,
  pdf_url         TEXT,
  sent_to_beneficiary BOOLEAN DEFAULT FALSE,
  sent_to_funder  BOOLEAN DEFAULT FALSE,
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== RECLAMATIONS (ind. 31 -- super-indicateur) =====================

CREATE TABLE complaints (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  reference       TEXT NOT NULL,                   -- Numero de reclamation
  -- Source
  complainant_type TEXT,                           -- beneficiaire, entreprise, formateur, financeur
  complainant_name TEXT,
  beneficiary_id  UUID REFERENCES beneficiaries(id),
  company_id      UUID REFERENCES companies(id),
  session_id      UUID REFERENCES sessions(id),
  -- Contenu
  category        TEXT,                            -- pedagogique, administratif, logistique, financier
  severity        complaint_severity DEFAULT 'moyenne',
  subject         TEXT NOT NULL,
  description     TEXT NOT NULL,
  -- Traitement
  status          complaint_status DEFAULT 'ouvert',
  acknowledged_at TIMESTAMPTZ,                     -- Accuse de reception
  assigned_to     UUID REFERENCES profiles(id),
  root_cause      TEXT,                            -- Analyse des causes
  resolution      TEXT,                            -- Actions correctives
  resolved_at     TIMESTAMPTZ,
  closed_at       TIMESTAMPTZ,
  -- Lien amelioration continue
  improvement_action_id UUID,                      -- Ref vers improvement_actions
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== AMELIORATION CONTINUE (ind. 32 -- super-indicateur) =====================

CREATE TABLE improvement_actions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  reference       TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  -- Source
  source_type     TEXT,                            -- reclamation, evaluation, audit, veille, revue_qualite
  source_id       UUID,                            -- ID de la source (complaint, evaluation, etc.)
  -- Plan d'action
  status          improvement_status DEFAULT 'planifie',
  assigned_to     UUID REFERENCES profiles(id),
  priority        TEXT CHECK (priority IN ('basse', 'normale', 'haute', 'urgente')),
  due_date        DATE,
  completed_at    DATE,
  -- Indicateurs
  indicator_before TEXT,                           -- Etat avant action
  indicator_after TEXT,                            -- Etat apres action (resultat)
  qualiopi_indicators INTEGER[],                   -- Indicateurs Qualiopi concernes
  -- Metadata
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== VEILLE (ind. 23, 24, 25) =====================

CREATE TABLE watch_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  category        watch_category NOT NULL,
  title           TEXT NOT NULL,
  source          TEXT,                            -- Newsletter, site web, reunion, etc.
  source_url      TEXT,
  content         TEXT,
  impact          TEXT,                            -- Impact identifie sur l'OF
  action_taken    TEXT,                            -- Action entreprise en consequence
  qualiopi_indicators INTEGER[],                   -- Indicateurs concernes
  recorded_by     UUID REFERENCES profiles(id),
  recorded_at     DATE DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== REVUES QUALITE =====================

CREATE TABLE quality_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title           TEXT NOT NULL,
  review_date     DATE NOT NULL,
  participants    UUID[],                          -- IDs des participants (profiles)
  -- Contenu
  summary         TEXT,
  findings        JSONB DEFAULT '[]',              -- Constats
  decisions       JSONB DEFAULT '[]',              -- Decisions prises
  -- Documents
  minutes_url     TEXT,                            -- PV de la revue
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== AUDIT QUALIOPI (preparation) =====================

CREATE TABLE qualiopi_evidence (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  indicator_number INTEGER NOT NULL CHECK (indicator_number BETWEEN 1 AND 32),
  -- Preuve
  title           TEXT NOT NULL,
  description     TEXT,
  document_id     UUID REFERENCES documents(id),
  evidence_url    TEXT,
  -- Statut
  status          TEXT DEFAULT 'a_preparer' CHECK (status IN ('a_preparer', 'en_cours', 'conforme', 'non_conforme')),
  audit_type      TEXT,                            -- initial, surveillance, renouvellement
  notes           TEXT,
  reviewed_by     UUID REFERENCES profiles(id),
  reviewed_at     DATE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== SOUS-TRAITANTS (ind. 27) =====================

CREATE TABLE subcontractors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  company_id      UUID REFERENCES companies(id),
  name            TEXT NOT NULL,
  siret           VARCHAR(14),
  contact_name    TEXT,
  contact_email   TEXT,
  contact_phone   VARCHAR(20),
  -- Qualite (ind. 27)
  has_quality_charter BOOLEAN DEFAULT FALSE,
  quality_charter_url TEXT,
  contract_url    TEXT,
  contract_start  DATE,
  contract_end    DATE,
  -- Evaluation
  last_evaluation_date DATE,
  last_evaluation_score NUMERIC(4,1),
  specialties     TEXT[],
  is_active       BOOLEAN DEFAULT TRUE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== DEVELOPPEMENT COMPETENCES EQUIPE (ind. 22) =====================

CREATE TABLE staff_training (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  profile_id      UUID NOT NULL REFERENCES profiles(id),
  title           TEXT NOT NULL,
  description     TEXT,
  training_type   TEXT,                            -- formation, conference, webinaire, autoformation
  provider        TEXT,
  start_date      DATE,
  end_date        DATE,
  duration_hours  NUMERIC(6,1),
  certificate_url TEXT,
  cost            NUMERIC(8,2),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== ENTRETIENS PROFESSIONNELS (ind. 22) =====================

CREATE TABLE professional_interviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  profile_id      UUID NOT NULL REFERENCES profiles(id),
  interviewer_id  UUID REFERENCES profiles(id),
  interview_date  DATE NOT NULL,
  summary         TEXT,
  objectives      TEXT[],
  training_needs  TEXT[],
  next_interview  DATE,
  document_url    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== CFA : SUIVI ALTERNANCE (ind. 13) =====================

CREATE TABLE apprentice_visits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  enrollment_id   UUID NOT NULL REFERENCES enrollments(id),
  visit_date      DATE NOT NULL,
  visit_type      TEXT,                            -- visite_entreprise, bilan_tripartite, telephonique
  trainer_id      UUID REFERENCES trainers(id),
  tutor_present   BOOLEAN DEFAULT FALSE,
  apprentice_present BOOLEAN DEFAULT FALSE,
  summary         TEXT,
  objectives_review JSONB,                         -- Revue des objectifs
  next_actions    TEXT,
  document_url    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== INDEX =====================

CREATE INDEX idx_profiles_org ON profiles(organization_id);
CREATE INDEX idx_companies_org ON companies(organization_id);
CREATE INDEX idx_contacts_org ON contacts(organization_id);
CREATE INDEX idx_formations_org ON formations(organization_id);
CREATE INDEX idx_sessions_org ON sessions(organization_id);
CREATE INDEX idx_sessions_formation ON sessions(formation_id);
CREATE INDEX idx_sessions_dates ON sessions(start_date, end_date);
CREATE INDEX idx_enrollments_session ON enrollments(session_id);
CREATE INDEX idx_enrollments_beneficiary ON enrollments(beneficiary_id);
CREATE INDEX idx_attendances_enrollment ON attendances(enrollment_id);
CREATE INDEX idx_funding_org ON funding_dossiers(organization_id);
CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_complaints_org ON complaints(organization_id);
CREATE INDEX idx_documents_org ON documents(organization_id);

-- ===================== TRIGGERS updated_at =====================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer a toutes les tables avec updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'updated_at'
    AND table_schema = 'public'
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t
    );
  END LOOP;
END;
$$;
