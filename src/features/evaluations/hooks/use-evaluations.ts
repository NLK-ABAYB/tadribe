import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Evaluation, EvaluationResponse } from '@/lib/types/database'

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
    mutationFn: async (evaluation: Partial<Evaluation> & {
      organization_id: string
      eval_type: Evaluation['eval_type']
      title: string
    }) => {
      const { data, error } = await supabase
        .from('evaluations')
        .insert(evaluation as never)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Evaluation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
    },
  })
}

export function useSubmitResponse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (response: {
      evaluation_id: string
      enrollment_id?: string
      beneficiary_id?: string
      respondent_type?: string
      respondent_name?: string
      answers: Record<string, unknown>
      score?: number
    }) => {
      const { data, error } = await supabase
        .from('evaluation_responses')
        .insert(response as never)
        .select()
        .single()
      if (error) throw error
      return data as unknown as EvaluationResponse
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluation-responses'] })
    },
  })
}
