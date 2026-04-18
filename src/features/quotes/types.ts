// Manual types for quotes/quote_lines (migrations 016 not yet regenerated).
// After `supabase gen types`, replace with Tables<'quotes'> / Tables<'quote_lines'>.

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted'

export interface Quote {
  id: string
  organization_id: string
  opportunity_id: string | null
  company_id: string
  contact_id: string | null
  quote_number: string
  status: QuoteStatus
  valid_until: string | null
  subtotal_ht: number
  tax_rate: number
  tax_amount: number
  total_ttc: number
  terms: string | null
  notes: string | null
  sent_at: string | null
  accepted_at: string | null
  rejected_at: string | null
  converted_invoice_id: string | null
  created_at: string
  updated_at: string
}

export interface QuoteInsert {
  organization_id: string
  opportunity_id?: string | null
  company_id: string
  contact_id?: string | null
  quote_number: string
  status?: QuoteStatus
  valid_until?: string | null
  subtotal_ht?: number
  tax_rate?: number
  tax_amount?: number
  total_ttc?: number
  terms?: string | null
  notes?: string | null
}

export interface QuoteUpdate {
  opportunity_id?: string | null
  company_id?: string
  contact_id?: string | null
  quote_number?: string
  status?: QuoteStatus
  valid_until?: string | null
  subtotal_ht?: number
  tax_rate?: number
  tax_amount?: number
  total_ttc?: number
  terms?: string | null
  notes?: string | null
  sent_at?: string | null
  accepted_at?: string | null
  rejected_at?: string | null
  converted_invoice_id?: string | null
}

export interface QuoteLine {
  id: string
  quote_id: string
  formation_id: string | null
  description: string
  quantity: number
  unit_price_ht: number
  total_ht: number
  line_order: number
  created_at: string
}

export interface QuoteLineInsert {
  quote_id: string
  formation_id?: string | null
  description: string
  quantity: number
  unit_price_ht: number
  line_order?: number
}

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  accepted: 'Accepté',
  rejected: 'Refusé',
  expired: 'Expiré',
  converted: 'Converti',
}
