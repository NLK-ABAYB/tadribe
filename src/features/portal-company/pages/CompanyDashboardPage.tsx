import { Link } from 'react-router-dom'
import { Loader2, Users, BookOpen, FileText, Wallet, Clock, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { INSCRIPTION_STATUSES, INVOICE_STATUSES } from '@/lib/constants'
import { useAuthContext } from '@/features/auth/auth-context'
import { useMyCompany, useCompanyBeneficiaries, useCompanyEnrollments, useCompanyInvoices } from '../hooks/use-company-portal'

export function CompanyDashboardPage() {
  const { user } = useAuthContext()
  const { data: company, isLoading: companyLoading } = useMyCompany(user?.id)
  const { data: beneficiaries } = useCompanyBeneficiaries(company?.id)
  const { data: enrollments } = useCompanyEnrollments(company?.id)
  const { data: invoices } = useCompanyInvoices(company?.id)

  if (companyLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Entreprise non trouvée. Contactez votre organisme de formation.</p>
      </div>
    )
  }

  const activeEnrollments = enrollments?.filter((e) => e.status === 'en_formation' || e.status === 'confirme') ?? []
  const completedEnrollments = enrollments?.filter((e) => e.status === 'termine') ?? []
  const unpaidInvoices = invoices?.filter((i) => i.status === 'envoyee' || i.status === 'emise' || i.status === 'en_retard') ?? []
  const totalOwed = unpaidInvoices.reduce((sum, i) => sum + ((i.total_ttc ?? 0) - (i.paid_amount ?? 0)), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
        <p className="text-muted-foreground">Espace entreprise — suivi des formations de vos collaborateurs</p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Collaborateurs</p>
                <p className="text-2xl font-bold">{beneficiaries?.length ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">En formation</p>
                <p className="text-2xl font-bold">{activeEnrollments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Terminées</p>
                <p className="text-2xl font-bold">{completedEnrollments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Factures en attente</p>
                <p className="text-2xl font-bold">{totalOwed > 0 ? `${totalOwed.toLocaleString('fr-FR')} €` : '0 €'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/espace-entreprise/collaborateurs">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <Users className="h-10 w-10 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">Collaborateurs</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{beneficiaries?.length ?? 0} salarié(s) inscrits</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/espace-entreprise/formations">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">Formations</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{enrollments?.length ?? 0} inscription(s)</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/espace-entreprise/factures">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">Factures</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{invoices?.length ?? 0} facture(s)</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent enrollments */}
      {enrollments && enrollments.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Formations récentes</h2>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left text-sm font-medium">Collaborateur</th>
                  <th className="px-4 py-2 text-left text-sm font-medium hidden sm:table-cell">Formation</th>
                  <th className="px-4 py-2 text-left text-sm font-medium hidden md:table-cell">Dates</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.slice(0, 10).map((enrollment) => (
                  <tr key={enrollment.id} className="border-b last:border-0">
                    <td className="px-4 py-2 text-sm font-medium">
                      {enrollment.beneficiaries
                        ? `${enrollment.beneficiaries.first_name} ${enrollment.beneficiaries.last_name}`
                        : '—'}
                    </td>
                    <td className="px-4 py-2 text-sm text-muted-foreground hidden sm:table-cell">
                      {enrollment.sessions?.formations?.title ?? '—'}
                    </td>
                    <td className="px-4 py-2 text-sm text-muted-foreground hidden md:table-cell">
                      {enrollment.sessions?.start_date
                        ? `${new Date(enrollment.sessions.start_date).toLocaleDateString('fr-FR')} - ${new Date(enrollment.sessions.end_date).toLocaleDateString('fr-FR')}`
                        : '—'}
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant="outline" className="text-xs">
                        {INSCRIPTION_STATUSES[enrollment.status as keyof typeof INSCRIPTION_STATUSES] ?? enrollment.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent invoices */}
      {unpaidInvoices.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Factures en attente</h2>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left text-sm font-medium">Numéro</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Montant TTC</th>
                  <th className="px-4 py-2 text-left text-sm font-medium hidden sm:table-cell">Échéance</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {unpaidInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b last:border-0">
                    <td className="px-4 py-2 text-sm font-mono">{invoice.invoice_number ?? '—'}</td>
                    <td className="px-4 py-2 text-sm font-medium">
                      {invoice.total_ttc != null ? `${invoice.total_ttc.toLocaleString('fr-FR')} €` : '—'}
                    </td>
                    <td className="px-4 py-2 text-sm text-muted-foreground hidden sm:table-cell">
                      {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant={invoice.status === 'en_retard' ? 'destructive' : 'warning'} className="text-xs">
                        {INVOICE_STATUSES[invoice.status as keyof typeof INVOICE_STATUSES] ?? invoice.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
