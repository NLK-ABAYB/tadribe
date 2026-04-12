import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Star, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { EVAL_TYPES } from '@/lib/constants'
import { useEvaluations, useCreateEvaluation } from '../hooks/use-evaluations'
import { useAuthContext } from '@/features/auth/auth-context'
import type { EvalType } from '@/lib/types/database'
import { Breadcrumb } from '@/components/layout/Breadcrumb'

const TYPE_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'outline'> = {
  positionnement: 'secondary',
  formative: 'default',
  sommative: 'default',
  satisfaction_chaud: 'warning',
  satisfaction_froid: 'outline',
  insertion_3m: 'success',
  insertion_6m: 'success',
  insertion_12m: 'success',
}

export function EvaluationsListPage() {
  const { profile } = useAuthContext()
  const { data: evaluations, isLoading } = useEvaluations()
  const createEvaluation = useCreateEvaluation()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  // Inline creation form state
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<EvalType>('satisfaction_chaud')

  const filtered = evaluations?.filter((e) => {
    const term = search.toLowerCase()
    const matchesSearch = e.title.toLowerCase().includes(term) ||
      e.sessions?.formations?.title?.toLowerCase().includes(term) ||
      false
    const matchesType = !typeFilter || e.eval_type === typeFilter
    return matchesSearch && matchesType
  })

  async function handleCreate() {
    if (!profile?.organization_id || !newTitle) return
    try {
      await createEvaluation.mutateAsync({
        organization_id: profile.organization_id,
        title: newTitle,
        eval_type: newType,
        questions: [],
      })
      toast.success('Évaluation créée')
      setNewTitle('')
      setShowForm(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Évaluations' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Évaluations</h1>
          <p className="text-muted-foreground">
            Questionnaires de satisfaction, positionnement et insertion
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle évaluation
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle évaluation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Titre *</Label>
                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Satisfaction session X" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as EvalType)}
                >
                  {Object.entries(EVAL_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleCreate} disabled={!newTitle || createEvaluation.isPending}>
                  {createEvaluation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <div className="relative flex-1">
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
          {Object.entries(EVAL_TYPES).map(([key, label]) => (
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
          <Star className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Aucune évaluation</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search || typeFilter ? 'Aucun résultat' : 'Créez une évaluation'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((evaluation) => (
            <Link key={evaluation.id} to={`/evaluations/${evaluation.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{evaluation.title}</CardTitle>
                    <Badge variant={TYPE_VARIANT[evaluation.eval_type] ?? 'secondary'}>
                      {EVAL_TYPES[evaluation.eval_type]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {evaluation.sessions?.formations?.title && (
                      <p>{evaluation.sessions.formations.title}</p>
                    )}
                    {evaluation.sessions?.code && (
                      <p className="font-mono text-xs">{evaluation.sessions.code}</p>
                    )}
                    {evaluation.scheduled_date && (
                      <p>Prévue : {new Date(evaluation.scheduled_date).toLocaleDateString('fr-FR')}</p>
                    )}
                    <p>{Array.isArray(evaluation.questions) ? evaluation.questions.length : 0} question(s)</p>
                  </div>
                  {!evaluation.is_active && <Badge variant="outline" className="mt-2">Inactif</Badge>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
