-- Migration 001: Types ENUM et fonctions helper RLS
-- Dependances : aucune

-- ===================== ENUMS =====================

CREATE TYPE public.user_role AS ENUM (
  'admin_of',
  'gestionnaire',
  'commercial',
  'formateur',
  'apprenant',
  'apprenti',
  'entreprise',
  'financeur'
);

CREATE TYPE public.pipeline_stage AS ENUM (
  'prospect', 'qualification', 'proposition', 'negociation',
  'gagne', 'perdu', 'abandonne'
);

CREATE TYPE public.session_status AS ENUM (
  'planifiee', 'confirmee', 'en_cours', 'terminee', 'annulee'
);

CREATE TYPE public.inscription_status AS ENUM (
  'pre_inscrit', 'en_attente_financement', 'confirme',
  'en_formation', 'abandonne', 'termine', 'annule'
);

CREATE TYPE public.funding_type AS ENUM (
  'cpf', 'opco_plan', 'opco_apprentissage', 'opco_pro',
  'france_travail_aif', 'france_travail_poei', 'france_travail_poec',
  'france_travail_afc', 'france_travail_afpr',
  'agefiph', 'fiphfp', 'fne', 'ptp', 'region',
  'plan_entreprise', 'autofinancement', 'mixte'
);

CREATE TYPE public.funding_status AS ENUM (
  'brouillon', 'depose', 'en_instruction', 'accorde',
  'refuse', 'annule', 'realise', 'paye'
);

CREATE TYPE public.invoice_status AS ENUM (
  'brouillon', 'emise', 'envoyee', 'payee_partiellement',
  'payee', 'en_retard', 'contentieux', 'avoir'
);

CREATE TYPE public.complaint_status AS ENUM (
  'ouvert', 'en_cours', 'resolu', 'clos'
);

CREATE TYPE public.complaint_severity AS ENUM (
  'faible', 'moyenne', 'haute', 'critique'
);

CREATE TYPE public.document_type AS ENUM (
  'convention', 'contrat_formation', 'devis', 'programme',
  'cgv', 'reglement_interieur', 'livret_accueil',
  'emargement', 'attestation_fin', 'certificat_realisation',
  'facture', 'avoir', 'cv_formateur', 'diplome',
  'accord_prise_en_charge', 'bpf', 'autre'
);

CREATE TYPE public.eval_type AS ENUM (
  'positionnement', 'formative', 'sommative',
  'satisfaction_chaud', 'satisfaction_froid',
  'insertion_3m', 'insertion_6m', 'insertion_12m'
);

CREATE TYPE public.action_category AS ENUM (
  'af', 'bc', 'vae', 'cfa'
);

CREATE TYPE public.improvement_status AS ENUM (
  'planifie', 'en_cours', 'realise', 'abandonne'
);

CREATE TYPE public.watch_category AS ENUM (
  'legale', 'metiers', 'pedagogique', 'technologique'
);

-- ===================== FONCTION updated_at =====================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
