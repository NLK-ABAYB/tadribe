import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { useAuthContext } from '@/features/auth/auth-context'
import { useConventions, useCreateConvention, useNextConventionRef } from '../hooks/use-conventions'
import { ConventionForm, type ConventionFormData } from '../components/ConventionForm'
import { CONVENTION_STATUS_LABELS, CONVENTION_TYPE_LABELS, type ConventionStatus } from '../types'

const STATUS_VARIANT: Record<ConventionStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  sent: 'default',
  signed: 'success',
  cancelled: 'outline',
}

export function ConventionsListPage() {
  const { profile } = useAuthContext()
  const { data: conventions, isLoading } = useConventions()
  const { data: nextRef } = useNextConventionRef()
  const createConvention = useCreateConvention()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = conventions?.filter((c) =>
    c.reference.toLowerCase().includes(search.toLowerCase()) ||
    c.companies?.name?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleCreate(data: ConventionFormData) {
    if (!profile?.organization_id) return
    try {
      await createConvention.mutateAsync({
        organization_id: profile.organization_id,
        company_id: data.company_id,
        session_id: data.session_id || null,
        reference: data.reference,
        type: data.type,
        funding_type: data.funding_type || null,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        amount_ht: data.amount_ht,
        terms: data.terms || null,
        notes: data.notes || null,
        status: 'draft',
      })
      toast.success('Convention créée')
      setShowForm(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Conventions' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conventions de formation</h1>
          <p className="text-muted-foreground">
            Conventions inter/intra entreprise — signature et suivi
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle convention
        </Button>
      </div>

      {showForm && nextRef && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle convention</CardTitle>
          </CardHeader>
          <CardContent>
            <ConventionForm
              defaultValues={{ reference: nextRef }}
              onSubmit={handleCreate}
              isSubmitting={createConvention.isPending}
            />
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par référence ou entreprise..."
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
          <h3 className="text-lg font-semibold">Aucune convention</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? 'Aucun résultat pour cette recherche' : 'Créez votre première convention'}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Référence</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Entreprise</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Session</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Montant HT</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      to={`/dashboard/conventions/${c.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {c.reference}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm">{c.companies?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-sm">{CONVENTION_TYPE_LABELS[c.type]}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {c.sessions?.formations?.title ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {fmt(c.amount_ht)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[c.status] ?? 'secondary'}>
                      {CONVENTION_STATUS_LABELS[c.status]}
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
