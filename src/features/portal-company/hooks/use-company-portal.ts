import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/supabase'

type Company = Tables<'companies'>
type Beneficiary = Tables<'beneficiaries'>
type Enrollment = Tables<'enrollments'>
type Invoice = Tables<'invoices'>
type FundingDossier = Tables<'funding_dossiers'>

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

      const companyId = (contact as unknown as { company_id: string | null }).company_id
      if (!companyId) throw new Error('No company linked to this user')

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single()
      if (error) throw error
      return data as Company
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
      return data as Beneficiary[]
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
      return data as unknown as (Enrollment & {
        beneficiaries: { first_name: string; last_name: string } | null
        sessions: {
          code: string | null
          start_date: string
          end_date: string
          status: string
          formations: { title: string; duration_hours: number | null } | null
        } | null
      })[]
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
      return data as Invoice[]
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
      return data as unknown as (FundingDossier & {
        beneficiaries: { first_name: string; last_name: string } | null
      })[]
    },
    enabled: !!companyId,
  })
}
