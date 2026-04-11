import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type Invoice = Tables<'invoices'>
export type InvoiceLine = Tables<'invoice_lines'>

export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('issue_date', { ascending: false })
      if (error) throw error
      return data as Invoice[]
    },
  })
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as Invoice
    },
    enabled: !!id,
  })
}

export function useInvoiceLines(invoiceId: string | undefined) {
  return useQuery({
    queryKey: ['invoice-lines', invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_lines')
        .select('*')
        .eq('invoice_id', invoiceId!)
        .order('line_order')
      if (error) throw error
      return data as InvoiceLine[]
    },
    enabled: !!invoiceId,
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (invoice: TablesInsert<'invoices'>) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert(invoice)
        .select()
        .single()
      if (error) throw error
      return data as Invoice
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'invoices'> & { id: string }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Invoice
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.setQueryData(['invoices', data.id], data)
    },
  })
}
