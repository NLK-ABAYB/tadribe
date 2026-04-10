import { useMemo } from 'react'
import type { UserRole } from '@/lib/types/database'
import type { Profile } from '@/lib/types/database'

const STAFF_ROLES: UserRole[] = ['admin_of', 'gestionnaire', 'commercial']

export function useRole(profile: Profile | null) {
  return useMemo(() => {
    if (!profile) {
      return {
        role: null as UserRole | null,
        isAdmin: false,
        isStaff: false,
        isFormateur: false,
        isApprenant: false,
        isEntreprise: false,
        hasRole: (_role: UserRole) => false,
        hasAnyRole: (_roles: UserRole[]) => false,
      }
    }

    const role = profile.role

    return {
      role,
      isAdmin: role === 'admin_of',
      isStaff: STAFF_ROLES.includes(role),
      isFormateur: role === 'formateur',
      isApprenant: role === 'apprenant' || role === 'apprenti',
      isEntreprise: role === 'entreprise',
      hasRole: (r: UserRole) => role === r,
      hasAnyRole: (roles: UserRole[]) => roles.includes(role),
    }
  }, [profile])
}
