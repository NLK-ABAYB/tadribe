import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Beneficiary } from '@/lib/types/database'

export function useBeneficiaries() {
  return useQuery({
    queryKey: ['beneficiaries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select(`
          *,
          companies:company_id (name)
        `)
        .order('last_name')
      if (error) throw error
      return data as unknown as (Beneficiary & { companies: { name: string } | null })[]
    },
  })
}

export function useBeneficiary(id: string | undefined) {
  return useQuery({
    queryKey: ['beneficiaries', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select(`
          *,
          companies:company_id (name)
        `)
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as unknown as Beneficiary & { companies: { name: string } | null }
    },
    enabled: !!id,
  })
}

export function useCreateBeneficiary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (beneficiary: Partial<Beneficiary> & { organization_id: string; first_name: string; last_name: string }) => {
      const { data, error } = await supabase
        .from('beneficiaries')
        .insert(beneficiary as never)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Beneficiary
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] })
    },
  })
}

export function useUpdateBeneficiary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Beneficiary> & { id: string }) => {
      const { data, error } = await supabase
        .from('beneficiaries')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Beneficiary
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] })
      queryClient.setQueryData(['beneficiaries', data.id], data)
    },
  })
}
