import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ClipboardList, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { INSCRIPTION_STATUSES } from '@/lib/constants'
import { useEnrollments, useCreateEnrollment } from '../hooks/use-enrollments'
import { useAuthContext } from '@/features/auth/auth-context'
import { EnrollmentForm } from '../components/EnrollmentForm'
import type { InscriptionStatus } from '@/lib/types/database'

const STATUS_VARIANT: Record<InscriptionStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  pre_inscrit: 'secondary',
  en_attente_financement: 'warning',
  confirme: 'default',
  en_formation: 'success',
  abandonne: 'destructive',
  termine: 'outline',
  annule: 'destructive',
}

export function EnrollmentsListPage() {
  const { profile } = useAuthContext()
  const { data: enrollments, isLoading } = useEnrollments()
  const createEnrollment = useCreateEnrollment()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const filtered = enrollments?.filter((e) => {
    const term = search.toLowerCase()
    const name = `${e.beneficiaries?.first_name ?? ''} ${e.beneficiaries?.last_name ?? ''}`.toLowerCase()
    const formation = e.sessions?.formations?.title?.toLowerCase() ?? ''
    const company = e.companies?.name?.toLowerCase() ?? ''
    const matchesSearch = name.includes(term) || formation.includes(term) || company.includes(term)
    const matchesStatus = !statusFilter || e.status === statusFilter
    return matchesSearch && matchesStatus
  })

  async function handleCreate(data: Record<string, unknown>) {
    if (!profile?.organization_id) return
    try {
      await createEnrollment.mutateAsync({
        ...data,
        organization_id: profile.organization_id,
        session_id: data.session_id as string,
        beneficiary_id: data.beneficiary_id as string,
      } as Parameters<typeof createEnrollment.mutateAsync>[0])
      toast.success('Inscription créée')
      setShowForm(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inscriptions</h1>
          <p className="text-muted-foreground">
            Gestion des inscriptions aux sessions de formation
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle inscription
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle inscription</CardTitle>
          </CardHeader>
          <CardContent>
            <EnrollmentForm
              onSubmit={handleCreate}
              isSubmitting={createEnrollment.isPending}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, formation ou entreprise..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          {Object.entries(INSCRIPTION_STATUSES).map(([key, label]) => (
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
          <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Aucune inscription</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search || statusFilter ? 'Aucun résultat' : 'Les inscriptions apparaîtront ici'}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Bénéficiaire</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Formation</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Session</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Entreprise</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((enrollment) => (
                <tr key={enrollment.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      to={`/inscriptions/${enrollment.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {enrollment.beneficiaries
                        ? `${enrollment.beneficiaries.last_name} ${enrollment.beneficiaries.first_name}`
                        : '—'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {enrollment.sessions?.formations?.title ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {enrollment.sessions?.code ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {enrollment.companies?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {enrollment.enrollment_date ? new Date(enrollment.enrollment_date).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {enrollment.status && (
                      <Badge variant={STATUS_VARIANT[enrollment.status]}>
                        {INSCRIPTION_STATUSES[enrollment.status]}
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
