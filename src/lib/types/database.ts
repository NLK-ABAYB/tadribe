// Hand-written domain types for the Tadribe CRM.
//
// The canonical `Database` type (for `createClient<Database>`) is now
// generated from Supabase into `src/types/supabase.ts` and re-exported below.
//
// NOTE: at the time of this writing, the remote Supabase project
// (mcyxxgjnkrmbbqshsykg) did not yet have any tables in its `public` schema,
// so the generated type is structurally empty (Tables: [_ in never]: never).
// Until the migrations under `supabase/migrations/` are applied remotely
// (`npx supabase db push`), these hand-written row types remain the source of
// truth for application code — every hook and page imports them from here.
//
// After `db push` + re-running `supabase gen types typescript`, the generated
// file will expose rich table types and these manual shapes can progressively
// be replaced with `Tables<'companies'>`, `TablesInsert<'companies'>`, etc.

export type { Database } from '@/types/supabase'

export type UserRole =
  | 'admin_of'
  | 'gestionnaire'
  | 'commercial'
  | 'formateur'
  | 'apprenant'
  | 'apprenti'
  | 'entreprise'
  | 'financeur'

export type PipelineStage =
  | 'prospect' | 'qualification' | 'proposition' | 'negociation'
  | 'gagne' | 'perdu' | 'abandonne'

export type SessionStatus =
  | 'planifiee' | 'confirmee' | 'en_cours' | 'terminee' | 'annulee'

export type InscriptionStatus =
  | 'pre_inscrit' | 'en_attente_financement' | 'confirme'
  | 'en_formation' | 'abandonne' | 'termine' | 'annule'

export type FundingType =
  | 'cpf' | 'opco_plan' | 'opco_apprentissage' | 'opco_pro'
  | 'france_travail_aif' | 'france_travail_poei' | 'france_travail_poec'
  | 'france_travail_afc' | 'france_travail_afpr'
  | 'agefiph' | 'fiphfp' | 'fne' | 'ptp' | 'region'
  | 'plan_entreprise' | 'autofinancement' | 'mixte'

export type FundingStatus =
  | 'brouillon' | 'depose' | 'en_instruction' | 'accorde'
  | 'refuse' | 'annule' | 'realise' | 'paye'

export type InvoiceStatus =
  | 'brouillon' | 'emise' | 'envoyee' | 'payee_partiellement'
  | 'payee' | 'en_retard' | 'contentieux' | 'avoir'

export type ActionCategory = 'af' | 'bc' | 'vae' | 'cfa'

export type EvalType =
  | 'positionnement' | 'formative' | 'sommative'
  | 'satisfaction_chaud' | 'satisfaction_froid'
  | 'insertion_3m' | 'insertion_6m' | 'insertion_12m'

// ---- Table row types ----

