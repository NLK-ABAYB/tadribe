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
        supabase.from('companies').select('id, is_client'),
        supabase.from('sessions').select('id, status'),
        supabase.from('enrollments').select('id, status'),
        supabase.from('invoices').select('id, status, total_ttc, amount_paid'),
        supabase.from('formations').select('id, is_active'),
        supabase.from('trainers').select('id'),
        supabase.from('beneficiaries').select('id'),
        supabase.from('funding_dossiers').select('id, status, amount_requested, amount_granted'),
      ])

      const companies = companiesRes.data ?? []
      const sessions = sessionsRes.data ?? []
      const enrollments = enrollmentsRes.data ?? []
      const invoices = invoicesRes.data ?? []
      const formations = formationsRes.data ?? []
      const trainers = trainersRes.data ?? []
      const beneficiaries = beneficiariesRes.data ?? []
      const funding = fundingRes.data ?? []

      const unpaidStatuses: string[] = ['emise', 'envoyee', 'en_retard']
      const unpaidInvoices = invoices.filter((i) => i.status !== null && unpaidStatuses.includes(i.status))

      return {
        companies: {
          total: companies.length,
          active: companies.filter((c) => c.is_client === true).length,
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
          montantDu: unpaidInvoices.reduce((sum, i) => sum + ((i.total_ttc ?? 0) - (i.amount_paid ?? 0)), 0),
          montantPaye: invoices.reduce((sum, i) => sum + (i.amount_paid ?? 0), 0),
        },
        formations: {
          total: formations.length,
          active: formations.filter((f) => f.is_active === true).length,
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
