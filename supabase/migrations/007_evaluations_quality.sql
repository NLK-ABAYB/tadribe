-- Migration 007: Evaluations, Certificats, Reclamations, Amelioration, Veille, Qualiopi + RLS
-- Dependances : 002, 004, 005

-- ===================== EVALUATIONS =====================

CREATE TABLE public.evaluations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  session_id      UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  formation_id    UUID REFERENCES public.formations(id) ON DELETE SET NULL,
  eval_type       public.eval_type NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  questions       JSONB NOT NULL DEFAULT '[]',
  scheduled_date  DATE,
  deadline_date   DATE,
  is_active       BOOLEAN DEFAULT TRUE,
  created_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_evaluations_org ON public.evaluations(organization_id);
CREATE INDEX idx_evaluations_session ON public.evaluations(session_id);
CREATE INDEX idx_evaluations_type ON public.evaluations(eval_type);

ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evaluations_staff_all"
  ON public.evaluations FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "evaluations_select_org"
  ON public.evaluations FOR SELECT
  USING (organization_id = auth.organization_id());

-- ===================== EVALUATION RESPONSES =====================

CREATE TABLE public.evaluation_responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id   UUID NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
  enrollment_id   UUID REFERENCES public.enrollments(id) ON DELETE SET NULL,
  beneficiary_id  UUID REFERENCES public.beneficiaries(id) ON DELETE SET NULL,
  respondent_type TEXT,
  respondent_name TEXT,
  answers         JSONB NOT NULL DEFAULT '{}',
  score           NUMERIC(5,2),
  submitted_at    TIMESTAMPTZ DEFAULT now(),
  is_anonymous    BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_eval_resp_evaluation ON public.evaluation_responses(evaluation_id);
CREATE INDEX idx_eval_resp_beneficiary ON public.evaluation_responses(beneficiary_id);

ALTER TABLE public.evaluation_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eval_resp_staff_all"
  ON public.evaluation_responses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.evaluations ev
      WHERE ev.id = evaluation_responses.evaluation_id
      AND ev.organization_id = auth.organization_id()
    )
    AND auth.is_staff()
  );

