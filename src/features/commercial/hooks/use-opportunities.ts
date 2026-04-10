import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Opportunity } from '@/lib/types/database'

export function useOpportunities() {
  return useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as Opportunity[]
    },
  })
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (opp: Partial<Opportunity> & { organization_id: string; title: string }) => {
      const { data, error } = await supabase
        .from('opportunities')
        .insert(opp as never)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Opportunity
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] })
    },
  })
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Opportunity> & { id: string }) => {
      const { data, error } = await supabase
        .from('opportunities')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Opportunity
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] })
    },
  })
}
