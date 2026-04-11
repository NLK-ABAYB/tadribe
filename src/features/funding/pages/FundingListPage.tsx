import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Wallet, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FUNDING_TYPES, FUNDING_STATUSES } from '@/lib/constants'
import { useFundingDossiers, useCreateFundingDossier } from '../hooks/use-funding'
import { useAuthContext } from '@/features/auth/auth-context'
import { FundingForm } from '../components/FundingForm'
import type { FundingStatus, FundingType } from '@/lib/types/database'

const STATUS_VARIANT: Record<FundingStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  brouillon: 'secondary',
  depose: 'default',
  en_instruction: 'warning',
  accorde: 'success',
  refuse: 'destructive',
  annule: 'destructive',
  realise: 'outline',
  paye: 'success',
}

export function FundingListPage() {
  const { profile } = useAuthContext()
  const { data: dossiers, isLoading } = useFundingDossiers()
  const createDossier = useCreateFundingDossier()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  const filtered = dossiers?.filter((d) => {
    const term = search.toLowerCase()
    const name = `${d.beneficiaries?.first_name ?? ''} ${d.beneficiaries?.last_name ?? ''}`.toLowerCase()
    const company = d.companies?.name?.toLowerCase() ?? ''
    const formation = d.enrollments?.sessions?.formations?.title?.toLowerCase() ?? ''
    const ref = d.funder_reference?.toLowerCase() ?? ''
    const matchesSearch = name.includes(term) || company.includes(term) || formation.includes(term) || ref.includes(term)
    const matchesStatus = !statusFilter || d.status === statusFilter
    const matchesType = !typeFilter || d.funding_type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  async function handleCreate(data: Record<string, unknown>) {
    if (!profile?.organization_id) return
    await createDossier.mutateAsync({
      ...data,
      organization_id: profile.organization_id,
      funding_type: data.funding_type as FundingType,
      status: (data.status as FundingStatus) || 'brouillon',
    } as Parameters<typeof createDossier.mutateAsync>[0])
    toast.success('Dossier de financement créé')
    setShowForm(false)
  }

  const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

  // Stats
  const totalRequested = dossiers?.reduce((s, d) => s + (d.amount_requested ?? 0), 0) ?? 0
  const totalGranted = dossiers?.reduce((s, d) => s + (d.amount_granted ?? 0), 0) ?? 0
  const totalPaid = dossiers?.reduce((s, d) => s + (d.amount_paid ?? 0), 0) ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financements</h1>
          <p className="text-muted-foreground">
            Dossiers de prise en charge (OPCO, CPF, France Travail, etc.)
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau dossier
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase">Demandé</p>
            <p className="text-2xl font-bold">{fmt.format(totalRequested)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase">Accordé</p>
            <p className="text-2xl font-bold text-green-600">{fmt.format(totalGranted)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase">Encaissé</p>
            <p className="text-2xl font-bold text-blue-600">{fmt.format(totalPaid)}</p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nouveau dossier de financement</CardTitle>
          </CardHeader>
          <CardContent>
            <FundingForm
              onSubmit={handleCreate}
              isSubmitting={createDossier.isPending}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">Tous types</option>
          {Object.entries(FUNDING_TYPES).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tous statuts</option>
          {Object.entries(FUNDING_STATUSES).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !filtered?.length ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Aucun dossier</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search || statusFilter || typeFilter ? 'Aucun résultat' : 'Créez un dossier de financement'}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Bénéficiaire</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Formation</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Demandé</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Accordé</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link to={`/financements/${d.id}`} className="text-sm font-medium text-primary hover:underline">
                      {FUNDING_TYPES[d.funding_type]}
                    </Link>
                    {d.funder_reference && (
                      <span className="block text-xs text-muted-foreground font-mono">{d.funder_reference}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {d.beneficiaries ? `${d.beneficiaries.last_name} ${d.beneficiaries.first_name}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {d.enrollments?.sessions?.formations?.title ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {d.amount_requested != null ? fmt.format(d.amount_requested) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {d.amount_granted != null ? fmt.format(d.amount_granted) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {d.status && (
                      <Badge variant={STATUS_VARIANT[d.status]}>
                        {FUNDING_STATUSES[d.status]}
                      </Badge>
                    )}
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
