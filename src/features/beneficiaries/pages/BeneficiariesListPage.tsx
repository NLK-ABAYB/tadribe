import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, GraduationCap, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QUALIFICATION_LEVELS } from '@/lib/constants'
import { useBeneficiaries, useCreateBeneficiary } from '../hooks/use-beneficiaries'
import { useAuthContext } from '@/features/auth/auth-context'
import { BeneficiaryForm } from '../components/BeneficiaryForm'
import { Breadcrumb } from '@/components/layout/Breadcrumb'

export function BeneficiariesListPage() {
  const { profile } = useAuthContext()
  const { data: beneficiaries, isLoading } = useBeneficiaries()
  const createBeneficiary = useCreateBeneficiary()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = beneficiaries?.filter((b) => {
    const term = search.toLowerCase()
    return (
      b.last_name.toLowerCase().includes(term) ||
      b.first_name.toLowerCase().includes(term) ||
      b.email?.toLowerCase().includes(term) ||
      b.companies?.name?.toLowerCase().includes(term)
    )
  })

  async function handleCreate(data: Record<string, unknown>) {
    if (!profile?.organization_id) return
    try {
      await createBeneficiary.mutateAsync({
        ...data,
        organization_id: profile.organization_id,
        first_name: data.first_name as string,
        last_name: data.last_name as string,
      } as Parameters<typeof createBeneficiary.mutateAsync>[0])
      toast.success('Bénéficiaire créé')
      setShowForm(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Bénéficiaires' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bénéficiaires</h1>
          <p className="text-muted-foreground">
            Stagiaires, apprenants et apprentis
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau bénéficiaire
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nouveau bénéficiaire</CardTitle>
          </CardHeader>
          <CardContent>
            <BeneficiaryForm
              onSubmit={handleCreate}
              isSubmitting={createBeneficiary.isPending}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, email ou entreprise..."
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
          <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Aucun bénéficiaire</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? 'Aucun résultat' : 'Commencez par ajouter un bénéficiaire'}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Nom</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Entreprise</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Qualification</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      to={`/dashboard/beneficiaires/${b.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {b.last_name} {b.first_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {b.email || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {b.companies?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {b.qualification_level
                      ? QUALIFICATION_LEVELS[b.qualification_level as keyof typeof QUALIFICATION_LEVELS] ?? b.qualification_level
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {b.is_apprentice && <Badge variant="secondary">Apprenti</Badge>}
                      {b.has_disability && <Badge variant="warning">PSH</Badge>}
                      {b.cpf_holder && <Badge variant="outline">CPF</Badge>}
                    </div>
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
