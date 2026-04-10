import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Session } from '@/lib/types/database'

interface SessionWithRelations extends Session {
  formations: { title: string; duration_hours: number; objectives: string[] | null } | null
  trainers: { first_name: string; last_name: string; email: string } | null
  locations: { name: string; address: Record<string, unknown> | null; capacity: number | null } | null
}

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          formations:formation_id (title),
          trainers:trainer_id (first_name, last_name),
          locations:location_id (name)
        `)
        .order('start_date', { ascending: false })
      if (error) throw error
      return data as unknown as SessionWithRelations[]
    },
  })
}

export function useSession(id: string | undefined) {
  return useQuery({
    queryKey: ['sessions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          formations:formation_id (title, duration_hours, objectives),
          trainers:trainer_id (first_name, last_name, email),
          locations:location_id (name, address, capacity)
        `)
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as unknown as SessionWithRelations
    },
    enabled: !!id,
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (session: Partial<Session> & Pick<Session, 'organization_id' | 'formation_id' | 'start_date' | 'end_date'>) => {
      const { data, error } = await supabase
        .from('sessions')
        .insert(session as never)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Session
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

export function useUpdateSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Session> & { id: string }) => {
      const { data, error } = await supabase
        .from('sessions')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Session
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.id] })
    },
  })
}
