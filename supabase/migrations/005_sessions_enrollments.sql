-- Migration 005: Locations, Trainers, Sessions, Beneficiaries, Enrollments, Attendances + RLS
-- Dependances : 002, 003, 004

-- ===================== LOCATIONS =====================

CREATE TABLE public.locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  address         JSONB,
  capacity        INTEGER,
  is_erp          BOOLEAN DEFAULT FALSE,
  is_accessible   BOOLEAN DEFAULT FALSE,
  equipment       TEXT[],
  notes           TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_locations_org ON public.locations(organization_id);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "locations_staff_all"
  ON public.locations FOR ALL
  USING (organization_id = public.organization_id() AND public.is_staff());

CREATE POLICY "locations_select_org"
  ON public.locations FOR SELECT
  USING (organization_id = public.organization_id());

-- ===================== TRAINERS =====================

CREATE TABLE public.trainers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  profile_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT,
  phone           VARCHAR(20),
  is_internal     BOOLEAN DEFAULT TRUE,
  company_id      UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  specialties     TEXT[],
  qualifications  JSONB DEFAULT '[]',
  cv_url          TEXT,
  cv_updated_at   DATE,
  hourly_rate     NUMERIC(8,2),
  daily_rate      NUMERIC(8,2),
  bio             TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_trainers_org ON public.trainers(organization_id);
CREATE INDEX idx_trainers_profile ON public.trainers(profile_id);

CREATE TRIGGER set_updated_at_trainers
  BEFORE UPDATE ON public.trainers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trainers_staff_all"
  ON public.trainers FOR ALL
  USING (organization_id = public.organization_id() AND public.is_staff());

CREATE POLICY "trainers_self_select"
  ON public.trainers FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'formateur'
    AND profile_id = auth.uid()
  );

-- Competences formateurs (ind. 21)
CREATE TABLE public.trainer_competencies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id      UUID NOT NULL REFERENCES public.trainers(id) ON DELETE CASCADE,
  formation_id    UUID NOT NULL REFERENCES public.formations(id) ON DELETE CASCADE,
  validated       BOOLEAN DEFAULT FALSE,
  validated_by    UUID REFERENCES public.profiles(id),
  validated_at    TIMESTAMPTZ,
  notes           TEXT,
  UNIQUE(trainer_id, formation_id)
);

ALTER TABLE public.trainer_competencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trainer_comp_staff_all"
  ON public.trainer_competencies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.trainers t
      WHERE t.id = trainer_competencies.trainer_id
      AND t.organization_id = public.organization_id()
    )
    AND public.is_staff()
  );

CREATE POLICY "trainer_comp_self_select"
  ON public.trainer_competencies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trainers t
      WHERE t.id = trainer_competencies.trainer_id
      AND t.profile_id = auth.uid()
    )
  );

-- ===================== SESSIONS =====================

CREATE TABLE public.sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  formation_id    UUID NOT NULL REFERENCES public.formations(id) ON DELETE CASCADE,
  code            TEXT,
  status          public.session_status DEFAULT 'planifiee',
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  location_id     UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  is_remote       BOOLEAN DEFAULT FALSE,
  remote_url      TEXT,
  min_participants INTEGER DEFAULT 1,
  max_participants INTEGER,
  trainer_id      UUID REFERENCES public.trainers(id) ON DELETE SET NULL,
  coordinator_id  UUID REFERENCES public.profiles(id),
  notes           TEXT,
  alternance_calendar JSONB,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sessions_org ON public.sessions(organization_id);
CREATE INDEX idx_sessions_formation ON public.sessions(formation_id);
CREATE INDEX idx_sessions_dates ON public.sessions(start_date, end_date);
CREATE INDEX idx_sessions_trainer ON public.sessions(trainer_id);
CREATE INDEX idx_sessions_status ON public.sessions(status);

CREATE TRIGGER set_updated_at_sessions
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_staff_all"
  ON public.sessions FOR ALL
  USING (organization_id = public.organization_id() AND public.is_staff());

CREATE POLICY "sessions_formateur_select"
  ON public.sessions FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'formateur'
    AND trainer_id IN (SELECT id FROM public.trainers WHERE profile_id = auth.uid())
  );

