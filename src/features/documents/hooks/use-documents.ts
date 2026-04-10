import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Document } from '@/lib/types/database'

export function useDocuments(relatedToType?: string, relatedToId?: string) {
  return useQuery({
    queryKey: ['documents', { relatedToType, relatedToId }],
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })
      if (relatedToType) query = query.eq('related_to_type', relatedToType)
      if (relatedToId) query = query.eq('related_to_id', relatedToId)
      const { data, error } = await query
      if (error) throw error
      return data as unknown as Document[]
    },
  })
}

export function useCreateDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (doc: Partial<Document> & {
      organization_id: string
      document_type: string
      title: string
      file_url: string
    }) => {
      const { data, error } = await supabase
        .from('documents')
        .insert(doc as never)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Document
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}
