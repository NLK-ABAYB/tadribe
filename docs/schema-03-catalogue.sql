-- ============================================================
-- SCHEMA SUPABASE -- Partie 3 : Catalogue, Formations, Certifications
-- ============================================================

-- ===================== CERTIFICATIONS RNCP/RS =====================

CREATE TABLE certifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL,                   -- Ex: RNCP12345, RS6789
  registry        TEXT NOT NULL CHECK (registry IN ('rncp', 'rs')),
  title           TEXT NOT NULL,
  level           INTEGER,                         -- Niveau 1 a 8 (cadre europeen)
  certifier       TEXT,                            -- Organisme certificateur
  valid_until     DATE,
  blocks          JSONB DEFAULT '[]',              -- Blocs de competences
  equivalences    TEXT,
  pathways        TEXT,                            -- Passerelles
  outcomes        TEXT,                            -- Debouches
  france_competences_url TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== FORMATIONS (catalogue) =====================

CREATE TABLE formations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  code            TEXT,                            -- Code interne de la formation
  title           TEXT NOT NULL,
  category        action_category NOT NULL DEFAULT 'af',
  certification_id UUID REFERENCES certifications(id),

  -- Indicateur 1 : informations obligatoires
  objectives      TEXT[] DEFAULT '{}',             -- Objectifs operationnels (ind.5)
  prerequisites   TEXT,
  target_audience TEXT,                            -- Public vise
  duration_hours  NUMERIC(8,2),
  duration_days   NUMERIC(6,1),
  modality        TEXT,                            -- presentiel, distanciel, mixte
  teaching_methods TEXT,                           -- Methodes pedagogiques
  assessment_methods TEXT,                         -- Modalites d'evaluation
  accessibility   TEXT,                            -- Accessibilite handicap
  price_ht        NUMERIC(12,2),
  price_ttc       NUMERIC(12,2),
  price_per_hour  NUMERIC(8,2),
  access_delay    TEXT,                            -- Delais d'acces (ex: "15 jours")

  -- Indicateur 2 : indicateurs de resultats
  satisfaction_rate NUMERIC(4,1),                  -- Taux de satisfaction %
  success_rate    NUMERIC(4,1),                    -- Taux de reussite %
  completion_rate NUMERIC(4,1),                    -- Taux de completion %
  insertion_rate  NUMERIC(4,1),                    -- Taux d'insertion %
  results_updated_at DATE,

  -- Indicateur 7 : correspondance certification
  certification_mapping JSONB,                     -- Matrice programme/referentiel

  -- Programme detaille (ind. 6)
  program_content JSONB DEFAULT '[]',              -- [{module, duration, content}]
  pedagogical_scenario TEXT,

  -- Metadata
  is_active       BOOLEAN DEFAULT TRUE,
  is_cpf_eligible BOOLEAN DEFAULT FALSE,
  mcf_id          TEXT,                            -- ID Mon Compte Formation
  version         INTEGER DEFAULT 1,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== VERSIONS DE PROGRAMME (ind. 6) =====================

CREATE TABLE formation_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id    UUID NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  version_number  INTEGER NOT NULL,
  program_content JSONB NOT NULL,
  objectives      TEXT[],
  change_reason   TEXT,
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== RESSOURCES PEDAGOGIQUES (ind. 19) =====================

CREATE TABLE pedagogical_resources (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  formation_id    UUID REFERENCES formations(id),
  title           TEXT NOT NULL,
  description     TEXT,
  resource_type   TEXT,                            -- support_cours, video, exercice, quiz
  file_url        TEXT,
  is_public       BOOLEAN DEFAULT FALSE,           -- Accessible aux stagiaires
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
