import { Loader2, BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { INSCRIPTION_STATUSES } from '@/lib/constants'
import { useAuthContext } from '@/features/auth/auth-context'
import { useMyCompany, useCompanyEnrollments } from '../hooks/use-company-portal'

const STATUS_COLOR: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  pre_inscrit: 'secondary',
  en_attente_financement: 'warning',
  confirme: 'default',
  en_formation: 'success',
  abandonne: 'destructive',
  termine: 'outline',
  annule: 'destructive',
}

export function CompanyFormationsPage() {
  const { user } = useAuthContext()
  const { data: company, isLoading: companyLoading } = useMyCompany(user?.id)
  const { data: enrollments, isLoading: enrollLoading } = useCompanyEnrollments(company?.id)

  const isLoading = companyLoading || enrollLoading

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
        <h1 className="text-3xl font-bold tracking-tight">Formations</h1>
        <p className="text-muted-foreground">Suivi des inscriptions de vos collaborateurs</p>
      </div>

      {!enrollments?.length ? (
        <div className="flex flex-col items-center py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Aucune inscription</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Les inscriptions de vos collaborateurs apparaitront ici
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inscriptions ({enrollments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left text-sm font-medium">Collaborateur</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Formation</th>
                    <th className="px-4 py-2 text-left text-sm font-medium hidden sm:table-cell">Dates</th>
                    <th className="px-4 py-2 text-left text-sm font-medium hidden md:table-cell">Durée</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b last:border-0">
                      <td className="px-4 py-2 text-sm font-medium">
                        {enrollment.beneficiaries
                          ? `${enrollment.beneficiaries.first_name} ${enrollment.beneficiaries.last_name}`
                          : '—'}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {enrollment.sessions?.formations?.title ?? '—'}
                      </td>
                      <td className="px-4 py-2 text-sm text-muted-foreground hidden sm:table-cell">
                        {enrollment.sessions?.start_date
                          ? `${new Date(enrollment.sessions.start_date).toLocaleDateString('fr-FR')} - ${new Date(enrollment.sessions.end_date).toLocaleDateString('fr-FR')}`
                          : '—'}
                      </td>
                      <td className="px-4 py-2 text-sm text-muted-foreground hidden md:table-cell">
                        {enrollment.sessions?.formations?.duration_hours
                          ? `${enrollment.sessions.formations.duration_hours}h`
                          : '—'}
                      </td>
                      <td className="px-4 py-2">
                        {enrollment.status && (
                          <Badge variant={STATUS_COLOR[enrollment.status] ?? 'secondary'} className="text-xs">
                            {INSCRIPTION_STATUSES[enrollment.status as keyof typeof INSCRIPTION_STATUSES] ?? enrollment.status}
                          </Badge>
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