export interface Organization {
  id: string
  name: string
  siret: string
  nda: string | null
  nda_valid_until: string | null
  qualiopi: boolean
  qualiopi_valid_until: string | null
  qualiopi_categories: string[]
  address: Record<string, unknown> | null
  phone: string | null
  email: string | null
  website: string | null
  tva_exempt: boolean
  tva_number: string | null
  legal_form: string | null
  logo_url: string | null
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  organization_id: string
  role: UserRole
  first_name: string
  last_name: string
  email: string
  phone: string | null
  job_title: string | null
  avatar_url: string | null
  is_active: boolean
  is_referent_handicap: boolean
  is_referent_mobilite: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  organization_id: string
  name: string
  siret: string | null
  address: Record<string, unknown> | null
  phone: string | null
  email: string | null
  website: string | null
  sector: string | null
  size_range: string | null
  opco_id: string | null
  default_funding_type: FundingType | null
  convention_collective: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  organization_id: string
  company_id: string | null
  user_id: string | null
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  mobile: string | null
  job_title: string | null
  role_in_company: string | null
  is_signatory: boolean
  is_billing_contact: boolean
  is_training_manager: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Opportunity {
  id: string
  organization_id: string
  company_id: string | null
  contact_id: string | null
  title: string
  description: string | null
  stage: PipelineStage
  amount: number | null
  probability: number | null
  expected_close_date: string | null
  formation_id: string | null
  nb_participants: number | null
  funding_type: FundingType | null
  assigned_to: string | null
  lost_reason: string | null
  won_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Interaction {
  id: string
  organization_id: string
  company_id: string | null
  contact_id: string | null
  opportunity_id: string | null
  interaction_type: string
  subject: string | null
  content: string | null
  interaction_date: string
  performed_by: string | null
  next_action: string | null
  next_action_date: string | null
  created_at: string
}

// Full Formation matching migration 004
export interface Formation {
  id: string
  organization_id: string
  code: string | null
  title: string
  category: ActionCategory
  certification_id: string | null
  // Indicateur 1
  objectives: string[]
  prerequisites: string | null
  target_audience: string | null
  duration_hours: number | null
  duration_days: number | null
  modality: string | null
  teaching_methods: string | null
  assessment_methods: string | null
  accessibility: string | null
  price_ht: number | null
  price_ttc: number | null
  price_per_hour: number | null
  access_delay: string | null
  // Indicateur 2
  satisfaction_rate: number | null
  success_rate: number | null
  completion_rate: number | null
  insertion_rate: number | null
  results_updated_at: string | null
  // Indicateur 7
  certification_mapping: Record<string, unknown> | null
  // Indicateur 6
  program_content: Record<string, unknown>[]
  pedagogical_scenario: string | null
  // Metadata
  is_active: boolean
  is_cpf_eligible: boolean
  mcf_id: string | null
  version: number
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Certification {
  id: string
  organization_id: string
  code: string
  title: string
  certifier: string | null
  registry: string | null
  level: string | null
  nsf_code: string | null
  end_date: string | null
  blocks: Record<string, unknown>[]
  is_active: boolean
  created_at: string
}

export interface Session {
  id: string
  organization_id: string
  formation_id: string
  code: string | null
  status: SessionStatus
  start_date: string
  end_date: string
  location_id: string | null
  is_remote: boolean
  remote_url: string | null
  min_participants: number
  max_participants: number | null
  trainer_id: string | null
  coordinator_id: string | null
  notes: string | null
  alternance_calendar: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface SessionSlot {
  id: string
  session_id: string
  slot_date: string
  start_time: string
  end_time: string
  period: 'matin' | 'apres_midi' | 'journee' | null
  topic: string | null
  trainer_id: string | null
  location_id: string | null
  created_at: string
}

export interface Location {
  id: string
  organization_id: string
  name: string
  address: Record<string, unknown> | null
  capacity: number | null
  is_erp: boolean
  is_accessible: boolean
  equipment: string[] | null
  notes: string | null
  is_active: boolean
  created_at: string
}

// Full Trainer matching migration 005
export interface Trainer {
  id: string
  organization_id: string
  profile_id: string | null
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  is_internal: boolean
  company_id: string | null
  specialties: string[]
  qualifications: Record<string, unknown>[]
  cv_url: string | null
  cv_updated_at: string | null
  hourly_rate: number | null
  daily_rate: number | null
  bio: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TrainerCompetency {
  id: string
  trainer_id: string
  formation_id: string
  validated: boolean
  validated_by: string | null
  validated_at: string | null
  notes: string | null
}

// Full Beneficiary matching migration 005
export interface Beneficiary {
  id: string
  organization_id: string
  profile_id: string | null
  company_id: string | null
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  birth_date: string | null
  address: Record<string, unknown> | null
  status: string | null
  job_title: string | null
  qualification_level: string | null
  // Handicap (ind. 26)
  has_disability: boolean | null
  disability_details: string | null
  disability_consent: boolean
  // Apprentissage
  is_apprentice: boolean
  apprentice_contract_start: string | null
  apprentice_contract_end: string | null
  tutor_contact_id: string | null
  // Metadata
  france_travail_id: string | null
  cpf_holder: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

// Full Enrollment matching migration 005
export interface Enrollment {
  id: string
  organization_id: string
  session_id: string
  beneficiary_id: string
  company_id: string | null
  status: InscriptionStatus
  enrollment_date: string
  // Positionnement (ind. 8)
  positioning_done: boolean
  positioning_date: string | null
  positioning_result: Record<string, unknown> | null
  positioning_notes: string | null
  // Contractuel
  convention_signed: boolean
  convention_date: string | null
  contract_type: string | null
  retraction_deadline: string | null
  // Documents transmis (ind. 9)
  convocation_sent: boolean
  convocation_date: string | null
  welcome_booklet_sent: boolean
  rules_acknowledged: boolean
  // Suivi
  completion_date: string | null
  dropout_date: string | null
  dropout_reason: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Attendance {
  id: string
  enrollment_id: string
  session_slot_id: string
  is_present: boolean | null
  signed_at: string | null
  signature_data: string | null
  absence_justified: boolean | null
  absence_reason: string | null
  signaled_to_funder: boolean
  created_at: string
}

export interface IndividualAdaptation {
  id: string
  enrollment_id: string
  adaptation_type: string
  description: string
  implemented_at: string | null
  implemented_by: string | null
  notes: string | null
  created_at: string
}

export interface FundingDossier {
  id: string
  organization_id: string
  enrollment_id: string | null
  session_id: string | null
  beneficiary_id: string | null
  company_id: string | null
  funding_type: FundingType
  status: FundingStatus
  funder_name: string | null
  opco_id: string | null
  funder_reference: string | null
  amount_requested: number | null
  amount_granted: number | null
  amount_paid: number | null
  remainder_beneficiary: number | null
  remainder_company: number | null
  is_subrogation: boolean
  submitted_at: string | null
  deadline_date: string | null
  decision_date: string | null
  payment_date: string | null
  cpf_dossier_id: string | null
  cpf_reste_charge: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Evaluation {
  id: string
  organization_id: string
  session_id: string | null
  formation_id: string | null
  eval_type: EvalType
  title: string
  description: string | null
  questions: Record<string, unknown>[]
  scheduled_date: string | null
  deadline_date: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
}

export interface EvaluationResponse {
  id: string
  evaluation_id: string
  enrollment_id: string | null
  beneficiary_id: string | null
  respondent_type: string | null
  respondent_name: string | null
  answers: Record<string, unknown>
  score: number | null
  submitted_at: string
  is_anonymous: boolean
  created_at: string
}

// Certificate matching migration 007
export interface Certificate {
  id: string
  organization_id: string
  enrollment_id: string
  certificate_type: string
  title: string
  objectives_achieved: string[]
  duration_hours: number | null
  start_date: string | null
  end_date: string | null
  certification_id: string | null
  certification_obtained: boolean | null
  blocks_obtained: Record<string, unknown>[] | null
  issued_date: string
  pdf_url: string | null
  sent_to_beneficiary: boolean
  sent_to_funder: boolean
  created_by: string | null
  created_at: string
}

// Document (GED) matching migration 006
export interface Document {
  id: string
  organization_id: string
  document_type: string
  title: string
  file_url: string
  file_size: number | null
  mime_type: string | null
  related_to_type: string | null
  related_to_id: string | null
  uploaded_by: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