-- NB : les politiques sessions_apprenant_select et sessions_entreprise_select
-- référencent public.enrollments et sont donc créées plus bas, une fois la
-- table enrollments existante.

-- ===================== SESSION SLOTS =====================

CREATE TABLE public.session_slots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  slot_date       DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  period          TEXT CHECK (period IN ('matin', 'apres_midi', 'journee')),
  topic           TEXT,
  trainer_id      UUID REFERENCES public.trainers(id) ON DELETE SET NULL,
  location_id     UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_slots_session ON public.session_slots(session_id);
CREATE INDEX idx_slots_date ON public.session_slots(slot_date);

ALTER TABLE public.session_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "slots_staff_all"
  ON public.session_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_slots.session_id
      AND s.organization_id = public.organization_id()
    )
    AND public.is_staff()
  );

CREATE POLICY "slots_read_org"
  ON public.session_slots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_slots.session_id
      AND s.organization_id = public.organization_id()
    )
  );

-- ===================== BENEFICIARIES =====================

CREATE TABLE public.beneficiaries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  profile_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  company_id      UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT,
  phone           VARCHAR(20),
  birth_date      DATE,
  address         JSONB,
  status          TEXT,
  job_title       TEXT,
  qualification_level TEXT,
  -- Handicap (ind. 26)
  has_disability  BOOLEAN,
  disability_details TEXT,
  disability_consent BOOLEAN DEFAULT FALSE,
  -- Apprentissage
  is_apprentice   BOOLEAN DEFAULT FALSE,
  apprentice_contract_start DATE,
  apprentice_contract_end DATE,
  tutor_contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  -- Metadata
  france_travail_id TEXT,
  cpf_holder      BOOLEAN DEFAULT FALSE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_beneficiaries_org ON public.beneficiaries(organization_id);
CREATE INDEX idx_beneficiaries_company ON public.beneficiaries(company_id);
CREATE INDEX idx_beneficiaries_profile ON public.beneficiaries(profile_id);

CREATE TRIGGER set_updated_at_beneficiaries
  BEFORE UPDATE ON public.beneficiaries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "beneficiaries_staff_all"
  ON public.beneficiaries FOR ALL
  USING (organization_id = public.organization_id() AND public.is_staff());

CREATE POLICY "beneficiaries_formateur_select"
  ON public.beneficiaries FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'formateur'
  );

CREATE POLICY "beneficiaries_self_select"
  ON public.beneficiaries FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() IN ('apprenant', 'apprenti')
    AND profile_id = auth.uid()
  );

CREATE POLICY "beneficiaries_entreprise_select"
  ON public.beneficiaries FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (SELECT company_id FROM public.contacts WHERE user_id = auth.uid())
  );

-- ===================== ENROLLMENTS =====================

CREATE TABLE public.enrollments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  session_id      UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  beneficiary_id  UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  company_id      UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  status          public.inscription_status DEFAULT 'pre_inscrit',
  enrollment_date TIMESTAMPTZ DEFAULT now(),
  -- Positionnement (ind. 8)
  positioning_done BOOLEAN DEFAULT FALSE,
  positioning_date DATE,
  positioning_result JSONB,
  positioning_notes TEXT,
  -- Contractuel
  convention_signed BOOLEAN DEFAULT FALSE,
  convention_date DATE,
  contract_type   TEXT,
  retraction_deadline DATE,
  -- Documents transmis (ind. 9)
  convocation_sent BOOLEAN DEFAULT FALSE,
  convocation_date TIMESTAMPTZ,
  welcome_booklet_sent BOOLEAN DEFAULT FALSE,
  rules_acknowledged BOOLEAN DEFAULT FALSE,
  -- Suivi
  completion_date DATE,
  dropout_date    DATE,
  dropout_reason  TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, beneficiary_id)
);

CREATE INDEX idx_enrollments_org ON public.enrollments(organization_id);
CREATE INDEX idx_enrollments_session ON public.enrollments(session_id);
CREATE INDEX idx_enrollments_beneficiary ON public.enrollments(beneficiary_id);
CREATE INDEX idx_enrollments_status ON public.enrollments(status);

