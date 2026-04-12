import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ACTION_CATEGORIES, FORMATION_MODALITIES } from '@/lib/constants'
import { useFormation, useUpdateFormation, useDeleteFormation } from '../hooks/use-formations'
import { FormationForm } from '../components/FormationForm'

export function FormationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: formation, isLoading } = useFormation(id)
  const updateFormation = useUpdateFormation()
  const deleteFormation = useDeleteFormation()
  const [editing, setEditing] = useState(false)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!formation) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Formation introuvable</p>
      </div>
    )
  }

  async function handleUpdate(data: Record<string, unknown>) {
    try {
      await updateFormation.mutateAsync({ id: id!, ...data } as Parameters<typeof updateFormation.mutateAsync>[0])
      toast.success('Formation mise à jour')
      setEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  async function handleDelete() {
    if (!confirm('Supprimer cette formation ? Cette action est irréversible.')) return
    try {
      await deleteFormation.mutateAsync(id!)
      toast.success('Formation supprimée')
      navigate('/formations')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/formations')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{formation.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              {formation.code && <span className="text-sm font-mono text-muted-foreground">{formation.code}</span>}
              <Badge>{ACTION_CATEGORIES[formation.category]}</Badge>
              {formation.is_cpf_eligible && <Badge variant="success">CPF</Badge>}
              {!formation.is_active && <Badge variant="outline">Inactif</Badge>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
            <Pencil className="mr-2 h-4 w-4" />
            {editing ? 'Annuler' : 'Modifier'}
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      {editing ? (
        <Card>
          <CardContent className="pt-6">
            <FormationForm
              defaultValues={formation}
              onSubmit={handleUpdate}
              isSubmitting={updateFormation.isPending}
              onCancel={() => setEditing(false)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Indicateur 1 : Informations publiques */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Objectifs pédagogiques (Ind. 1)</CardTitle>
            </CardHeader>
            <CardContent>
              {formation.objectives?.length ? (
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {formation.objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Non renseigné</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Public et prérequis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Public visé</p>
                <p className="text-sm">{formation.target_audience || 'Non renseigné'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Prérequis</p>
                <p className="text-sm">{formation.prerequisites || 'Aucun'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Accessibilité</p>
                <p className="text-sm">{formation.accessibility || 'Non renseigné'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Durée et tarification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Durée et tarifs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Durée</p>
                  <p className="text-sm">
                    {formation.duration_hours ? `${formation.duration_hours}h` : '—'}
                    {formation.duration_days ? ` (${formation.duration_days} jours)` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Modalité</p>
                  <p className="text-sm">
                    {formation.modality
                      ? FORMATION_MODALITIES[formation.modality as keyof typeof FORMATION_MODALITIES] ?? formation.modality
                      : '—'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Prix HT</p>
                  <p className="text-sm font-semibold">{formation.price_ht != null ? fmt.format(formation.price_ht) : '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Prix / heure</p>
                  <p className="text-sm">{formation.price_per_hour != null ? fmt.format(formation.price_per_hour) : '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Délai d'accès</p>
                <p className="text-sm">{formation.access_delay || '—'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Indicateur 2 : Résultats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Indicateurs de résultats (Ind. 2)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Satisfaction', value: formation.satisfaction_rate },
                  { label: 'Réussite', value: formation.success_rate },
                  { label: 'Complétion', value: formation.completion_rate },
                  { label: 'Insertion', value: formation.insertion_rate },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-medium text-muted-foreground uppercase">{label}</p>
                    <p className="text-lg font-semibold">{value != null ? `${value}%` : '—'}</p>
                  </div>
                ))}
              </div>
              {formation.results_updated_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  Mis à jour le {new Date(formation.results_updated_at).toLocaleDateString('fr-FR')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Indicateur 6 : Pédagogie */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Pédagogie (Ind. 6)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Méthodes pédagogiques</p>
                  <p className="text-sm whitespace-pre-wrap">{formation.teaching_methods || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Modalités d'évaluation</p>
                  <p className="text-sm whitespace-pre-wrap">{formation.assessment_methods || 'Non renseigné'}</p>
                </div>
              </div>
              {formation.pedagogical_scenario && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Scénario pédagogique</p>
                  <p className="text-sm whitespace-pre-wrap">{formation.pedagogical_scenario}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
