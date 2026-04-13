import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

export type Invoice = Tables<'invoices'>
export type InvoiceLine = Tables<'invoice_lines'>

/** Returns the next invoice number in FA-YYYY-NNN format. */
export function useNextInvoiceNumber() {
  return useQuery({
    queryKey: ['invoices', 'next-number'],
    queryFn: async () => {
      const year = new Date().getFullYear()
      const prefix = `FA-${year}-`
      const { data, error } = await supabase
        .from('invoices')
        .select('invoice_number')
        .like('invoice_number', `${prefix}%`)
        .order('invoice_number', { ascending: false })
        .limit(1)
      if (error) throw error
      let next = 1
      if (data?.length) {
        const last = data[0].invoice_number
        const num = parseInt(last.replace(prefix, ''), 10)
        if (!isNaN(num)) next = num + 1
      }
      return `${prefix}${String(next).padStart(3, '0')}`
    },
  })
}

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
