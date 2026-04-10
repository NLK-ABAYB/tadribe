import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Company } from '@/lib/types/database'

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name')
      if (error) throw error
      return data as unknown as Company[]
    },
  })
}

export function useCompany(id: string | undefined) {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as unknown as Company
    },
    enabled: !!id,
  })
}

export function useCreateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (company: Partial<Company> & { name: string; organization_id: string }) => {
      const { data, error } = await supabase
        .from('companies')
        .insert(company as never)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Company
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}

export function useUpdateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Company> & { id: string }) => {
      const { data, error } = await supabase
        .from('companies')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Company
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.setQueryData(['companies', data.id], data)
    },
  })
}

export function useDeleteCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('companies').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}
