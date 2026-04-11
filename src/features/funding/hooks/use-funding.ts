import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

type FundingDossier = Tables<'funding_dossiers'>

export interface FundingDossierWithRelations extends FundingDossier {
  beneficiaries: { first_name: string; last_name: string } | null
  companies: { name: string } | null
  enrollments: {
    sessions: {
      code: string | null
      formations: { title: string } | null
    } | null
  } | null
}

export function useFundingDossiers() {
  return useQuery({
    queryKey: ['funding-dossiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('funding_dossiers')
        .select(`
          *,
          beneficiaries:beneficiary_id (first_name, last_name),
          companies:company_id (name),
          enrollments:enrollment_id (
            sessions:session_id (code, formations:formation_id (title))
          )
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as FundingDossierWithRelations[]
    },
  })
}

export function useFundingDossier(id: string | undefined) {
  return useQuery({
    queryKey: ['funding-dossiers', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('funding_dossiers')
        .select(`
          *,
          beneficiaries:beneficiary_id (first_name, last_name),
          companies:company_id (name),
          enrollments:enrollment_id (
            sessions:session_id (code, formations:formation_id (title))
          )
        `)
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as unknown as FundingDossierWithRelations
    },
    enabled: !!id,
  })
}

export function useCreateFundingDossier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dossier: TablesInsert<'funding_dossiers'>) => {
      const { data, error } = await supabase
        .from('funding_dossiers')
        .insert(dossier)
        .select()
        .single()
      if (error) throw error
      return data as FundingDossier
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funding-dossiers'] })
    },
  })
}

export function useUpdateFundingDossier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'funding_dossiers'> & { id: string }) => {
      const { data, error } = await supabase
        .from('funding_dossiers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as FundingDossier
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['funding-dossiers'] })
      queryClient.invalidateQueries({ queryKey: ['funding-dossiers', variables.id] })
    },
  })
}
