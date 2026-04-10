// Placeholder types - replace with `supabase gen types typescript` output
// These manual types let us build the app before connecting to Supabase

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

export type InvoiceStatus =
  | 'brouillon' | 'emise' | 'envoyee' | 'payee_partiellement'
  | 'payee' | 'en_retard' | 'contentieux' | 'avoir'

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

export interface Formation {
  id: string
  organization_id: string
  title: string
  code: string | null
  category: string | null
  objectives: string[] | null
  target_audience: string | null
  prerequisites: string | null
  program: Record<string, unknown> | null
  duration_hours: number
  price_ht: number | null
  price_ttc: number | null
  is_active: boolean
  created_at: string
  updated_at: string
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
  created_at: string
  updated_at: string
}

export interface Trainer {
  id: string
  organization_id: string
  profile_id: string | null
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  is_internal: boolean
  specialties: string[] | null
  hourly_rate: number | null
  daily_rate: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Location {
  id: string
  organization_id: string
  name: string
  address: Record<string, unknown> | null
  capacity: number | null
  is_accessible: boolean
  is_active: boolean
  created_at: string
}

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
  is_apprentice: boolean
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: string
  organization_id: string
  session_id: string
  beneficiary_id: string
  company_id: string | null
  status: InscriptionStatus
  enrollment_date: string
  created_at: string
  updated_at: string
}

// Placeholder Database type for createClient<Database>
// Replace with `npx supabase gen types typescript` output once connected
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Database {}
