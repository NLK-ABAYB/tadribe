import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert } from '@/types/supabase'

type Certificate = Tables<'certificates'>

export interface CertificateWithRelations extends Certificate {
  enrollments: {
    beneficiary_id: string
    session_id: string
    beneficiaries: { first_name: string; last_name: string } | null
    sessions: {
      code: string | null
      start_date: string
      end_date: string
      formations: { title: string; duration_hours: number | null } | null
    } | null
  } | null
}

export function useCertificates(sessionId?: string) {
  return useQuery({
    queryKey: ['certificates', { sessionId }],
    queryFn: async () => {
      let query = supabase
        .from('certificates')
        .select(`
          *,
          enrollments:enrollment_id (
            beneficiary_id, session_id,
            beneficiaries:beneficiary_id (first_name, last_name),
            sessions:session_id (code, start_date, end_date, formations:formation_id (title, duration_hours))
          )
        `)
        .order('issued_date', { ascending: false })
      if (sessionId) {
        query = query.eq('enrollments.session_id', sessionId)
      }
      const { data, error } = await query
      if (error) throw error
      return data as unknown as CertificateWithRelations[]
    },
  })
}

export function useCertificate(id: string | undefined) {
  return useQuery({
    queryKey: ['certificates', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          enrollments:enrollment_id (
            beneficiary_id, session_id,
            beneficiaries:beneficiary_id (first_name, last_name),
            sessions:session_id (code, start_date, end_date, formations:formation_id (title, duration_hours))
          )
        `)
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as unknown as CertificateWithRelations
    },
    enabled: !!id,
  })
}

export function useCreateCertificate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (certificate: TablesInsert<'certificates'>) => {
      const { data, error } = await supabase
        .from('certificates')
        .insert(certificate)
        .select()
        .single()
      if (error) throw error
      return data as Certificate
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] })
    },
  })
}
