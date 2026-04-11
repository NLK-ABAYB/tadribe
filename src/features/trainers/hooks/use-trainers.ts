import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

type Trainer = Tables<'trainers'>
type TrainerCompetency = Tables<'trainer_competencies'>

export function useTrainers() {
  return useQuery({
    queryKey: ['trainers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .order('last_name')
      if (error) throw error
      return data as Trainer[]
    },
  })
}

export function useTrainer(id: string | undefined) {
  return useQuery({
    queryKey: ['trainers', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as Trainer
    },
    enabled: !!id,
  })
}

export function useTrainerCompetencies(trainerId: string | undefined) {
  return useQuery({
    queryKey: ['trainer-competencies', trainerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainer_competencies')
        .select(`
          *,
          formations:formation_id (title)
        `)
        .eq('trainer_id', trainerId!)
      if (error) throw error
      return data as unknown as (TrainerCompetency & { formations: { title: string } | null })[]
    },
    enabled: !!trainerId,
  })
}

export function useCreateTrainer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (trainer: TablesInsert<'trainers'>) => {
      const { data, error } = await supabase
        .from('trainers')
        .insert(trainer)
        .select()
        .single()
      if (error) throw error
      return data as Trainer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] })
    },
  })
}

export function useUpdateTrainer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'trainers'> & { id: string }) => {
      const { data, error } = await supabase
        .from('trainers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Trainer
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] })
      queryClient.setQueryData(['trainers', data.id], data)
    },
  })
}
