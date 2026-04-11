import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, UserCheck, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTrainers, useCreateTrainer } from '../hooks/use-trainers'
import { useAuthContext } from '@/features/auth/auth-context'
import { TrainerForm } from '../components/TrainerForm'

export function TrainersListPage() {
  const { profile } = useAuthContext()
  const { data: trainers, isLoading } = useTrainers()
  const createTrainer = useCreateTrainer()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = trainers?.filter((t) => {
    const term = search.toLowerCase()
    return (
      t.last_name.toLowerCase().includes(term) ||
      t.first_name.toLowerCase().includes(term) ||
      t.email?.toLowerCase().includes(term) ||
      t.specialties?.some((s) => s.toLowerCase().includes(term))
    )
  })

  async function handleCreate(data: Record<string, unknown>) {
    if (!profile) return
    await createTrainer.mutateAsync({
      ...data,
      organization_id: profile.organization_id,
      first_name: data.first_name as string,
      last_name: data.last_name as string,
    } as Parameters<typeof createTrainer.mutateAsync>[0])
    toast.success('Formateur créé')
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Formateurs</h1>
          <p className="text-muted-foreground">
            Équipe pédagogique et intervenants externes
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau formateur
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nouveau formateur</CardTitle>
          </CardHeader>
          <CardContent>
            <TrainerForm
              onSubmit={handleCreate}
              isSubmitting={createTrainer.isPending}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, email ou spécialité..."
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
          <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Aucun formateur</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? 'Aucun résultat' : 'Commencez par ajouter un formateur'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((trainer) => (
            <Link key={trainer.id} to={`/formateurs/${trainer.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {trainer.first_name} {trainer.last_name}
                    </CardTitle>
                    <Badge variant={trainer.is_internal ? 'default' : 'outline'}>
                      {trainer.is_internal ? 'Interne' : 'Externe'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {trainer.email && <p>{trainer.email}</p>}
                    {trainer.phone && <p>{trainer.phone}</p>}
                    {trainer.daily_rate != null && (
                      <p>TJM: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(trainer.daily_rate)}</p>
                    )}
                  </div>
                  {trainer.specialties && trainer.specialties.length > 0 && (
                    <div className="mt-3 flex gap-1 flex-wrap">
                      {trainer.specialties.slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                      {trainer.specialties.length > 3 && (
                        <Badge variant="secondary" className="text-xs">+{trainer.specialties.length - 3}</Badge>
                      )}
                    </div>
                  )}
                  {!trainer.is_active && (
                    <Badge variant="outline" className="mt-2">Inactif</Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
