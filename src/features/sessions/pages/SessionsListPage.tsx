import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Search, Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SESSION_STATUSES } from '@/lib/constants'
import { useSessions, useCreateSession } from '../hooks/use-sessions'
import { useFormations } from '@/features/catalogue/hooks/use-formations'
import { useAuthContext } from '@/features/auth/auth-context'
import type { SessionStatus } from '@/lib/types/database'
import { Breadcrumb } from '@/components/layout/Breadcrumb'

const STATUS_VARIANT: Record<SessionStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  planifiee: 'secondary',
  confirmee: 'default',
  en_cours: 'success',
  terminee: 'outline',
  annulee: 'destructive',
}

export function SessionsListPage() {
  const { profile } = useAuthContext()
  const { data: sessions, isLoading } = useSessions()
  const { data: formations } = useFormations()
  const createSession = useCreateSession()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formationId, setFormationId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  async function handleCreate() {
    if (!profile?.organization_id || !formationId || !startDate || !endDate) return
    try {
      await createSession.mutateAsync({
        organization_id: profile.organization_id,
        formation_id: formationId,
        start_date: startDate,
        end_date: endDate,
        status: 'planifiee',
      })
      toast.success('Session créée')
      setFormationId('')
      setStartDate('')
      setEndDate('')
      setShowForm(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  const filtered = sessions?.filter((s) => {
    const term = search.toLowerCase()
    return (
      s.formations?.title?.toLowerCase().includes(term) ||
      s.code?.toLowerCase().includes(term) ||
      `${s.trainers?.first_name ?? ''} ${s.trainers?.last_name ?? ''}`.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Sessions' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
          <p className="text-muted-foreground">
            Planification et suivi des sessions de formation
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle session
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session-formation">Formation *</Label>
                <select
                  id="session-formation"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formationId}
                  onChange={(e) => setFormationId(e.target.value)}
                >
                  <option value="">Sélectionner...</option>
                  {formations?.map((f) => (
                    <option key={f.id} value={f.id}>{f.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-start">Date début *</Label>
                <Input id="session-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-end">Date fin *</Label>
                <Input id="session-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="flex items-end">
                <Button onClick={handleCreate} disabled={createSession.isPending || !formationId || !startDate || !endDate}>
                  {createSession.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par formation, code ou formateur..."
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
          <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Aucune session</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? 'Aucun résultat' : 'Les sessions apparaîtront ici'}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Formation</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Code</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Dates</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Formateur</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Lieu</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((session) => (
                <tr key={session.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      to={`/dashboard/sessions/${session.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {session.formations?.title ?? '—'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {session.code ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(session.start_date).toLocaleDateString('fr-FR')}
                    {' — '}
                    {new Date(session.end_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {session.trainers ? `${session.trainers.first_name} ${session.trainers.last_name}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {session.is_remote ? 'Distanciel' : session.locations?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    {session.status && (
                      <Badge variant={STATUS_VARIANT[session.status]}>
                        {SESSION_STATUSES[session.status]}
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
