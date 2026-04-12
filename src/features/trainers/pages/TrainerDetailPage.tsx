import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Pencil, Loader2 } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTrainer, useTrainerCompetencies, useUpdateTrainer } from '../hooks/use-trainers'
import { TrainerForm } from '../components/TrainerForm'

export function TrainerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: trainer, isLoading } = useTrainer(id)
  const { data: competencies } = useTrainerCompetencies(id)
  const updateTrainer = useUpdateTrainer()
  const [editing, setEditing] = useState(false)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!trainer) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Formateur introuvable</p>
      </div>
    )
  }

  async function handleUpdate(data: Record<string, unknown>) {
    try {
      await updateTrainer.mutateAsync({ id: id!, ...data } as Parameters<typeof updateTrainer.mutateAsync>[0])
      toast.success('Formateur mis à jour')
      setEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Formateurs', href: '/formateurs' }, { label: trainer.first_name + ' ' + trainer.last_name }]} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {trainer.first_name} {trainer.last_name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={trainer.is_internal ? 'default' : 'outline'}>
                {trainer.is_internal ? 'Formateur interne' : 'Formateur externe'}
              </Badge>
              {!trainer.is_active && <Badge variant="destructive">Inactif</Badge>}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
          <Pencil className="mr-2 h-4 w-4" />
          {editing ? 'Annuler' : 'Modifier'}
        </Button>
      </div>

      {editing ? (
        <Card>
          <CardContent className="pt-6">
            <TrainerForm
              defaultValues={trainer}
              onSubmit={handleUpdate}
              isSubmitting={updateTrainer.isPending}
              onCancel={() => setEditing(false)}
            />
          </CardContent>
        </Card>
      ) : (
        <>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coordonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Email</p>
                <p className="text-sm">{trainer.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Téléphone</p>
                <p className="text-sm">{trainer.phone || '—'}</p>
              </div>
              {trainer.cv_url && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">CV</p>
                  <a href={trainer.cv_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    Voir le CV
                  </a>
                  {trainer.cv_updated_at && (
                    <p className="text-xs text-muted-foreground">
                      Mis à jour le {new Date(trainer.cv_updated_at).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tarification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Taux horaire</p>
                  <p className="text-lg font-semibold">
                    {trainer.hourly_rate != null ? fmt.format(trainer.hourly_rate) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Taux journalier</p>
                  <p className="text-lg font-semibold">
                    {trainer.daily_rate != null ? fmt.format(trainer.daily_rate) : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Spécialités</CardTitle>
            </CardHeader>
            <CardContent>
              {trainer.specialties && trainer.specialties.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {trainer.specialties.map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune spécialité renseignée</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compétences validées (Ind. 21)</CardTitle>
            </CardHeader>
            <CardContent>
              {competencies?.length ? (
                <div className="space-y-2">
                  {competencies.map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-sm">
                      <span>{c.formations?.title ?? 'Formation'}</span>
                      <Badge variant={c.validated ? 'success' : 'outline'}>
                        {c.validated ? 'Validée' : 'En attente'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune compétence enregistrée</p>
              )}
            </CardContent>
          </Card>

          {trainer.bio && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Biographie</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{trainer.bio}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Liens rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link to={`/sessions?trainer=${trainer.id}`}>
              <Button variant="outline" size="sm">Sessions</Button>
            </Link>
          </CardContent>
        </Card>
        </>
      )}
    </div>
  )
}
