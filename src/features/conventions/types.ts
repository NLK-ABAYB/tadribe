// Manual types for conventions (migration 017 not yet regenerated).
// After `supabase gen types`, replace with Tables<'conventions'>.

export type ConventionType = 'intra' | 'inter'
export type ConventionStatus = 'draft' | 'sent' | 'signed' | 'cancelled'

export interface Convention {
  id: string
  organization_id: string
  company_id: string
  session_id: string | null
  reference: string
  type: ConventionType
  funding_type: string | null
  status: ConventionStatus
  start_date: string | null
  end_date: string | null
  amount_ht: number
  terms: string | null
  notes: string | null
  sent_at: string | null
  signed_at: string | null
  signed_by_name: string | null
  pdf_url: string | null
  created_at: string
  updated_at: string
}

export interface ConventionInsert {
  organization_id: string
  company_id: string
  session_id?: string | null
  reference: string
  type?: ConventionType
  funding_type?: string | null
  status?: ConventionStatus
  start_date?: string | null
  end_date?: string | null
  amount_ht?: number
  terms?: string | null
  notes?: string | null
}

export interface ConventionUpdate {
  company_id?: string
  session_id?: string | null
  reference?: string
  type?: ConventionType
  funding_type?: string | null
  status?: ConventionStatus
  start_date?: string | null
  end_date?: string | null
  amount_ht?: number
  terms?: string | null
  notes?: string | null
  sent_at?: string | null
  signed_at?: string | null
  signed_by_name?: string | null
}

export const CONVENTION_STATUS_LABELS: Record<ConventionStatus, string> = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  signed: 'Signée',
  cancelled: 'Annulée',
}

export const CONVENTION_TYPE_LABELS: Record<ConventionType, string> = {
  intra: 'Intra-entreprise',
  inter: 'Inter-entreprise',
}
