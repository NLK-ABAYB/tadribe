import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables, Json } from '@/types/supabase'

type Organization = Tables<'organizations'>

export interface BootstrapOrganizationArgs {
  name: string
  siret: string
  nda?: string | null
  address?: {
    street?: string
    postal_code?: string
    city?: string
  } | null
}

/**
 * Calls the `bootstrap_organization` RPC: creates a new organization and
 * attaches the current user as `admin_of` in a single atomic transaction.
 *
 * Used by the onboarding page when a freshly-signed-up user has no
 * organization yet (profile.organization_id IS NULL).
 */
export function useBootstrapOrganization() {
  return useMutation({
    mutationFn: async (input: BootstrapOrganizationArgs): Promise<Organization> => {
      const { data, error } = await supabase.rpc('bootstrap_organization', {
        org_name: input.name,
        org_siret: input.siret,
        ...(input.nda ? { org_nda: input.nda } : {}),
        ...(input.address ? { org_address: input.address as unknown as Json } : {}),
      })
      if (error) throw error
      return data as Organization
    },
  })
}
