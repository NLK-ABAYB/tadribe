import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert } from '@/types/supabase'

type Document = Tables<'documents'>

export function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Document[]
    },
  })
}

export function useCreateDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (doc: TablesInsert<'documents'>) => {
      const { data, error } = await supabase
        .from('documents')
        .insert(doc)
        .select()
        .single()
      if (error) throw error
      return data as Document
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}
