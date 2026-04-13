import { useState } from 'react'
import { Plus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useOpportunities, useCreateOpportunity, useUpdateOpportunity } from '../hooks/use-opportunities'
import { useAuthContext } from '@/features/auth/auth-context'
import { PIPELINE_STAGES } from '@/lib/constants'
import type { PipelineStage } from '@/lib/types/database'
import { Breadcrumb } from '@/components/layout/Breadcrumb'

const STAGE_COLORS: Record<string, string> = {
  prospect: 'bg-gray-100 text-gray-800',
  qualification: 'bg-blue-100 text-blue-800',
  proposition: 'bg-indigo-100 text-indigo-800',
  negociation: 'bg-yellow-100 text-yellow-800',
  gagne: 'bg-green-100 text-green-800',
  perdu: 'bg-red-100 text-red-800',
  abandonne: 'bg-gray-100 text-gray-500',
}

const ACTIVE_STAGES: PipelineStage[] = ['prospect', 'qualification', 'proposition', 'negociation', 'gagne']

export function PipelinePage() {
  const { profile } = useAuthContext()
  const { data: opportunities, isLoading } = useOpportunities()
  const createOpp = useCreateOpportunity()
  const updateOpp = useUpdateOpportunity()
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  async function handleCreate() {
    if (!profile?.organization_id || !newTitle.trim()) return
    try {
      await createOpp.mutateAsync({
        organization_id: profile.organization_id,
        title: newTitle.trim(),
        stage: 'prospect',
      })
      toast.success('Opportunité créée')
      setNewTitle('')
      setShowForm(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  async function handleStageChange(id: string, stage: PipelineStage) {
    try {
      await updateOpp.mutateAsync({ id, stage })
      toast.success(`Déplacé vers ${PIPELINE_STAGES[stage]}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  const byStage = ACTIVE_STAGES.reduce<Record<string, typeof opportunities>>((acc, stage) => {
    acc[stage] = opportunities?.filter((o) => o.stage === stage) ?? []
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Pipeline' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pipeline commercial</h1>
          <p className="text-muted-foreground">
            Suivez vos opportunités de vente
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle opportunité
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="opp-title">Titre de l'opportunité</Label>
                <Input
                  id="opp-title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ex: Formation Excel - Société ABC"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleCreate} disabled={createOpp.isPending || !newTitle.trim()}>
                  {createOpp.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-4">
          {ACTIVE_STAGES.map((stage) => (
            <div key={stage} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{PIPELINE_STAGES[stage]}</h3>
                <Badge variant="secondary" className="text-xs">
                  {byStage[stage]?.length ?? 0}
                </Badge>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {byStage[stage]?.map((opp) => {
                  const stageIdx = ACTIVE_STAGES.indexOf(stage)
                  const prevStage = stageIdx > 0 ? ACTIVE_STAGES[stageIdx - 1] : null
                  const nextStage = stageIdx < ACTIVE_STAGES.length - 1 ? ACTIVE_STAGES[stageIdx + 1] : null
                  return (
                    <Card key={opp.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <p className="text-sm font-medium mb-2">{opp.title}</p>
                        {opp.amount && (
                          <p className="text-sm font-bold text-primary">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(opp.amount)}
                          </p>
                        )}
                        {opp.expected_close && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Clôture : {new Date(opp.expected_close).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          {prevStage ? (
                            <button
                              onClick={() => handleStageChange(opp.id, prevStage)}
                              className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5 ${STAGE_COLORS[prevStage]} hover:opacity-80`}
                              title={`Reculer vers ${PIPELINE_STAGES[prevStage]}`}
                            >
                              <ChevronLeft className="h-3 w-3" />
                              {PIPELINE_STAGES[prevStage]}
                            </button>
                          ) : <span />}
                          {nextStage && (
                            <button
                              onClick={() => handleStageChange(opp.id, nextStage)}
                              className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5 ${STAGE_COLORS[nextStage]} hover:opacity-80`}
                              title={`Avancer vers ${PIPELINE_STAGES[nextStage]}`}
                            >
                              {PIPELINE_STAGES[nextStage]}
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
