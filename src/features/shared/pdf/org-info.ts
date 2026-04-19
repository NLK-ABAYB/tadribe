import type { Tables } from '@/types/supabase'

type Organization = Tables<'organizations'>

export interface OrgSettings {
  legal_mentions?: string
  cgv?: string
  email_templates?: {
    devis?: { subject?: string; body?: string }
    convention?: { subject?: string; body?: string }
    facture?: { subject?: string; body?: string }
    certificat?: { subject?: string; body?: string }
    convocation?: { subject?: string; body?: string }
  }
}

export function readOrgSettings(raw: unknown): OrgSettings {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  return raw as OrgSettings
}

function formatAddress(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') return null
  const a = raw as Record<string, string | undefined>
  const parts = [a.street, a.postal_code ? `${a.postal_code} ${a.city ?? ''}`.trim() : a.city, a.country].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : null
}

/** Normalize an Organization row into the PDF-friendly shape. */
export function toPDFOrgInfo(org: Organization) {
  return {
    name: org.name,
    siret: org.siret,
    nda: org.nda,
    email: org.email,
    phone: org.phone,
    website: org.website,
    address: formatAddress(org.address),
    logo_url: org.logo_url,
    tva_exempt: org.tva_exempt ?? false,
  }
}
