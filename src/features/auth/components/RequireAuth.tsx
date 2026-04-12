import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthContext } from '../auth-context'
import type { UserRole } from '@/lib/types/database'

interface RequireAuthProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { user, profile, loading } = useAuthContext()
  const location = useLocation()

  console.log('[RequireAuth] render', {
    path: location.pathname,
    loading,
    hasUser: !!user,
    hasProfile: !!profile,
    role: profile?.role ?? null,
    organizationId: profile?.organization_id ?? null,
  })

  if (loading) {
    console.log('[RequireAuth] still loading → spinner')
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    console.log('[RequireAuth] no user → redirect /login')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!profile) {
    console.warn('[RequireAuth] user without profile → blocked screen')
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Profil non trouvé</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Votre compte n'est pas encore configuré. Contactez votre administrateur.
          </p>
        </div>
      </div>
    )
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    console.log('[RequireAuth] role not allowed', {
      role: profile.role,
      allowedRoles,
    })
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
