import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

type Opportunity = Tables<'opportunities'>

export function useOpportunities() {
  return useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Opportunity[]
    },
  })
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (opp: TablesInsert<'opportunities'>) => {
      const { data, error } = await supabase
        .from('opportunities')
        .insert(opp)
        .select()
        .single()
      if (error) throw error
      return data as Opportunity
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] })
    },
  })
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'opportunities'> & { id: string }) => {
      const { data, error } = await supabase
        .from('opportunities')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Opportunity
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] })
    },
  })
}
