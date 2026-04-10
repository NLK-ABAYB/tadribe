import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Formation } from '@/lib/types/database'

export function useFormations() {
  return useQuery({
    queryKey: ['formations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('formations')
        .select('*')
        .order('title')
      if (error) throw error
      return data as unknown as Formation[]
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
      return data as unknown as Formation
    },
    enabled: !!id,
  })
}

export function useCreateFormation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (formation: Partial<Formation> & { organization_id: string; title: string }) => {
      const { data, error } = await supabase
        .from('formations')
        .insert(formation as never)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Formation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] })
    },
  })
}

export function useUpdateFormation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Formation> & { id: string }) => {
      const { data, error } = await supabase
        .from('formations')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Formation
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
