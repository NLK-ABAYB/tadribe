import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useMyCompany(userId: string | undefined) {
  return useQuery({
    queryKey: ['my-company', userId],
    queryFn: async () => {
      // Find company via contact linked to user profile
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .select('company_id')
        .eq('user_id', userId!)
        .single()
      if (contactError) throw contactError

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', (contact as unknown as { company_id: string }).company_id)
        .single()
      if (error) throw error
      return data as unknown as {
        id: string
        name: string
        siret: string | null
        address: Record<string, unknown> | null
        phone: string | null
        email: string | null
        opco_id: string | null
        convention_collective: string | null
      }
    },
    enabled: !!userId,
  })
}

export function useCompanyBeneficiaries(companyId: string | undefined) {
  return useQuery({
    queryKey: ['company-beneficiaries', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('company_id', companyId!)
        .order('last_name')
      if (error) throw error
      return data as unknown as {
        id: string
        first_name: string
        last_name: string
        email: string | null
        job_title: string | null
        is_apprentice: boolean
      }[]
    },
    enabled: !!companyId,
  })
}

export function useCompanyEnrollments(companyId: string | undefined) {
  return useQuery({
    queryKey: ['company-enrollments', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          beneficiaries:beneficiary_id (first_name, last_name),
          sessions:session_id (
            code, start_date, end_date, status,
            formations:formation_id (title, duration_hours)
          )
        `)
        .eq('company_id', companyId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as {
        id: string
        status: string
        enrollment_date: string
        beneficiaries: { first_name: string; last_name: string } | null
        sessions: {
          code: string | null
          start_date: string
          end_date: string
          status: string
          formations: { title: string; duration_hours: number | null } | null
        } | null
      }[]
    },
    enabled: !!companyId,
  })
}

export function useCompanyInvoices(companyId: string | undefined) {
  return useQuery({
    queryKey: ['company-invoices', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('company_id', companyId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as {
        id: string
        invoice_number: string | null
        status: string
        total_ht: number | null
        total_ttc: number | null
        issue_date: string | null
        due_date: string | null
        paid_amount: number | null
      }[]
    },
    enabled: !!companyId,
  })
}

export function useCompanyFunding(companyId: string | undefined) {
  return useQuery({
    queryKey: ['company-funding', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('funding_dossiers')
        .select(`
          *,
          beneficiaries:beneficiary_id (first_name, last_name)
        `)
        .eq('company_id', companyId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as {
        id: string
        funding_type: string
        status: string
        funder_name: string | null
        amount_requested: number | null
        amount_granted: number | null
        beneficiaries: { first_name: string; last_name: string } | null
      }[]
    },
    enabled: !!companyId,
  })
}
