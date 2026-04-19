import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert } from '@/types/supabase'

type Location = Tables<'locations'>

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name')
      if (error) throw error
      return data as Location[]
    },
  })
}

export function useCreateLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (location: TablesInsert<'locations'>) => {
      const { data, error } = await supabase
        .from('locations')
        .insert(location)
        .select()
        .single()
      if (error) throw error
      return data as Location
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    },
  })
}
