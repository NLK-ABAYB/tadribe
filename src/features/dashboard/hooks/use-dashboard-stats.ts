import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface DashboardStats {
  companies: { total: number; active: number }
  sessions: { total: number; enCours: number; planifiees: number; terminees: number; cetteSemaine: number }
  enrollments: { total: number; enFormation: number; termines: number }
  invoices: { total: number; enAttente: number; montantDu: number; montantPaye: number; caMoisEnCours: number; facturesEnRetard: number }
  formations: { total: number; active: number }
  trainers: { total: number }
  beneficiaries: { total: number }
  funding: { totalRequested: number; totalGranted: number; enInstruction: number }
  alertes: string[]
}

function startOfWeek(d: Date): string {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d)
  monday.setDate(diff)
  return monday.toISOString().slice(0, 10)
}

function endOfWeek(d: Date): string {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? 0 : 7)
  const sunday = new Date(d)
  sunday.setDate(diff)
  return sunday.toISOString().slice(0, 10)
}

function startOfMonth(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function endOfMonth(d: Date): string {
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return last.toISOString().slice(0, 10)
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const now = new Date()
      const weekStart = startOfWeek(now)
      const weekEnd = endOfWeek(now)
      const monthStart = startOfMonth(now)
      const monthEnd = endOfMonth(now)

      const [
        companiesRes,
        sessionsRes,
        sessionsWeekRes,
        enrollmentsRes,
        invoicesRes,
        invoicesMonthRes,
        formationsRes,
        trainersRes,
        beneficiariesRes,
        fundingRes,
      ] = await Promise.all([
        supabase.from('companies').select('id, is_client'),
        supabase.from('sessions').select('id, status, start_date, max_participants'),
        supabase.from('sessions').select('id').gte('start_date', weekStart).lte('start_date', weekEnd),
        supabase.from('enrollments').select('id, status, session_id'),
        supabase.from('invoices').select('id, status, total_ttc, amount_paid'),
        supabase.from('invoices').select('id, amount_paid').gte('payment_date', monthStart).lte('payment_date', monthEnd),
        supabase.from('formations').select('id, is_active'),
        supabase.from('trainers').select('id'),
        supabase.from('beneficiaries').select('id'),
        supabase.from('funding_dossiers').select('id, status, amount_requested, amount_granted'),
      ])

      const companies = companiesRes.data ?? []
      const sessions = sessionsRes.data ?? []
      const sessionsWeek = sessionsWeekRes.data ?? []
      const enrollments = enrollmentsRes.data ?? []
      const invoices = invoicesRes.data ?? []
      const invoicesMonth = invoicesMonthRes.data ?? []
      const formations = formationsRes.data ?? []
      const trainers = trainersRes.data ?? []
      const beneficiaries = beneficiariesRes.data ?? []
      const funding = fundingRes.data ?? []

      const unpaidStatuses: string[] = ['emise', 'envoyee', 'en_retard']
      const unpaidInvoices = invoices.filter((i) => i.status !== null && unpaidStatuses.includes(i.status))
      const lateInvoices = invoices.filter((i) => i.status === 'en_retard')

      const caMoisEnCours = invoicesMonth.reduce((sum, i) => sum + (i.amount_paid ?? 0), 0)

      // Build alerts
      const alertes: string[] = []
      if (lateInvoices.length > 0) {
        alertes.push(`${lateInvoices.length} facture(s) en retard de paiement`)
      }
      const sessionsEnCours = sessions.filter((s) => s.status === 'en_cours')
      const sessionsWithLowFill = sessionsEnCours.filter((s) => {
        if (!s.max_participants || s.max_participants <= 0) return false
        const enrolled = enrollments.filter((e) => e.session_id === s.id && e.status !== 'annule').length
        return enrolled / s.max_participants < 0.5
      })
      if (sessionsWithLowFill.length > 0) {
        alertes.push(`${sessionsWithLowFill.length} session(s) en cours avec taux de remplissage < 50%`)
      }
      const fundingEnInstruction = funding.filter((f) => f.status === 'en_instruction' || f.status === 'depose')
      if (fundingEnInstruction.length > 0) {
        alertes.push(`${fundingEnInstruction.length} dossier(s) de financement en attente de réponse`)
      }

      return {
        companies: {
          total: companies.length,
          active: companies.filter((c) => c.is_client === true).length,
        },
        sessions: {
          total: sessions.length,
          enCours: sessionsEnCours.length,
          planifiees: sessions.filter((s) => s.status === 'planifiee' || s.status === 'confirmee').length,
          terminees: sessions.filter((s) => s.status === 'terminee').length,
          cetteSemaine: sessionsWeek.length,
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
          caMoisEnCours,
          facturesEnRetard: lateInvoices.length,
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
          enInstruction: fundingEnInstruction.length,
        },
        alertes,
      }
    },
    staleTime: 30_000,
  })
}
