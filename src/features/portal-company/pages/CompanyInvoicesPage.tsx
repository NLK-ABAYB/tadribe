import { Loader2, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { INVOICE_STATUSES } from '@/lib/constants'
import { useAuthContext } from '@/features/auth/auth-context'
import { useMyCompany, useCompanyInvoices } from '../hooks/use-company-portal'

const STATUS_COLOR: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  brouillon: 'secondary',
  emise: 'default',
  envoyee: 'warning',
  payee_partiellement: 'warning',
  payee: 'success',
  en_retard: 'destructive',
  contentieux: 'destructive',
  avoir: 'outline',
}

export function CompanyInvoicesPage() {
  const { user } = useAuthContext()
  const { data: company, isLoading: companyLoading } = useMyCompany(user?.id)
  const { data: invoices, isLoading: invoicesLoading } = useCompanyInvoices(company?.id)

  const isLoading = companyLoading || invoicesLoading

  const totalHT = invoices?.reduce((sum, i) => sum + (i.total_ht ?? 0), 0) ?? 0
  const totalPaid = invoices?.reduce((sum, i) => sum + (i.amount_paid ?? 0), 0) ?? 0
  const totalDue = invoices
    ?.filter((i) => i.status !== 'payee' && i.status !== 'avoir' && i.status !== 'brouillon')
    .reduce((sum, i) => sum + ((i.total_ttc ?? 0) - (i.amount_paid ?? 0)), 0) ?? 0

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
        <h1 className="text-3xl font-bold tracking-tight">Factures</h1>
        <p className="text-muted-foreground">Suivi de la facturation</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase">Total HT</p>
            <p className="text-2xl font-bold">{totalHT.toLocaleString('fr-FR')} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase">Payé</p>
            <p className="text-2xl font-bold text-green-600">{totalPaid.toLocaleString('fr-FR')} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase">Reste dû</p>
            <p className="text-2xl font-bold text-red-600">{totalDue.toLocaleString('fr-FR')} €</p>
          </CardContent>
        </Card>
      </div>

      {!invoices?.length ? (
        <div className="flex flex-col items-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Aucune facture</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Vos factures apparaitront ici
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Factures ({invoices.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left text-sm font-medium">Numéro</th>
                    <th className="px-4 py-2 text-left text-sm font-medium hidden sm:table-cell">Date émission</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Montant TTC</th>
                    <th className="px-4 py-2 text-left text-sm font-medium hidden md:table-cell">Payé</th>
                    <th className="px-4 py-2 text-left text-sm font-medium hidden sm:table-cell">Échéance</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b last:border-0">
                      <td className="px-4 py-2 text-sm font-mono">{invoice.invoice_number ?? '—'}</td>
                      <td className="px-4 py-2 text-sm text-muted-foreground hidden sm:table-cell">
                        {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium">
                        {invoice.total_ttc != null ? `${invoice.total_ttc.toLocaleString('fr-FR')} €` : '—'}
                      </td>
                      <td className="px-4 py-2 text-sm text-muted-foreground hidden md:table-cell">
                        {invoice.amount_paid != null ? `${invoice.amount_paid.toLocaleString('fr-FR')} €` : '0 €'}
                      </td>
                      <td className="px-4 py-2 text-sm text-muted-foreground hidden sm:table-cell">
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="px-4 py-2">
                        {invoice.status && (
                          <Badge variant={STATUS_COLOR[invoice.status] ?? 'secondary'} className="text-xs">
                            {INVOICE_STATUSES[invoice.status as keyof typeof INVOICE_STATUSES] ?? invoice.status}
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
