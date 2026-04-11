import { Loader2, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FUNDING_TYPES, FUNDING_STATUSES } from '@/lib/constants'
import { useAuthContext } from '@/features/auth/auth-context'
import { useMyCompany, useCompanyFunding } from '../hooks/use-company-portal'

const STATUS_COLOR: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  brouillon: 'secondary',
  depose: 'default',
  en_instruction: 'warning',
  accorde: 'success',
  refuse: 'destructive',
  annule: 'destructive',
  realise: 'success',
  paye: 'success',
}

export function CompanyFundingPage() {
  const { user } = useAuthContext()
  const { data: company, isLoading: companyLoading } = useMyCompany(user?.id)
  const { data: funding, isLoading: fundingLoading } = useCompanyFunding(company?.id)

  const isLoading = companyLoading || fundingLoading

  const totalRequested = funding?.reduce((sum, f) => sum + (f.amount_requested ?? 0), 0) ?? 0
  const totalGranted = funding?.reduce((sum, f) => sum + (f.amount_granted ?? 0), 0) ?? 0

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financements</h1>
        <p className="text-muted-foreground">Dossiers de financement de vos formations</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase">Demandé</p>
            <p className="text-2xl font-bold">{totalRequested.toLocaleString('fr-FR')} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase">Accordé</p>
            <p className="text-2xl font-bold text-green-600">{totalGranted.toLocaleString('fr-FR')} €</p>
          </CardContent>
        </Card>
      </div>

      {!funding?.length ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Aucun dossier</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Les dossiers de financement de vos formations apparaitront ici
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dossiers ({funding.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left text-sm font-medium">Collaborateur</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Type</th>
                    <th className="px-4 py-2 text-left text-sm font-medium hidden sm:table-cell">Organisme</th>
                    <th className="px-4 py-2 text-left text-sm font-medium hidden md:table-cell">Demandé</th>
                    <th className="px-4 py-2 text-left text-sm font-medium hidden md:table-cell">Accordé</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {funding.map((dossier) => (
                    <tr key={dossier.id} className="border-b last:border-0">
                      <td className="px-4 py-2 text-sm font-medium">
                        {dossier.beneficiaries
                          ? `${dossier.beneficiaries.first_name} ${dossier.beneficiaries.last_name}`
                          : '—'}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {FUNDING_TYPES[dossier.funding_type as keyof typeof FUNDING_TYPES] ?? dossier.funding_type}
                      </td>
                      <td className="px-4 py-2 text-sm text-muted-foreground hidden sm:table-cell">
                        {dossier.funder_name ?? '—'}
                      </td>
                      <td className="px-4 py-2 text-sm text-muted-foreground hidden md:table-cell">
                        {dossier.amount_requested != null ? `${dossier.amount_requested.toLocaleString('fr-FR')} €` : '—'}
                      </td>
                      <td className="px-4 py-2 text-sm text-muted-foreground hidden md:table-cell">
                        {dossier.amount_granted != null ? `${dossier.amount_granted.toLocaleString('fr-FR')} €` : '—'}
                      </td>
                      <td className="px-4 py-2">
                        {dossier.status && (
                          <Badge variant={STATUS_COLOR[dossier.status] ?? 'secondary'} className="text-xs">
                            {FUNDING_STATUSES[dossier.status as keyof typeof FUNDING_STATUSES] ?? dossier.status}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
