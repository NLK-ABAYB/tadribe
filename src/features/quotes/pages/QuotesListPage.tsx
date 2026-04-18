import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { useQuotes } from '../hooks/use-quotes'
import { QUOTE_STATUS_LABELS, type QuoteStatus } from '../types'

const STATUS_VARIANT: Record<QuoteStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  sent: 'default',
  accepted: 'success',
  rejected: 'destructive',
  expired: 'outline',
  converted: 'success',
}

export function QuotesListPage() {
  const { data: quotes, isLoading } = useQuotes()
  const [search, setSearch] = useState('')

  const filtered = quotes?.filter((q) =>
    q.quote_number.toLowerCase().includes(search.toLowerCase()) ||
    q.companies?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Devis' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devis</h1>
          <p className="text-muted-foreground">
            Proposals commerciales et conversion en facture
          </p>
        </div>
        <Link to="/dashboard/devis/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau devis
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par numéro ou entreprise..."
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
          <h3 className="text-lg font-semibold">Aucun devis</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? 'Aucun résultat pour cette recherche' : 'Créez votre premier devis'}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Numéro</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Entreprise</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Validité</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Total TTC</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      to={`/dashboard/devis/${q.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {q.quote_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm">{q.companies?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(q.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {q.valid_until ? new Date(q.valid_until).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {formatCurrency(q.total_ttc)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[q.status] ?? 'secondary'}>
                      {QUOTE_STATUS_LABELS[q.status] ?? q.status}
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
