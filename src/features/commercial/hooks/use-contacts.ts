import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Contact } from '@/lib/types/database'

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
      return data as unknown as Contact[]
    },
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (contact: Partial<Contact> & { organization_id: string; first_name: string; last_name: string }) => {
      const { data, error } = await supabase
        .from('contacts')
        .insert(contact as never)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Contact
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Contact> & { id: string }) => {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Contact
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}
