import { createContext, useContext, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile, Organization } from '@/lib/types/database'
import { useAuth } from '@/lib/hooks/use-auth'
import { useRole } from '@/lib/hooks/use-role'
import { useOrganization } from '@/lib/hooks/use-organization'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  session: Session | null
  organization: Organization | null
  loading: boolean
  role: ReturnType<typeof useRole>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, profile, session, loading: authLoading } = useAuth()
  const role = useRole(profile)
  const { organization, loading: orgLoading } = useOrganization(profile?.organization_id)

  const loading = authLoading || orgLoading

  return (
    <AuthContext.Provider value={{ user, profile, session, organization, loading, role }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