CREATE POLICY "eval_resp_apprenant_select"
  ON public.evaluation_responses FOR SELECT
  USING (
    auth.user_role() IN ('apprenant', 'apprenti')
    AND beneficiary_id IN (
      SELECT id FROM public.beneficiaries WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "eval_resp_apprenant_insert"
  ON public.evaluation_responses FOR INSERT
  WITH CHECK (
    auth.user_role() IN ('apprenant', 'apprenti')
    AND beneficiary_id IN (
      SELECT id FROM public.beneficiaries WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "eval_resp_entreprise_insert"
  ON public.evaluation_responses FOR INSERT
  WITH CHECK (
    auth.user_role() = 'entreprise'
    AND respondent_type = 'entreprise'
  );

CREATE POLICY "eval_resp_formateur_insert"
  ON public.evaluation_responses FOR INSERT
  WITH CHECK (
    auth.user_role() = 'formateur'
    AND respondent_type = 'formateur'
  );

-- ===================== CERTIFICATES =====================

CREATE TABLE public.certificates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  enrollment_id   UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL,
  title           TEXT NOT NULL,
  objectives_achieved TEXT[],
  duration_hours  NUMERIC(8,2),
  start_date      DATE,
  end_date        DATE,
  certification_id UUID REFERENCES public.certifications(id) ON DELETE SET NULL,
  certification_obtained BOOLEAN,
  blocks_obtained JSONB,
  issued_date     DATE NOT NULL,
  pdf_url         TEXT,
  sent_to_beneficiary BOOLEAN DEFAULT FALSE,
  sent_to_funder  BOOLEAN DEFAULT FALSE,
  created_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_certificates_org ON public.certificates(organization_id);
CREATE INDEX idx_certificates_enrollment ON public.certificates(enrollment_id);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certificates_staff_all"
  ON public.certificates FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "certificates_select_org"
  ON public.certificates FOR SELECT
  USING (organization_id = auth.organization_id());

-- ===================== COMPLAINTS (ind. 31) =====================

CREATE TABLE public.complaints (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  reference       TEXT NOT NULL,
  complainant_type TEXT,
  complainant_name TEXT,
  beneficiary_id  UUID REFERENCES public.beneficiaries(id) ON DELETE SET NULL,
  company_id      UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  session_id      UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  category        TEXT,
  severity        public.complaint_severity DEFAULT 'moyenne',
  subject         TEXT NOT NULL,
  description     TEXT NOT NULL,
  status          public.complaint_status DEFAULT 'ouvert',
  acknowledged_at TIMESTAMPTZ,
  assigned_to     UUID REFERENCES public.profiles(id),
  root_cause      TEXT,
  resolution      TEXT,
  resolved_at     TIMESTAMPTZ,
  closed_at       TIMESTAMPTZ,
  improvement_action_id UUID,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_complaints_org ON public.complaints(organization_id);
CREATE INDEX idx_complaints_status ON public.complaints(status);

CREATE TRIGGER set_updated_at_complaints
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "complaints_staff_all"
  ON public.complaints FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "complaints_insert_any"
  ON public.complaints FOR INSERT
  WITH CHECK (organization_id = auth.organization_id());

CREATE POLICY "complaints_select_own_apprenant"
  ON public.complaints FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() IN ('apprenant', 'apprenti')
    AND beneficiary_id IN (
      SELECT id FROM public.beneficiaries WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "complaints_select_own_entreprise"
  ON public.complaints FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'entreprise'
    AND company_id IN (
      SELECT company_id FROM public.contacts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "complaints_select_formateur"
  ON public.complaints FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'formateur'
  );

-- ===================== IMPROVEMENT ACTIONS (ind. 32) =====================

CREATE TABLE public.improvement_actions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  reference       TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  source_type     TEXT,
  source_id       UUID,
  status          public.improvement_status DEFAULT 'planifie',
  assigned_to     UUID REFERENCES public.profiles(id),
  priority        TEXT CHECK (priority IN ('basse', 'normale', 'haute', 'urgente')),
  due_date        DATE,
  completed_at    DATE,
  indicator_before TEXT,
  indicator_after TEXT,
  qualiopi_indicators INTEGER[],
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_improvements_org ON public.improvement_actions(organization_id);
CREATE INDEX idx_improvements_status ON public.improvement_actions(status);

CREATE TRIGGER set_updated_at_improvements
  BEFORE UPDATE ON public.improvement_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.improvement_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "improvements_staff_all"
  ON public.improvement_actions FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "improvements_formateur_select"
  ON public.improvement_actions FOR SELECT
  USING (organization_id = auth.organization_id() AND auth.user_role() = 'formateur');

-- Ajouter FK sur complaints
ALTER TABLE public.complaints
  ADD CONSTRAINT fk_complaints_improvement
  FOREIGN KEY (improvement_action_id)
  REFERENCES public.improvement_actions(id) ON DELETE SET NULL;

-- ===================== WATCH ENTRIES (ind. 23, 24, 25) =====================

CREATE TABLE public.watch_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category        public.watch_category NOT NULL,
  title           TEXT NOT NULL,
  source          TEXT,
  source_url      TEXT,
  content         TEXT,
  impact          TEXT,
  action_taken    TEXT,
  qualiopi_indicators INTEGER[],
  recorded_by     UUID REFERENCES public.profiles(id),
  recorded_at     DATE DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_watch_org ON public.watch_entries(organization_id);
CREATE INDEX idx_watch_category ON public.watch_entries(category);

ALTER TABLE public.watch_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "watch_staff_all"
  ON public.watch_entries FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "watch_formateur_select"
  ON public.watch_entries FOR SELECT
  USING (organization_id = auth.organization_id() AND auth.user_role() = 'formateur');

-- ===================== QUALITY REVIEWS =====================

CREATE TABLE public.quality_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  review_date     DATE NOT NULL,
  participants    UUID[],
  summary         TEXT,
  findings        JSONB DEFAULT '[]',
  decisions       JSONB DEFAULT '[]',
  minutes_url     TEXT,
  created_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_quality_reviews_org ON public.quality_reviews(organization_id);

ALTER TABLE public.quality_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quality_reviews_staff_all"
  ON public.quality_reviews FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

-- ===================== QUALIOPI EVIDENCE =====================

CREATE TABLE public.qualiopi_evidence (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  indicator_number INTEGER NOT NULL CHECK (indicator_number BETWEEN 1 AND 32),
  title           TEXT NOT NULL,
  description     TEXT,
  document_id     UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  evidence_url    TEXT,
  status          TEXT DEFAULT 'a_preparer'
                  CHECK (status IN ('a_preparer', 'en_cours', 'conforme', 'non_conforme')),
  audit_type      TEXT,
  notes           TEXT,
  reviewed_by     UUID REFERENCES public.profiles(id),
  reviewed_at     DATE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_qualiopi_org ON public.qualiopi_evidence(organization_id);
CREATE INDEX idx_qualiopi_indicator ON public.qualiopi_evidence(indicator_number);

CREATE TRIGGER set_updated_at_qualiopi
  BEFORE UPDATE ON public.qualiopi_evidence
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.qualiopi_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qualiopi_staff_all"
  ON public.qualiopi_evidence FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "qualiopi_formateur_select"
  ON public.qualiopi_evidence FOR SELECT
  USING (organization_id = auth.organization_id() AND auth.user_role() = 'formateur');
