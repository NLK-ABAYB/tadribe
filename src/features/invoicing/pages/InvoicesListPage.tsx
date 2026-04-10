import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useInvoices } from '../hooks/use-invoices'
import { INVOICE_STATUSES } from '@/lib/constants'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  brouillon: 'secondary',
  emise: 'default',
  envoyee: 'default',
  payee_partiellement: 'warning',
  payee: 'success',
  en_retard: 'destructive',
  contentieux: 'destructive',
  avoir: 'outline',
}

export function InvoicesListPage() {
  const { data: invoices, isLoading } = useInvoices()
  const [search, setSearch] = useState('')

  const filtered = invoices?.filter((inv) =>
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    inv.recipient_name.toLowerCase().includes(search.toLowerCase())
  )

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Factures</h1>
          <p className="text-muted-foreground">
            Gestion de la facturation et du suivi des paiements
          </p>
        </div>
        <Link to="/factures/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle facture
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par numéro ou destinataire..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !filtered?.length ? (
        <div className="flex flex-col items-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Aucune facture</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Créez votre première facture
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Numéro</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Destinataire</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Échéance</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Total TTC</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Payé</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      to={`/factures/${inv.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {inv.invoice_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm">{inv.recipient_name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(inv.issue_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(inv.due_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {formatCurrency(inv.total_ttc)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {formatCurrency(inv.amount_paid)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[inv.status] ?? 'secondary'}>
                      {INVOICE_STATUSES[inv.status as keyof typeof INVOICE_STATUSES] ?? inv.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
