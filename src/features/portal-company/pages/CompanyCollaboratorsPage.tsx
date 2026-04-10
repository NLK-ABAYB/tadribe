import { Loader2, Users, GraduationCap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthContext } from '@/features/auth/auth-context'
import { useMyCompany, useCompanyBeneficiaries } from '../hooks/use-company-portal'

export function CompanyCollaboratorsPage() {
  const { user } = useAuthContext()
  const { data: company, isLoading: companyLoading } = useMyCompany(user?.id)
  const { data: beneficiaries, isLoading: benefLoading } = useCompanyBeneficiaries(company?.id)

  const isLoading = companyLoading || benefLoading

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Collaborateurs</h1>
        <p className="text-muted-foreground">Salariés inscrits en formation</p>
      </div>

      {!beneficiaries?.length ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Aucun collaborateur</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Vos collaborateurs inscrits en formation apparaitront ici
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Collaborateurs ({beneficiaries.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left text-sm font-medium">Nom</th>
                    <th className="px-4 py-2 text-left text-sm font-medium hidden sm:table-cell">Email</th>
                    <th className="px-4 py-2 text-left text-sm font-medium hidden md:table-cell">Poste</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {beneficiaries.map((b) => (
                    <tr key={b.id} className="border-b last:border-0">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{b.first_name} {b.last_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-muted-foreground hidden sm:table-cell">
                        {b.email ?? '—'}
                      </td>
                      <td className="px-4 py-2 text-sm text-muted-foreground hidden md:table-cell">
                        {b.job_title ?? '—'}
                      </td>
                      <td className="px-4 py-2">
                        {b.is_apprentice ? (
                          <Badge variant="secondary">Apprenti</Badge>
                        ) : (
                          <Badge variant="outline">Salarié</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
