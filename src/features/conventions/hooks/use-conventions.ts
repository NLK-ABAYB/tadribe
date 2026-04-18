import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Convention, ConventionInsert, ConventionUpdate } from '../types'

/* eslint-disable @typescript-eslint/no-explicit-any */
const from = (table: string) => (supabase as any).from(table)

export function useNextConventionRef() {
  return useQuery({
    queryKey: ['conventions', 'next-ref'],
    queryFn: async () => {
      const year = new Date().getFullYear()
      const prefix = `CONV-${year}-`
      const { data, error } = await from('conventions')
        .select('reference')
        .like('reference', `${prefix}%`)
        .order('reference', { ascending: false })
        .limit(1)
      if (error) throw error
      let next = 1
      if (data?.length) {
        const num = parseInt(data[0].reference.replace(prefix, ''), 10)
        if (!isNaN(num)) next = num + 1
      }
      return `${prefix}${String(next).padStart(3, '0')}`
    },
  })
}

export function useConventions() {
  return useQuery({
    queryKey: ['conventions'],
    queryFn: async () => {
      const { data, error } = await from('conventions')
        .select('*, companies(name), sessions(code, start_date, end_date, formations(title))')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as (Convention & {
        companies: { name: string } | null
        sessions: {
          code: string | null
          start_date: string
          end_date: string
          formations: { title: string } | null
        } | null
      })[]
    },
  })
}

export function useConvention(id: string | undefined) {
  return useQuery({
    queryKey: ['conventions', id],
    queryFn: async () => {
      const { data, error } = await from('conventions')
        .select('*, companies(id, name, siret), sessions(id, code, start_date, end_date, formations(title, objectives, duration_hours))')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as Convention & {
        companies: { id: string; name: string; siret: string | null } | null
        sessions: {
          id: string
          code: string | null
          start_date: string
          end_date: string
          formations: {
            title: string
            objectives: string[] | null
            duration_hours: number | null
          } | null
        } | null
      }
    },
    enabled: !!id,
  })
}

export function useCreateConvention() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ConventionInsert) => {
      const { data, error } = await from('conventions')
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      return data as Convention
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conventions'] })
    },
  })
}

export function useUpdateConvention() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: ConventionUpdate & { id: string }) => {
      const { data, error } = await from('conventions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Convention
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conventions'] })
      queryClient.setQueryData(['conventions', data.id], data)
    },
  })
}
