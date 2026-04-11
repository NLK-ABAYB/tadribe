import { Suspense } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useAuthContext } from '@/features/auth/auth-context'

// Roles that need a `profiles.organization_id` to use the staff workspace.
// Portal users (apprenant / apprenti / entreprise) live under their own
// layouts and never reach AppLayout.
const STAFF_ROLES = ['admin_of', 'gestionnaire', 'commercial', 'formateur'] as const

export function AppLayout() {
  const { profile } = useAuthContext()

  // A staff user without an organization just signed up: send them to the
  // onboarding page so they can create their organism. RequireAuth has
  // already guaranteed `profile` is non-null at this point.
  if (
    profile &&
    !profile.organization_id &&
    (STAFF_ROLES as readonly string[]).includes(profile.role)
  ) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
