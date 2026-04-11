import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

type Contact = Tables<'contacts'>

export function useContacts(companyId?: string) {
  return useQuery({
    queryKey: ['contacts', { companyId }],
    queryFn: async () => {
      let query = supabase.from('contacts').select('*').order('last_name')
      if (companyId) {
        query = query.eq('company_id', companyId)
      }
      const { data, error } = await query
      if (error) throw error
      return data as Contact[]
    },
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (contact: TablesInsert<'contacts'>) => {
      const { data, error } = await supabase
        .from('contacts')
        .insert(contact)
        .select()
        .single()
      if (error) throw error
      return data as Contact
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'contacts'> & { id: string }) => {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Contact
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}
