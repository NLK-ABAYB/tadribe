-- Migration 008: CFA (visites apprentis), Competences equipe, Sous-traitants + RLS
-- Dependances : 002, 003, 005

-- ===================== APPRENTICE VISITS (ind. 13 CFA) =====================

CREATE TABLE public.apprentice_visits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  enrollment_id   UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  visit_date      DATE NOT NULL,
  visit_type      TEXT,
  trainer_id      UUID REFERENCES public.trainers(id) ON DELETE SET NULL,
  tutor_present   BOOLEAN DEFAULT FALSE,
  apprentice_present BOOLEAN DEFAULT FALSE,
  summary         TEXT,
  objectives_review JSONB,
  next_actions    TEXT,
  document_url    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_visits_org ON public.apprentice_visits(organization_id);
CREATE INDEX idx_visits_enrollment ON public.apprentice_visits(enrollment_id);

ALTER TABLE public.apprentice_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "visits_staff_all"
  ON public.apprentice_visits FOR ALL
  USING (organization_id = public.organization_id() AND public.is_staff());

CREATE POLICY "visits_formateur_all"
  ON public.apprentice_visits FOR ALL
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'formateur'
    AND trainer_id IN (SELECT id FROM public.trainers WHERE profile_id = auth.uid())
  );

CREATE POLICY "visits_apprenti_select"
  ON public.apprentice_visits FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'apprenti'
    AND enrollment_id IN (
      SELECT e.id FROM public.enrollments e
      JOIN public.beneficiaries b ON b.id = e.beneficiary_id
      WHERE b.profile_id = auth.uid()
    )
  );

CREATE POLICY "visits_entreprise_select"
  ON public.apprentice_visits FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND enrollment_id IN (
      SELECT e.id FROM public.enrollments e
      WHERE e.company_id IN (
        SELECT company_id FROM public.contacts WHERE user_id = auth.uid()
      )
    )
  );

-- ===================== STAFF TRAINING (ind. 22) =====================

CREATE TABLE public.staff_training (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  profile_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  training_type   TEXT,
  provider        TEXT,
  start_date      DATE,
  end_date        DATE,
  duration_hours  NUMERIC(6,1),
  certificate_url TEXT,
  cost            NUMERIC(8,2),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_staff_training_org ON public.staff_training(organization_id);
CREATE INDEX idx_staff_training_profile ON public.staff_training(profile_id);

ALTER TABLE public.staff_training ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_training_admin_all"
  ON public.staff_training FOR ALL
  USING (organization_id = public.organization_id() AND public.is_admin());

CREATE POLICY "staff_training_gestionnaire_all"
  ON public.staff_training FOR ALL
  USING (organization_id = public.organization_id() AND public.user_role() = 'gestionnaire');

CREATE POLICY "staff_training_self_select"
  ON public.staff_training FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND profile_id = auth.uid()
  );

-- ===================== PROFESSIONAL INTERVIEWS (ind. 22) =====================

CREATE TABLE public.professional_interviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  profile_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interviewer_id  UUID REFERENCES public.profiles(id),
  interview_date  DATE NOT NULL,
  summary         TEXT,
  objectives      TEXT[],
  training_needs  TEXT[],
  next_interview  DATE,
  document_url    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_interviews_org ON public.professional_interviews(organization_id);
CREATE INDEX idx_interviews_profile ON public.professional_interviews(profile_id);

ALTER TABLE public.professional_interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interviews_admin_all"
  ON public.professional_interviews FOR ALL
  USING (organization_id = public.organization_id() AND public.is_admin());

CREATE POLICY "interviews_self_select"
  ON public.professional_interviews FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND profile_id = auth.uid()
  );

-- ===================== SUBCONTRACTORS (ind. 27) =====================

CREATE TABLE public.subcontractors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  company_id      UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  siret           VARCHAR(14),
  contact_name    TEXT,
  contact_email   TEXT,
  contact_phone   VARCHAR(20),
  has_quality_charter BOOLEAN DEFAULT FALSE,
  quality_charter_url TEXT,
  contract_url    TEXT,
  contract_start  DATE,
  contract_end    DATE,
  last_evaluation_date DATE,
  last_evaluation_score NUMERIC(4,1),
  specialties     TEXT[],
  is_active       BOOLEAN DEFAULT TRUE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subcontractors_org ON public.subcontractors(organization_id);

CREATE TRIGGER set_updated_at_subcontractors
  BEFORE UPDATE ON public.subcontractors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.subcontractors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subcontractors_staff_all"
  ON public.subcontractors FOR ALL
  USING (organization_id = public.organization_id() AND public.is_staff());
