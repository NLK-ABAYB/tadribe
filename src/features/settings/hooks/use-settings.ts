import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesUpdate } from '@/types/supabase'

type Organization = Tables<'organizations'>
type Profile = Tables<'profiles'>

export function useOrganizationSettings(orgId: string | undefined) {
  return useQuery({
    queryKey: ['organization-settings', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId!)
        .single()
      if (error) throw error
      return data as Organization
    },
    enabled: !!orgId,
  })
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'organizations'> & { id: string }) => {
      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Organization
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-settings'] })
    },
  })
}

export function useTeamMembers(orgId: string | undefined) {
  return useQuery({
    queryKey: ['team-members', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', orgId!)
        .order('last_name')
      if (error) throw error
      return data as Profile[]
    },
    enabled: !!orgId,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'profiles'> & { id: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Profile
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] })
    },
  })
}
