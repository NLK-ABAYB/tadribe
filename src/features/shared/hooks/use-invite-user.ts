import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type InviteRole = 'apprenant' | 'apprenti' | 'entreprise'

export interface InviteUserArgs {
  email: string
  role: InviteRole
  target_id: string
  first_name?: string
  last_name?: string
}

interface InviteUserResponse {
  ok: boolean
  user_id: string
  already_invited: boolean
}

export function useInviteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (args: InviteUserArgs): Promise<InviteUserResponse> => {
      const { data, error } = await supabase.functions.invoke<InviteUserResponse>(
        'invite-user',
        { body: args },
      )
      if (error) throw error
      if (!data?.ok) throw new Error('Invitation failed')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}
