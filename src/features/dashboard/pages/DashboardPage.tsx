import { Navigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useAuthContext } from '@/features/auth/auth-context'
import { useDashboardStats } from '../hooks/use-dashboard-stats'
import {
  Building2,
  CalendarDays,
  GraduationCap,
  FileText,
  BookOpen,
  UserCheck,
  Wallet,
  TrendingUp,
} from 'lucide-react'

export function DashboardPage() {
  const { profile, organization, role } = useAuthContext()
  const { data: stats, isLoading } = useDashboardStats()

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

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {role.isStaff && stats && (
        <>
          {/* Primary KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Entreprises"
              value={String(stats.companies.active)}
              description={`${stats.companies.total} au total`}
              icon={Building2}
              href="/entreprises"
            />
            <StatCard
              title="Sessions en cours"
              value={String(stats.sessions.enCours)}
              description={`${stats.sessions.planifiees} planifiées`}
              icon={CalendarDays}
              href="/sessions"
            />
            <StatCard
              title="Apprenants en formation"
              value={String(stats.enrollments.enFormation)}
              description={`${stats.enrollments.termines} terminés`}
              icon={GraduationCap}
              href="/beneficiaires"
            />
            <StatCard
              title="Factures en attente"
              value={stats.invoices.enAttente > 0 ? `${stats.invoices.montantDu.toLocaleString('fr-FR')} €` : '0 €'}
              description={`${stats.invoices.enAttente} facture(s)`}
              icon={FileText}
              href="/factures"
            />
          </div>

          {/* Secondary KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Formations"
              value={String(stats.formations.active)}
              description={`${stats.formations.total} au catalogue`}
              icon={BookOpen}
              href="/formations"
            />
            <StatCard
              title="Formateurs"
              value={String(stats.trainers.total)}
              description="Inscrits"
              icon={UserCheck}
              href="/formateurs"
            />
            <StatCard
              title="Financements"
              value={stats.funding.totalGranted > 0 ? `${stats.funding.totalGranted.toLocaleString('fr-FR')} €` : '0 €'}
              description={`${stats.funding.enInstruction} en instruction`}
              icon={Wallet}
              href="/financements"
            />
            <StatCard
              title="CA encaissé"
              value={stats.invoices.montantPaye > 0 ? `${stats.invoices.montantPaye.toLocaleString('fr-FR')} €` : '0 €'}
              description="Montant total payé"
              icon={TrendingUp}
              href="/factures"
            />
          </div>

          {/* Quick summary */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vue d'ensemble des sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <SummaryRow label="En cours" value={stats.sessions.enCours} color="text-green-600" />
                  <SummaryRow label="Planifiées / Confirmées" value={stats.sessions.planifiees} color="text-blue-600" />
                  <SummaryRow label="Terminées" value={stats.sessions.terminees} color="text-muted-foreground" />
                  <SummaryRow label="Total" value={stats.sessions.total} color="text-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vue d'ensemble des inscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <SummaryRow label="En formation / Confirmés" value={stats.enrollments.enFormation} color="text-green-600" />
                  <SummaryRow label="Terminés" value={stats.enrollments.termines} color="text-blue-600" />
                  <SummaryRow label="Total bénéficiaires" value={stats.beneficiaries.total} color="text-muted-foreground" />
                  <SummaryRow label="Total inscriptions" value={stats.enrollments.total} color="text-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {role.isFormateur && stats && (
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard
            title="Sessions"
            value={String(stats.sessions.enCours)}
            description="En cours"
            icon={CalendarDays}
            href="/sessions"
          />
          <StatCard
            title="Apprenants"
            value={String(stats.enrollments.enFormation)}
            description="En formation"
            icon={GraduationCap}
            href="/beneficiaires"
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
  href,
}: {
  title: string
  value: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
}) {
  const content = (
    <Card className={href ? 'hover:border-primary/50 transition-colors cursor-pointer' : ''}>
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

  if (href) return <Link to={href}>{content}</Link>
  return content
}

function SummaryRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  )
}
