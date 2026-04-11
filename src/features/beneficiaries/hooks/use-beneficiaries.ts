import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

type Beneficiary = Tables<'beneficiaries'>

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
    mutationFn: async (beneficiary: TablesInsert<'beneficiaries'>) => {
      const { data, error } = await supabase
        .from('beneficiaries')
        .insert(beneficiary)
        .select()
        .single()
      if (error) throw error
      return data as Beneficiary
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] })
    },
  })
}

export function useUpdateBeneficiary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'beneficiaries'> & { id: string }) => {
      const { data, error } = await supabase
        .from('beneficiaries')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Beneficiary
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] })
      queryClient.setQueryData(['beneficiaries', data.id], data)
    },
  })
}
