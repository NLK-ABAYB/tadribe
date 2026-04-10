-- ============================================================
-- SCHEMA SUPABASE -- Partie 4 : Sessions, Inscriptions, Emargement
-- ============================================================

-- ===================== LIEUX / SALLES =====================

CREATE TABLE locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name            TEXT NOT NULL,
  address         JSONB,
  capacity        INTEGER,
  is_erp          BOOLEAN DEFAULT FALSE,           -- Etablissement Recevant du Public
  is_accessible   BOOLEAN DEFAULT FALSE,           -- Accessibilite PMR
  equipment       TEXT[],                          -- videoprojecteur, paperboard, PC...
  notes           TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== FORMATEURS =====================

CREATE TABLE trainers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  profile_id      UUID REFERENCES profiles(id),    -- Si formateur interne avec compte
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT,
  phone           VARCHAR(20),
  is_internal     BOOLEAN DEFAULT TRUE,
  company_id      UUID REFERENCES companies(id),   -- Si sous-traitant
  specialties     TEXT[],                          -- Domaines d'expertise
  qualifications  JSONB DEFAULT '[]',              -- [{title, institution, year}]
  cv_url          TEXT,                            -- ind. 21
  cv_updated_at   DATE,                            -- ind. 21 alerte MAJ annuelle
  hourly_rate     NUMERIC(8,2),
  daily_rate      NUMERIC(8,2),
  bio             TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Competences des formateurs (ind. 21 : matrice competences/formations)
CREATE TABLE trainer_competencies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id      UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  formation_id    UUID NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  validated       BOOLEAN DEFAULT FALSE,
  validated_by    UUID REFERENCES profiles(id),
  validated_at    TIMESTAMPTZ,
  notes           TEXT,
  UNIQUE(trainer_id, formation_id)
);

-- ===================== SESSIONS DE FORMATION =====================

CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  formation_id    UUID NOT NULL REFERENCES formations(id),
  code            TEXT,                            -- Code session interne
  status          session_status DEFAULT 'planifiee',
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  location_id     UUID REFERENCES locations(id),
  is_remote       BOOLEAN DEFAULT FALSE,
  remote_url      TEXT,                            -- Lien visio
  min_participants INTEGER DEFAULT 1,
  max_participants INTEGER,
  trainer_id      UUID REFERENCES trainers(id),
  coordinator_id  UUID REFERENCES profiles(id),    -- Coordinateur pedagogique
  notes           TEXT,
  -- Alternance (CFA)
  alternance_calendar JSONB,                       -- Planning centre/entreprise
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Creneaux horaires detailles par session
CREATE TABLE session_slots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  slot_date       DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  period          TEXT CHECK (period IN ('matin', 'apres_midi', 'journee')),
  topic           TEXT,                            -- Sujet de la seance
  trainer_id      UUID REFERENCES trainers(id),
  location_id     UUID REFERENCES locations(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== BENEFICIAIRES / STAGIAIRES =====================

CREATE TABLE beneficiaries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  profile_id      UUID REFERENCES profiles(id),    -- Si compte apprenant
  company_id      UUID REFERENCES companies(id),   -- Entreprise de rattachement
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT,
  phone           VARCHAR(20),
  birth_date      DATE,
  address         JSONB,
  -- Situation professionnelle
  status          TEXT,                            -- salarie, demandeur_emploi, independant
  job_title       TEXT,
  qualification_level TEXT,                        -- Niveau de qualification
  -- Handicap (ind. 26 -- consentement RGPD obligatoire)
  has_disability  BOOLEAN,
  disability_details TEXT,                         -- Amenagements necessaires
  disability_consent BOOLEAN DEFAULT FALSE,
  -- Apprentissage (CFA)
  is_apprentice   BOOLEAN DEFAULT FALSE,
  apprentice_contract_start DATE,
  apprentice_contract_end DATE,
  tutor_contact_id UUID REFERENCES contacts(id),   -- Maitre d'apprentissage
  -- Metadata
  france_travail_id TEXT,                          -- Identifiant France Travail
  cpf_holder      BOOLEAN DEFAULT FALSE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== INSCRIPTIONS =====================

CREATE TABLE enrollments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  session_id      UUID NOT NULL REFERENCES sessions(id),
  beneficiary_id  UUID NOT NULL REFERENCES beneficiaries(id),
  company_id      UUID REFERENCES companies(id),
  status          inscription_status DEFAULT 'pre_inscrit',
  enrollment_date TIMESTAMPTZ DEFAULT now(),
  -- Positionnement (ind. 8)
  positioning_done BOOLEAN DEFAULT FALSE,
  positioning_date DATE,
  positioning_result JSONB,                        -- Resultats test positionnement
  positioning_notes TEXT,
  -- Contractuel
  convention_signed BOOLEAN DEFAULT FALSE,
  convention_date DATE,
  contract_type   TEXT,                            -- convention (B2B) ou contrat (B2C)
  retraction_deadline DATE,                        -- J+10 pour B2C
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

-- ===================== EMARGEMENT (ind. 12) =====================

CREATE TABLE attendances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id   UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  session_slot_id UUID NOT NULL REFERENCES session_slots(id) ON DELETE CASCADE,
  is_present      BOOLEAN,
  signed_at       TIMESTAMPTZ,                     -- Horodatage signature
  signature_data  TEXT,                            -- Signature electronique (base64 ou ref)
  absence_justified BOOLEAN,
  absence_reason  TEXT,
  signaled_to_funder BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(enrollment_id, session_slot_id)
);

-- ===================== ADAPTATIONS INDIVIDUELLES (ind. 10) =====================

CREATE TABLE individual_adaptations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id   UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  adaptation_type TEXT NOT NULL,                    -- contenu, duree, rythme, materiel, handicap
  description     TEXT NOT NULL,
  implemented_at  DATE,
  implemented_by  UUID REFERENCES profiles(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);
