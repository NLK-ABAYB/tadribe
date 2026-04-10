// User roles
export const USER_ROLES = {
  admin_of: 'Administrateur',
  gestionnaire: 'Gestionnaire',
  commercial: 'Commercial',
  formateur: 'Formateur',
  apprenant: 'Apprenant',
  apprenti: 'Apprenti',
  entreprise: 'Entreprise',
  financeur: 'Financeur',
} as const

export type UserRole = keyof typeof USER_ROLES

// Staff roles (can manage data)
export const STAFF_ROLES: UserRole[] = ['admin_of', 'gestionnaire', 'commercial']

// Pipeline stages
export const PIPELINE_STAGES = {
  prospect: 'Prospect',
  qualification: 'Qualification',
  proposition: 'Proposition',
  negociation: 'Négociation',
  gagne: 'Gagné',
  perdu: 'Perdu',
  abandonne: 'Abandonné',
} as const

// Session statuses
export const SESSION_STATUSES = {
  planifiee: 'Planifiée',
  confirmee: 'Confirmée',
  en_cours: 'En cours',
  terminee: 'Terminée',
  annulee: 'Annulée',
} as const

// Enrollment statuses
export const INSCRIPTION_STATUSES = {
  pre_inscrit: 'Pré-inscrit',
  en_attente_financement: 'En attente financement',
  confirme: 'Confirmé',
  en_formation: 'En formation',
  abandonne: 'Abandonné',
  termine: 'Terminé',
  annule: 'Annulé',
} as const

// Funding types
export const FUNDING_TYPES = {
  cpf: 'CPF',
  opco_plan: 'OPCO Plan',
  opco_apprentissage: 'OPCO Apprentissage',
  opco_pro: 'OPCO Pro A',
  france_travail_aif: 'France Travail AIF',
  france_travail_poei: 'France Travail POEI',
  france_travail_poec: 'France Travail POEC',
  france_travail_afc: 'France Travail AFC',
  france_travail_afpr: 'France Travail AFPR',
  agefiph: 'AGEFIPH',
  fiphfp: 'FIPHFP',
  fne: 'FNE-Formation',
  ptp: 'PTP (ex-CIF)',
  region: 'Région',
  plan_entreprise: 'Plan entreprise',
  autofinancement: 'Autofinancement',
  mixte: 'Financement mixte',
} as const

// Invoice statuses
export const INVOICE_STATUSES = {
  brouillon: 'Brouillon',
  emise: 'Émise',
  envoyee: 'Envoyée',
  payee_partiellement: 'Payée partiellement',
  payee: 'Payée',
  en_retard: 'En retard',
  contentieux: 'Contentieux',
  avoir: 'Avoir',
} as const
