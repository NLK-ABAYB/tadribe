import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Building2, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCompanies, useCreateCompany } from '../hooks/use-companies'
import { useAuthContext } from '@/features/auth/auth-context'
import { CompanyForm } from '../components/CompanyForm'

export function CompaniesListPage() {
  const { profile } = useAuthContext()
  const { data: companies, isLoading } = useCompanies()
  const createCompany = useCreateCompany()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = companies?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.siret?.includes(search)
  )

  async function handleCreate(data: Record<string, unknown>) {
    if (!profile?.organization_id) return
    await createCompany.mutateAsync({
      ...data,
      organization_id: profile.organization_id,
    } as Parameters<typeof createCompany.mutateAsync>[0])
    toast.success('Entreprise créée')
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Entreprises</h1>
          <p className="text-muted-foreground">
            Gérez vos entreprises clientes et leurs contacts
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle entreprise
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle entreprise</CardTitle>
          </CardHeader>
          <CardContent>
            <CompanyForm
              onSubmit={handleCreate}
              isSubmitting={createCompany.isPending}
            />
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom ou SIRET..."
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
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Aucune entreprise</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? 'Aucun résultat pour cette recherche' : 'Commencez par ajouter une entreprise'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((company) => (
            <Link key={company.id} to={`/entreprises/${company.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{company.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {company.siret && <p>SIRET: {company.siret}</p>}
                    {company.email && <p>{company.email}</p>}
                    {company.naf_code && <p>NAF: {company.naf_code}</p>}
                  </div>
                  <div className="mt-3 flex gap-2">
                    {company.is_client && (
                      <Badge variant="secondary">Client</Badge>
                    )}
                    {company.is_prospect && (
                      <Badge variant="outline">Prospect</Badge>
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
