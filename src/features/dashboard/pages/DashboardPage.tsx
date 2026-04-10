import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthContext } from '@/features/auth/auth-context'
import {
  Building2,
  CalendarDays,
  GraduationCap,
  FileText,
} from 'lucide-react'

export function DashboardPage() {
  const { profile, organization, role } = useAuthContext()

  // Redirect portal users to their dedicated space
  if (role.isApprenant) return <Navigate to="/mon-espace" replace />
  if (role.isEntreprise) return <Navigate to="/espace-entreprise" replace />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bonjour, {profile?.first_name}
        </h1>
        <p className="text-muted-foreground">
          {organization?.name} — Tableau de bord
        </p>
      </div>

      {role.isStaff && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Entreprises"
            value="—"
            description="Clients actifs"
            icon={Building2}
          />
          <StatCard
            title="Sessions"
            value="—"
            description="En cours"
            icon={CalendarDays}
          />
          <StatCard
            title="Apprenants"
            value="—"
            description="En formation"
            icon={GraduationCap}
          />
          <StatCard
            title="Factures"
            value="—"
            description="En attente"
            icon={FileText}
          />
        </div>
      )}

      {role.isFormateur && (
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard
            title="Mes sessions"
            value="—"
            description="Cette semaine"
            icon={CalendarDays}
          />
          <StatCard
            title="Mes apprenants"
            value="—"
            description="Actuellement"
            icon={GraduationCap}
          />
        </div>
      )}

    </div>
  )
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string
  value: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
