import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface DashboardStats {
  companies: { total: number; active: number }
  sessions: { total: number; enCours: number; planifiees: number; terminees: number }
  enrollments: { total: number; enFormation: number; termines: number }
  invoices: { total: number; enAttente: number; montantDu: number; montantPaye: number }
  formations: { total: number; active: number }
  trainers: { total: number }
  beneficiaries: { total: number }
  funding: { totalRequested: number; totalGranted: number; enInstruction: number }
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [
        companiesRes,
        sessionsRes,
        enrollmentsRes,
        invoicesRes,
        formationsRes,
        trainersRes,
        beneficiariesRes,
        fundingRes,
      ] = await Promise.all([
        supabase.from('companies').select('id, is_active'),
        supabase.from('sessions').select('id, status'),
        supabase.from('enrollments').select('id, status'),
        supabase.from('invoices').select('id, status, total_ttc, paid_amount'),
        supabase.from('formations').select('id, is_active'),
        supabase.from('trainers').select('id'),
        supabase.from('beneficiaries').select('id'),
        supabase.from('funding_dossiers').select('id, status, amount_requested, amount_granted'),
      ])

      const companies = (companiesRes.data ?? []) as unknown as { id: string; is_active: boolean }[]
      const sessions = (sessionsRes.data ?? []) as unknown as { id: string; status: string }[]
      const enrollments = (enrollmentsRes.data ?? []) as unknown as { id: string; status: string }[]
      const invoices = (invoicesRes.data ?? []) as unknown as { id: string; status: string; total_ttc: number | null; paid_amount: number | null }[]
      const formations = (formationsRes.data ?? []) as unknown as { id: string; is_active: boolean }[]
      const trainers = (trainersRes.data ?? []) as unknown as { id: string }[]
      const beneficiaries = (beneficiariesRes.data ?? []) as unknown as { id: string }[]
      const funding = (fundingRes.data ?? []) as unknown as { id: string; status: string; amount_requested: number | null; amount_granted: number | null }[]

      const unpaidStatuses = ['emise', 'envoyee', 'en_retard']
      const unpaidInvoices = invoices.filter((i) => unpaidStatuses.includes(i.status))

      return {
        companies: {
          total: companies.length,
          active: companies.filter((c) => c.is_active).length,
        },
        sessions: {
          total: sessions.length,
          enCours: sessions.filter((s) => s.status === 'en_cours').length,
          planifiees: sessions.filter((s) => s.status === 'planifiee' || s.status === 'confirmee').length,
          terminees: sessions.filter((s) => s.status === 'terminee').length,
        },
        enrollments: {
          total: enrollments.length,
          enFormation: enrollments.filter((e) => e.status === 'en_formation' || e.status === 'confirme').length,
          termines: enrollments.filter((e) => e.status === 'termine').length,
        },
        invoices: {
          total: invoices.length,
          enAttente: unpaidInvoices.length,
          montantDu: unpaidInvoices.reduce((sum, i) => sum + ((i.total_ttc ?? 0) - (i.paid_amount ?? 0)), 0),
          montantPaye: invoices.reduce((sum, i) => sum + (i.paid_amount ?? 0), 0),
        },
        formations: {
          total: formations.length,
          active: formations.filter((f) => f.is_active).length,
        },
        trainers: { total: trainers.length },
        beneficiaries: { total: beneficiaries.length },
        funding: {
          totalRequested: funding.reduce((sum, f) => sum + (f.amount_requested ?? 0), 0),
          totalGranted: funding.reduce((sum, f) => sum + (f.amount_granted ?? 0), 0),
          enInstruction: funding.filter((f) => f.status === 'en_instruction' || f.status === 'depose').length,
        },
      }
    },
    staleTime: 30_000, // Cache 30 seconds
  })
}
