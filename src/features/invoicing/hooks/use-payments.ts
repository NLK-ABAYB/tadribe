import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert } from '@/types/supabase'

type Payment = Tables<'payments'>

export function usePayments(invoiceId: string | undefined) {
  return useQuery({
    queryKey: ['payments', invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('invoice_id', invoiceId!)
        .order('payment_date', { ascending: false })
      if (error) throw error
      return data as Payment[]
    },
    enabled: !!invoiceId,
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payment: TablesInsert<'payments'>) => {
      const { data, error } = await supabase
        .from('payments')
        .insert(payment)
        .select()
        .single()
      if (error) throw error
      return data as Payment
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments', variables.invoice_id] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}
