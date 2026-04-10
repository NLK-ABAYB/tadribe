import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Enrollment } from '@/lib/types/database'

interface EnrollmentWithRelations extends Enrollment {
  beneficiaries: { first_name: string; last_name: string; email: string | null } | null
  sessions: {
    code: string | null
    start_date: string
    end_date: string
    formations: { title: string } | null
  } | null
  companies: { name: string } | null
}

export function useEnrollments(sessionId?: string) {
  return useQuery({
    queryKey: ['enrollments', { sessionId }],
    queryFn: async () => {
      let query = supabase
        .from('enrollments')
        .select(`
          *,
          beneficiaries:beneficiary_id (first_name, last_name, email),
          sessions:session_id (code, start_date, end_date, formations:formation_id (title)),
          companies:company_id (name)
        `)
        .order('enrollment_date', { ascending: false })
      if (sessionId) {
        query = query.eq('session_id', sessionId)
      }
      const { data, error } = await query
      if (error) throw error
      return data as unknown as EnrollmentWithRelations[]
    },
  })
}

export function useEnrollment(id: string | undefined) {
  return useQuery({
    queryKey: ['enrollments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          beneficiaries:beneficiary_id (first_name, last_name, email, phone, company_id),
          sessions:session_id (
            code, start_date, end_date, status,
            formations:formation_id (title, duration_hours, objectives)
          ),
          companies:company_id (name)
        `)
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as unknown as EnrollmentWithRelations
    },
    enabled: !!id,
  })
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (enrollment: Partial<Enrollment> & {
      organization_id: string
      session_id: string
      beneficiary_id: string
    }) => {
      const { data, error } = await supabase
        .from('enrollments')
        .insert(enrollment as never)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Enrollment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
    },
  })
}

export function useUpdateEnrollment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Enrollment> & { id: string }) => {
      const { data, error } = await supabase
        .from('enrollments')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Enrollment
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['enrollments', variables.id] })
    },
  })
}
