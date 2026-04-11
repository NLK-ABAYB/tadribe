import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert } from '@/types/supabase'

type Attendance = Tables<'attendances'>
type SessionSlot = Tables<'session_slots'>

export interface AttendanceWithSlot extends Attendance {
  session_slots: {
    slot_date: string
    start_time: string
    end_time: string
    period: string | null
    topic: string | null
  } | null
}

export function useSessionSlots(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['session-slots', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_slots')
        .select('*')
        .eq('session_id', sessionId!)
        .order('slot_date')
        .order('start_time')
      if (error) throw error
      return data as SessionSlot[]
    },
    enabled: !!sessionId,
  })
}

export function useAttendances(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['attendances', { sessionId }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendances')
        .select(`
          *,
          session_slots:session_slot_id (slot_date, start_time, end_time, period, topic)
        `)
        .order('created_at')
      if (error) throw error
      // Filter by session via enrollments if needed (done client-side for simplicity)
      return data as unknown as AttendanceWithSlot[]
    },
    enabled: !!sessionId,
  })
}

export function useEnrollmentAttendances(enrollmentId: string | undefined) {
  return useQuery({
    queryKey: ['attendances', { enrollmentId }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendances')
        .select(`
          *,
          session_slots:session_slot_id (slot_date, start_time, end_time, period, topic)
        `)
        .eq('enrollment_id', enrollmentId!)
        .order('created_at')
      if (error) throw error
      return data as unknown as AttendanceWithSlot[]
    },
    enabled: !!enrollmentId,
  })
}

export function useMarkAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (attendance: TablesInsert<'attendances'>) => {
      // Upsert: if attendance exists for this enrollment+slot, update it
      const { data, error } = await supabase
        .from('attendances')
        .upsert(attendance, { onConflict: 'enrollment_id,session_slot_id' })
        .select()
        .single()
      if (error) throw error
      return data as Attendance
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] })
    },
  })
}

export function useSignAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, signature_data }: { id: string; signature_data: string }) => {
      const { data, error } = await supabase
        .from('attendances')
        .update({
          is_present: true,
          signed_at: new Date().toISOString(),
          signature_data,
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Attendance
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] })
    },
  })
}

export function useCreateSessionSlot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (slot: TablesInsert<'session_slots'>) => {
      const { data, error } = await supabase
        .from('session_slots')
        .insert(slot)
        .select()
        .single()
      if (error) throw error
      return data as SessionSlot
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-slots'] })
    },
  })
}
