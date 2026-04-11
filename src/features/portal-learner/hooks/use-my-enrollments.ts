import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/supabase'

type Enrollment = Tables<'enrollments'>
type Beneficiary = Tables<'beneficiaries'>

export interface MyEnrollmentWithRelations extends Enrollment {
  sessions: {
    code: string | null
    start_date: string
    end_date: string
    status: string
    is_remote: boolean
    formations: {
      title: string
      objectives: string[]
      duration_hours: number | null
      modality: string | null
    } | null
    trainers: { first_name: string; last_name: string } | null
  } | null
}

export function useMyBeneficiaryProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['my-beneficiary-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('profile_id', userId!)
        .single()
      if (error) throw error
      return data as Beneficiary
    },
    enabled: !!userId,
  })
}

export function useMyEnrollments(beneficiaryId: string | undefined) {
  return useQuery({
    queryKey: ['my-enrollments', beneficiaryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          sessions:session_id (
            code, start_date, end_date, status, is_remote,
            formations:formation_id (title, objectives, duration_hours, modality),
            trainers:trainer_id (first_name, last_name)
          )
        `)
        .eq('beneficiary_id', beneficiaryId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as MyEnrollmentWithRelations[]
    },
    enabled: !!beneficiaryId,
  })
}

export function useMyAttendance(enrollmentId: string | undefined) {
  return useQuery({
    queryKey: ['my-attendance', enrollmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendances')
        .select(`
          *,
          session_slots:session_slot_id (slot_date, start_time, end_time, period, topic)
        `)
        .eq('enrollment_id', enrollmentId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as (Record<string, unknown> & {
        id: string
        is_present: boolean | null
        signed_at: string | null
        session_slots: {
          slot_date: string
          start_time: string
          end_time: string
          period: string | null
          topic: string | null
        } | null
      })[]
    },
    enabled: !!enrollmentId,
  })
}

export function useMyDocuments(beneficiaryId: string | undefined) {
  return useQuery({
    queryKey: ['my-documents', beneficiaryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('beneficiary_id', beneficiaryId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Tables<'documents'>[]
    },
    enabled: !!beneficiaryId,
  })
}

export function useMyCertificates(beneficiaryId: string | undefined) {
  return useQuery({
    queryKey: ['my-certificates', beneficiaryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          enrollments:enrollment_id (
            sessions:session_id (
              formations:formation_id (title)
            )
          )
        `)
        .eq('enrollments.beneficiary_id', beneficiaryId!)
        .order('issued_date', { ascending: false })
      if (error) throw error
      return data as unknown as {
        id: string
        title: string
        certificate_type: string
        issued_date: string
        pdf_url: string | null
        enrollments: {
          sessions: { formations: { title: string } | null } | null
        } | null
      }[]
    },
    enabled: !!beneficiaryId,
  })
}

export function useMyEvaluations(beneficiaryId: string | undefined) {
  return useQuery({
    queryKey: ['my-evaluations', beneficiaryId],
    queryFn: async () => {
      // Get evaluations linked to sessions in which the beneficiary is enrolled
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('session_id')
        .eq('beneficiary_id', beneficiaryId!)
      if (enrollError) throw enrollError

      const sessionIds = (enrollments as unknown as { session_id: string }[]).map((e) => e.session_id)
      if (sessionIds.length === 0) return []

      const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .in('session_id', sessionIds)
        .eq('is_active', true)
        .order('scheduled_date', { ascending: false })
      if (error) throw error
      return data as Tables<'evaluations'>[]
    },
    enabled: !!beneficiaryId,
  })
}
