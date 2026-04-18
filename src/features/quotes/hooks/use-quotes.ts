import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Quote, QuoteInsert, QuoteUpdate, QuoteLine, QuoteLineInsert } from '../types'

/* eslint-disable @typescript-eslint/no-explicit-any */
// Casts to `any` are required until migrations 016/017 are pushed and
// `src/types/supabase.ts` is regenerated via `supabase gen types`.
const from = (table: string) => (supabase as any).from(table)

/** Returns the next quote number in DE-YYYY-NNN format. */
export function useNextQuoteNumber() {
  return useQuery({
    queryKey: ['quotes', 'next-number'],
    queryFn: async () => {
      const year = new Date().getFullYear()
      const prefix = `DE-${year}-`
      const { data, error } = await from('quotes')
        .select('quote_number')
        .like('quote_number', `${prefix}%`)
        .order('quote_number', { ascending: false })
        .limit(1)
      if (error) throw error
      let next = 1
      if (data?.length) {
        const num = parseInt(data[0].quote_number.replace(prefix, ''), 10)
        if (!isNaN(num)) next = num + 1
      }
      return `${prefix}${String(next).padStart(3, '0')}`
    },
  })
}

export function useQuotes() {
  return useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const { data, error } = await from('quotes')
        .select('*, companies(name)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as (Quote & { companies: { name: string } | null })[]
    },
  })
}

export function useQuote(id: string | undefined) {
  return useQuery({
    queryKey: ['quotes', id],
    queryFn: async () => {
      const { data, error } = await from('quotes')
        .select('*, companies(id, name, siret), contacts(id, first_name, last_name, email)')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as Quote & {
        companies: { id: string; name: string; siret: string | null } | null
        contacts: { id: string; first_name: string; last_name: string; email: string | null } | null
      }
    },
    enabled: !!id,
  })
}

export function useQuoteLines(quoteId: string | undefined) {
  return useQuery({
    queryKey: ['quote-lines', quoteId],
    queryFn: async () => {
      const { data, error } = await from('quote_lines')
        .select('*')
        .eq('quote_id', quoteId!)
        .order('line_order')
      if (error) throw error
      return data as QuoteLine[]
    },
    enabled: !!quoteId,
  })
}

export function useCreateQuote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (quote: QuoteInsert) => {
      const { data, error } = await from('quotes')
        .insert(quote)
        .select()
        .single()
      if (error) throw error
      return data as Quote
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
    },
  })
}

export function useUpdateQuote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: QuoteUpdate & { id: string }) => {
      const { data, error } = await from('quotes')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Quote
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      queryClient.setQueryData(['quotes', data.id], data)
    },
  })
}

export function useDeleteQuote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await from('quotes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
    },
  })
}

export function useCreateQuoteLine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (line: QuoteLineInsert) => {
      const { data, error } = await from('quote_lines')
        .insert(line)
        .select()
        .single()
      if (error) throw error
      return data as QuoteLine
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quote-lines', data.quote_id] })
    },
  })
}

export function useDeleteQuoteLine(quoteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await from('quote_lines').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-lines', quoteId] })
    },
  })
}
