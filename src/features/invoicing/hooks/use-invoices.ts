import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Invoice {
  id: string
  organization_id: string
  invoice_number: string
  status: string
  invoice_type: string
  company_id: string | null
  beneficiary_id: string | null
  funding_dossier_id: string | null
  recipient_name: string
  recipient_address: Record<string, unknown> | null
  session_id: string | null
  total_ht: number
  tva_rate: number
  tva_amount: number
  total_ttc: number
  amount_paid: number
  nda_mention: string | null
  tva_mention: string | null
  issue_date: string
  due_date: string
  payment_date: string | null
  notes: string | null
  pdf_url: string | null
  created_at: string
  updated_at: string
}

export interface InvoiceLine {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price_ht: number
  total_ht: number
  formation_id: string | null
  line_order: number
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
      return data as unknown as Invoice[]
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
      return data as unknown as Invoice
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
      return data as unknown as InvoiceLine[]
    },
    enabled: !!invoiceId,
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (invoice: Partial<Invoice> & { organization_id: string; invoice_number: string; recipient_name: string; total_ht: number; total_ttc: number; issue_date: string; due_date: string }) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert(invoice as never)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Invoice
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Invoice> & { id: string }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Invoice
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.setQueryData(['invoices', data.id], data)
    },
  })
}