CREATE TRIGGER set_updated_at_enrollments
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enrollments_staff_all"
  ON public.enrollments FOR ALL
  USING (organization_id = public.organization_id() AND public.is_staff());

CREATE POLICY "enrollments_formateur_select"
  ON public.enrollments FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'formateur'
    AND session_id IN (
      SELECT s.id FROM public.sessions s
      JOIN public.trainers t ON t.id = s.trainer_id
      WHERE t.profile_id = auth.uid()
    )
  );

CREATE POLICY "enrollments_apprenant_select"
  ON public.enrollments FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() IN ('apprenant', 'apprenti')
    AND beneficiary_id IN (
      SELECT id FROM public.beneficiaries WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "enrollments_entreprise_select"
  ON public.enrollments FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND company_id IN (
      SELECT company_id FROM public.contacts WHERE user_id = auth.uid()
    )
  );

-- Politiques sur public.sessions qui référencent public.enrollments : définies
-- ici car elles dépendent de la table enrollments, qui vient d'être créée.
CREATE POLICY "sessions_apprenant_select"
  ON public.sessions FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() IN ('apprenant', 'apprenti')
    AND id IN (
      SELECT session_id FROM public.enrollments e
      JOIN public.beneficiaries b ON b.id = e.beneficiary_id
      WHERE b.profile_id = auth.uid()
    )
  );

CREATE POLICY "sessions_entreprise_select"
  ON public.sessions FOR SELECT
  USING (
    organization_id = public.organization_id()
    AND public.user_role() = 'entreprise'
    AND id IN (
      SELECT session_id FROM public.enrollments
      WHERE company_id IN (SELECT company_id FROM public.contacts WHERE user_id = auth.uid())
    )
  );

-- ===================== ATTENDANCES (ind. 12) =====================

CREATE TABLE public.attendances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id   UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  session_slot_id UUID NOT NULL REFERENCES public.session_slots(id) ON DELETE CASCADE,
  is_present      BOOLEAN,
  signed_at       TIMESTAMPTZ,
  signature_data  TEXT,
  absence_justified BOOLEAN,
  absence_reason  TEXT,
  signaled_to_funder BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(enrollment_id, session_slot_id)
);

CREATE INDEX idx_attendances_enrollment ON public.attendances(enrollment_id);
CREATE INDEX idx_attendances_slot ON public.attendances(session_slot_id);

ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attendances_staff_all"
  ON public.attendances FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.id = attendances.enrollment_id
      AND e.organization_id = public.organization_id()
    )
    AND public.is_staff()
  );

CREATE POLICY "attendances_formateur_all"
  ON public.attendances FOR ALL
  USING (
    public.user_role() = 'formateur'
    AND EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.sessions s ON s.id = e.session_id
      JOIN public.trainers t ON t.id = s.trainer_id
      WHERE e.id = attendances.enrollment_id
      AND t.profile_id = auth.uid()
    )
  );

CREATE POLICY "attendances_apprenant_select"
  ON public.attendances FOR SELECT
  USING (
    public.user_role() IN ('apprenant', 'apprenti')
    AND EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.beneficiaries b ON b.id = e.beneficiary_id
      WHERE e.id = attendances.enrollment_id
      AND b.profile_id = auth.uid()
    )
  );

-- ===================== INDIVIDUAL ADAPTATIONS (ind. 10) =====================

CREATE TABLE public.individual_adaptations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id   UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  adaptation_type TEXT NOT NULL,
  description     TEXT NOT NULL,
  implemented_at  DATE,
  implemented_by  UUID REFERENCES public.profiles(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_adaptations_enrollment ON public.individual_adaptations(enrollment_id);

ALTER TABLE public.individual_adaptations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "adaptations_staff_all"
  ON public.individual_adaptations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.id = individual_adaptations.enrollment_id
      AND e.organization_id = public.organization_id()
    )
    AND public.is_staff()
  );

CREATE POLICY "adaptations_read_org"
  ON public.individual_adaptations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.id = individual_adaptations.enrollment_id
      AND e.organization_id = public.organization_id()
    )
  );
