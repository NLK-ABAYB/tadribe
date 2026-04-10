-- ============================================================
-- SCHEMA SUPABASE -- Partie 2 : Commercial, Entreprises, Contacts
-- ============================================================

-- ===================== ENTREPRISES CLIENTES =====================

CREATE TABLE companies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name            TEXT NOT NULL,
  siret           VARCHAR(14),
  siren           VARCHAR(9),
  naf_code        VARCHAR(6),                     -- Code APE/NAF
  idcc            VARCHAR(4),                     -- Convention collective
  opco_id         UUID REFERENCES opcos(id),      -- OPCO de rattachement
  workforce_size  INTEGER,                        -- Effectif salaries
  address         JSONB,
  phone           VARCHAR(20),
  email           TEXT,
  website         TEXT,
  notes           TEXT,
  is_client       BOOLEAN DEFAULT FALSE,
  is_prospect     BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== REFERENTIEL OPCO =====================

CREATE TABLE opcos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,                  -- Ex: ATLAS, AKTO, OPCO EP...
  code            VARCHAR(20) UNIQUE NOT NULL,
  website         TEXT,
  portal_url      TEXT,                           -- URL plateforme depot dossiers
  contact_email   TEXT,
  contact_phone   VARCHAR(20),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Donnees de reference : les 11 OPCO
INSERT INTO opcos (name, code) VALUES
  ('AFDAS', 'AFDAS'),
  ('ATLAS', 'ATLAS'),
  ('Constructys', 'CONSTRUCTYS'),
  ('AKTO', 'AKTO'),
  ('OCAPIAT', 'OCAPIAT'),
  ('OPCO 2i', 'OPCO2I'),
  ('OPCO Mobilites', 'MOBILITES'),
  ('OPCO EP', 'OPCOEP'),
  ('OPCO Sante', 'SANTE'),
  ('Uniformation', 'UNIFORMATION'),
  ('OPCO Commerce', 'COMMERCE');

-- ===================== CONTACTS =====================

CREATE TABLE contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  company_id      UUID REFERENCES companies(id),
  user_id         UUID REFERENCES profiles(id),   -- Lien si le contact a un compte
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT,
  phone           VARCHAR(20),
  job_title       TEXT,                           -- DRH, Responsable formation, etc.
  contact_type    TEXT,                           -- prospect, client, prescripteur, tuteur
  notes           TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== PIPELINE COMMERCIAL =====================

CREATE TABLE opportunities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  company_id      UUID REFERENCES companies(id),
  contact_id      UUID REFERENCES contacts(id),
  title           TEXT NOT NULL,
  description     TEXT,
  stage           pipeline_stage DEFAULT 'prospect',
  probability     INTEGER CHECK (probability BETWEEN 0 AND 100),
  amount          NUMERIC(12,2),                  -- Montant estime
  expected_close  DATE,
  assigned_to     UUID REFERENCES profiles(id),   -- Commercial en charge
  lost_reason     TEXT,
  source          TEXT,                           -- Salon, web, prescripteur, etc.
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ===================== INTERACTIONS =====================

CREATE TABLE interactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  contact_id      UUID REFERENCES contacts(id),
  company_id      UUID REFERENCES companies(id),
  opportunity_id  UUID REFERENCES opportunities(id),
  interaction_type TEXT NOT NULL,                  -- appel, email, rdv, reunion, note
  subject         TEXT,
  content         TEXT,
  interaction_date TIMESTAMPTZ DEFAULT now(),
  performed_by    UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);
