import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

type Enrollment = Tables<'enrollments'>

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

export interface EnrollmentDetailed extends Enrollment {
  beneficiaries: { first_name: string; last_name: string; email: string | null; phone: string | null; company_id: string | null } | null
  sessions: {
    code: string | null
    start_date: string
    end_date: string
    status: string | null
    is_remote: boolean | null
    remote_url: string | null
    trainers: { first_name: string; last_name: string } | null
    locations: { name: string; address: unknown } | null
    formations: {
      title: string
      duration_hours: number | null
      objectives: string[] | null
      prerequisites: string | null
      accessibility: string | null
    } | null
  } | null
  companies: { name: string } | null
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
            code, start_date, end_date, status, is_remote, remote_url,
            trainers:trainer_id (first_name, last_name),
            locations:location_id (name, address),
            formations:formation_id (title, duration_hours, objectives, prerequisites, accessibility)
          ),
          companies:company_id (name)
        `)
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as unknown as EnrollmentDetailed
    },
    enabled: !!id,
  })
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (enrollment: TablesInsert<'enrollments'>) => {
      const { data, error } = await supabase
        .from('enrollments')
        .insert(enrollment)
        .select()
        .single()
      if (error) throw error
      return data as Enrollment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
    },
  })
}

export function useUpdateEnrollment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'enrollments'> & { id: string }) => {
      const { data, error } = await supabase
        .from('enrollments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Enrollment
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['enrollments', variables.id] })
    },
  })
}
