import { Navigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  AlertTriangle,
  Clock,
} from 'lucide-react'

function formatEuros(value: number): string {
  return value.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €'
}

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
          {/* Alerts */}
          {stats.alertes.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="h-4 w-4" />
                  Alertes ({stats.alertes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {stats.alertes.map((alerte, i) => (
                    <li key={i} className="text-sm text-orange-700 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                      {alerte}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Primary KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="CA mois en cours"
              value={formatEuros(stats.invoices.caMoisEnCours)}
              description={`${formatEuros(stats.invoices.montantPaye)} total encaissé`}
              icon={TrendingUp}
              href="/dashboard/factures"
            />
            <StatCard
              title="Sessions cette semaine"
              value={String(stats.sessions.cetteSemaine)}
              description={`${stats.sessions.enCours} en cours`}
              icon={CalendarDays}
              href="/dashboard/sessions"
            />
            <StatCard
              title="Factures impayées"
              value={stats.invoices.enAttente > 0 ? formatEuros(stats.invoices.montantDu) : '0 €'}
              description={`${stats.invoices.enAttente} facture(s)${stats.invoices.facturesEnRetard > 0 ? ` · ${stats.invoices.facturesEnRetard} en retard` : ''}`}
              icon={FileText}
              href="/dashboard/factures"
              alert={stats.invoices.facturesEnRetard > 0}
            />
            <StatCard
              title="Apprenants en formation"
              value={String(stats.enrollments.enFormation)}
              description={`${stats.enrollments.termines} terminés`}
              icon={GraduationCap}
              href="/dashboard/beneficiaires"
            />
          </div>

          {/* Secondary KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Entreprises"
              value={String(stats.companies.active)}
              description={`${stats.companies.total} au total`}
              icon={Building2}
              href="/dashboard/entreprises"
            />
            <StatCard
              title="Formations"
              value={String(stats.formations.active)}
              description={`${stats.formations.total} au catalogue`}
              icon={BookOpen}
              href="/dashboard/formations"
            />
            <StatCard
              title="Formateurs"
              value={String(stats.trainers.total)}
              description="Inscrits"
              icon={UserCheck}
              href="/dashboard/formateurs"
            />
            <StatCard
              title="Financements"
              value={stats.funding.totalGranted > 0 ? formatEuros(stats.funding.totalGranted) : '0 €'}
              description={`${stats.funding.enInstruction} en instruction`}
              icon={Wallet}
              href="/dashboard/financements"
            />
          </div>

          {/* Quick summary */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <SummaryRow label="En cours" value={stats.sessions.enCours} color="text-green-600" />
                  <SummaryRow label="Planifiées / Confirmées" value={stats.sessions.planifiees} color="text-blue-600" />
                  <SummaryRow label="Cette semaine" value={stats.sessions.cetteSemaine} color="text-primary" />
                  <SummaryRow label="Terminées" value={stats.sessions.terminees} color="text-muted-foreground" />
                  <SummaryRow label="Total" value={stats.sessions.total} color="text-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  Inscriptions
                </CardTitle>
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

          {/* Revenue & funding summary */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Facturation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <SummaryRowEuros label="CA mois en cours" value={stats.invoices.caMoisEnCours} color="text-green-600" />
                  <SummaryRowEuros label="Total encaissé" value={stats.invoices.montantPaye} color="text-blue-600" />
                  <SummaryRowEuros label="Montant dû" value={stats.invoices.montantDu} color="text-orange-600" />
                  <SummaryRow label="Factures en retard" value={stats.invoices.facturesEnRetard} color={stats.invoices.facturesEnRetard > 0 ? 'text-red-600' : 'text-muted-foreground'} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  Financements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <SummaryRowEuros label="Total demandé" value={stats.funding.totalRequested} color="text-foreground" />
                  <SummaryRowEuros label="Total accordé" value={stats.funding.totalGranted} color="text-green-600" />
                  <SummaryRow label="En instruction" value={stats.funding.enInstruction} color="text-blue-600" />
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
            href="/dashboard/sessions"
          />
          <StatCard
            title="Apprenants"
            value={String(stats.enrollments.enFormation)}
            description="En formation"
            icon={GraduationCap}
            href="/dashboard/beneficiaires"
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
  alert,
}: {
  title: string
  value: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  alert?: boolean
}) {
  const content = (
    <Card className={`${href ? 'hover:border-primary/50 transition-colors cursor-pointer' : ''} ${alert ? 'border-orange-300' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${alert ? 'text-orange-500' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          {alert && <Badge variant="destructive" className="text-[10px] px-1 py-0">Retard</Badge>}
          {description}
        </p>
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

function SummaryRowEuros({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{formatEuros(value)}</span>
    </div>
  )
}
