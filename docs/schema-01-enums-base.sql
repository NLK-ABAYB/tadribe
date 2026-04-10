-- ============================================================
-- SCHEMA SUPABASE -- CRM Organismes de Formation
-- Partie 1 : Types ENUM et tables fondamentales
-- ============================================================

-- ===================== ENUMS =====================

CREATE TYPE user_role AS ENUM (
  'admin_of',        -- Administrateur de l'organisme
  'gestionnaire',    -- Gestionnaire administratif
  'commercial',      -- Responsable commercial
  'formateur',       -- Formateur interne
  'apprenant',       -- Stagiaire en formation continue
  'apprenti',        -- Apprenti (CFA)
  'entreprise',      -- Contact entreprise cliente
  'financeur'        -- Contact financeur (OPCO, etc.)
);

CREATE TYPE pipeline_stage AS ENUM (
  'prospect', 'qualification', 'proposition', 'negociation',
  'gagne', 'perdu', 'abandonne'
);

CREATE TYPE session_status AS ENUM (
  'planifiee', 'confirmee', 'en_cours', 'terminee', 'annulee'
);

CREATE TYPE inscription_status AS ENUM (
  'pre_inscrit', 'en_attente_financement', 'confirme',
  'en_formation', 'abandonne', 'termine', 'annule'
);

CREATE TYPE funding_type AS ENUM (
  'cpf', 'opco_plan', 'opco_apprentissage', 'opco_pro',
  'france_travail_aif', 'france_travail_poei', 'france_travail_poec',
  'france_travail_afc', 'france_travail_afpr',
  'agefiph', 'fiphfp', 'fne', 'ptp', 'region',
  'plan_entreprise', 'autofinancement', 'mixte'
);

CREATE TYPE funding_status AS ENUM (
  'brouillon', 'depose', 'en_instruction', 'accorde',
  'refuse', 'annule', 'realise', 'paye'
);

CREATE TYPE invoice_status AS ENUM (
  'brouillon', 'emise', 'envoyee', 'payee_partiellement',
  'payee', 'en_retard', 'contentieux', 'avoir'
);

CREATE TYPE complaint_status AS ENUM (
  'ouvert', 'en_cours', 'resolu', 'clos'
);

CREATE TYPE complaint_severity AS ENUM (
  'faible', 'moyenne', 'haute', 'critique'
);

CREATE TYPE document_type AS ENUM (
  'convention', 'contrat_formation', 'devis', 'programme',
  'cgv', 'reglement_interieur', 'livret_accueil',
  'emargement', 'attestation_fin', 'certificat_realisation',
  'facture', 'avoir', 'cv_formateur', 'diplome',
  'accord_prise_en_charge', 'bpf', 'autre'
);

CREATE TYPE eval_type AS ENUM (
  'positionnement', 'formative', 'sommative',
  'satisfaction_chaud', 'satisfaction_froid',
  'insertion_3m', 'insertion_6m', 'insertion_12m'
);

CREATE TYPE action_category AS ENUM (
  'af',   -- Action de formation
  'bc',   -- Bilan de competences
  'vae',  -- VAE
  'cfa'   -- Apprentissage
);

CREATE TYPE improvement_status AS ENUM (
  'planifie', 'en_cours', 'realise', 'abandonne'
);

CREATE TYPE watch_category AS ENUM (
  'legale', 'metiers', 'pedagogique', 'technologique'
);

-- ===================== ORGANISATIONS =====================

CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  siret           VARCHAR(14) UNIQUE NOT NULL,
  nda             VARCHAR(11),                    -- Numero Declaration Activite
  nda_valid_until DATE,
  qualiopi        BOOLEAN DEFAULT FALSE,
  qualiopi_valid_until DATE,
  qualiopi_categories action_category[] DEFAULT '{}',
  address         JSONB,                          -- {street, city, zip, country}
  phone           VARCHAR(20),
  email           TEXT,
  website         TEXT,
  tva_exempt      BOOLEAN DEFAULT FALSE,          -- Exoneration TVA art 261-4-4
  tva_number      VARCHAR(20),
  legal_form      TEXT,                           -- SARL, SAS, Association, etc.
  logo_url        TEXT,
  settings        JSONB DEFAULT '{}',             -- Parametres de l'OF
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== UTILISATEURS =====================

CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role            user_role NOT NULL,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           VARCHAR(20),
  job_title       TEXT,
  avatar_url      TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  is_referent_handicap BOOLEAN DEFAULT FALSE,     -- Indicateur 26
  is_referent_mobilite BOOLEAN DEFAULT FALSE,     -- Indicateur 20 CFA
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
