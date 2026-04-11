import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, BookOpen, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ACTION_CATEGORIES, FORMATION_MODALITIES } from '@/lib/constants'
import { useFormations, useCreateFormation } from '../hooks/use-formations'
import { useAuthContext } from '@/features/auth/auth-context'
import { FormationForm } from '../components/FormationForm'
import type { ActionCategory } from '@/lib/types/database'

const CATEGORY_VARIANT: Record<ActionCategory, 'default' | 'secondary' | 'outline'> = {
  af: 'default',
  bc: 'secondary',
  vae: 'outline',
  cfa: 'secondary',
}

export function FormationsListPage() {
  const { profile } = useAuthContext()
  const { data: formations, isLoading } = useFormations()
  const createFormation = useCreateFormation()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')

  const filtered = formations?.filter((f) => {
    const term = search.toLowerCase()
    const matchesSearch =
      f.title.toLowerCase().includes(term) ||
      f.code?.toLowerCase().includes(term) ||
      false
    const matchesCategory = !categoryFilter || f.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  async function handleCreate(data: Record<string, unknown>) {
    if (!profile?.organization_id) return
    await createFormation.mutateAsync({
      ...data,
      organization_id: profile.organization_id,
      title: data.title as string,
    } as Parameters<typeof createFormation.mutateAsync>[0])
    toast.success('Formation créée')
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Formations</h1>
          <p className="text-muted-foreground">
            Catalogue des formations et programmes pédagogiques
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle formation
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle formation</CardTitle>
          </CardHeader>
          <CardContent>
            <FormationForm
              onSubmit={handleCreate}
              isSubmitting={createFormation.isPending}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre ou code..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Toutes catégories</option>
          {Object.entries(ACTION_CATEGORIES).map(([key, label]) => (
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
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Aucune formation</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search || categoryFilter ? 'Aucun résultat' : 'Commencez par créer une formation'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((formation) => (
            <Link key={formation.id} to={`/formations/${formation.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{formation.title}</CardTitle>
                    <Badge variant={CATEGORY_VARIANT[formation.category]}>
                      {ACTION_CATEGORIES[formation.category]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {formation.code && <p className="font-mono">{formation.code}</p>}
                    {formation.duration_hours && (
                      <p>{formation.duration_hours}h{formation.duration_days ? ` (${formation.duration_days}j)` : ''}</p>
                    )}
                    {formation.modality && (
                      <p>{FORMATION_MODALITIES[formation.modality as keyof typeof FORMATION_MODALITIES] ?? formation.modality}</p>
                    )}
                    {formation.price_ht != null && (
                      <p className="font-medium text-foreground">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(formation.price_ht)}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {formation.is_cpf_eligible && <Badge variant="success">CPF</Badge>}
                    {!formation.is_active && <Badge variant="outline">Inactif</Badge>}
                    {formation.satisfaction_rate != null && (
                      <Badge variant="secondary">Satisfaction: {formation.satisfaction_rate}%</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
