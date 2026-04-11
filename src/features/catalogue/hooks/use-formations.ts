import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

type Formation = Tables<'formations'>

export function useFormations() {
  return useQuery({
    queryKey: ['formations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('formations')
        .select('*')
        .order('title')
      if (error) throw error
      return data as Formation[]
    },
  })
}

export function useFormation(id: string | undefined) {
  return useQuery({
    queryKey: ['formations', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('formations')
        .select('*')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as Formation
    },
    enabled: !!id,
  })
}

export function useCreateFormation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (formation: TablesInsert<'formations'>) => {
      const { data, error } = await supabase
        .from('formations')
        .insert(formation)
        .select()
        .single()
      if (error) throw error
      return data as Formation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] })
    },
  })
}

export function useUpdateFormation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'formations'> & { id: string }) => {
      const { data, error } = await supabase
        .from('formations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Formation
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['formations'] })
      queryClient.setQueryData(['formations', data.id], data)
    },
  })
}

export function useDeleteFormation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('formations').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] })
    },
  })
}
