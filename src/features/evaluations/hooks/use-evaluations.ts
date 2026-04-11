import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert } from '@/types/supabase'

type Evaluation = Tables<'evaluations'>
type EvaluationResponse = Tables<'evaluation_responses'>

export interface EvaluationWithRelations extends Evaluation {
  sessions: { code: string | null; formations: { title: string } | null } | null
  _count?: { responses: number }
}

export function useEvaluations() {
  return useQuery({
    queryKey: ['evaluations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evaluations')
        .select(`
          *,
          sessions:session_id (code, formations:formation_id (title))
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as EvaluationWithRelations[]
    },
  })
}

export function useEvaluation(id: string | undefined) {
  return useQuery({
    queryKey: ['evaluations', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evaluations')
        .select(`
          *,
          sessions:session_id (code, formations:formation_id (title))
        `)
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as unknown as EvaluationWithRelations
    },
    enabled: !!id,
  })
}

export function useEvaluationResponses(evaluationId: string | undefined) {
  return useQuery({
    queryKey: ['evaluation-responses', evaluationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evaluation_responses')
        .select(`
          *,
          beneficiaries:beneficiary_id (first_name, last_name)
        `)
        .eq('evaluation_id', evaluationId!)
        .order('submitted_at', { ascending: false })
      if (error) throw error
      return data as unknown as (EvaluationResponse & {
        beneficiaries: { first_name: string; last_name: string } | null
      })[]
    },
    enabled: !!evaluationId,
  })
}

export function useCreateEvaluation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (evaluation: TablesInsert<'evaluations'>) => {
      const { data, error } = await supabase
        .from('evaluations')
        .insert(evaluation)
        .select()
        .single()
      if (error) throw error
      return data as Evaluation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
    },
  })
}

export function useSubmitResponse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (response: TablesInsert<'evaluation_responses'>) => {
      const { data, error } = await supabase
        .from('evaluation_responses')
        .insert(response)
        .select()
        .single()
      if (error) throw error
      return data as EvaluationResponse
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluation-responses'] })
    },
  })
}
