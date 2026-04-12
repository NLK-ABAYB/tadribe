import { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthContext } from '@/features/auth/auth-context'

const LandingPage = lazy(() =>
  import('@/features/landing/pages/LandingPage').then((m) => ({ default: m.LandingPage })),
)

/**
 * Smart root component:
 * - Unauthenticated → public landing page
 * - Authenticated → redirect to /dashboard (inside the protected AppLayout)
 */
export function LandingOrDashboard() {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LandingPage />
    </Suspense>
  )
}
