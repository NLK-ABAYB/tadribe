import { Link } from 'react-router-dom'
import { Loader2, BookOpen, Calendar, CheckCircle2, Clock, FileText, Award } from 'lucide-react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { INSCRIPTION_STATUSES } from '@/lib/constants'
import { useAuthContext } from '@/features/auth/auth-context'
import { useMyBeneficiaryProfile, useMyEnrollments } from '../hooks/use-my-enrollments'

const STATUS_COLOR: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  pre_inscrit: 'secondary',
  en_attente_financement: 'warning',
  confirme: 'default',
  en_formation: 'success',
  abandonne: 'destructive',
  termine: 'outline',
  annule: 'destructive',
}

export function LearnerDashboardPage() {
  const { user } = useAuthContext()
  const { data: beneficiary, isLoading: benefLoading } = useMyBeneficiaryProfile(user?.id)
  const { data: enrollments, isLoading: enrollmentsLoading } = useMyEnrollments(beneficiary?.id)

  const isLoading = benefLoading || enrollmentsLoading

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!beneficiary) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Profil apprenant non trouvé. Contactez votre organisme de formation.</p>
      </div>
    )
  }

  const activeEnrollments = enrollments?.filter((e) => e.status === 'en_formation' || e.status === 'confirme') ?? []
  const completedEnrollments = enrollments?.filter((e) => e.status === 'termine') ?? []
  const totalHours = enrollments?.reduce((sum, e) => sum + (e.sessions?.formations?.duration_hours ?? 0), 0) ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bonjour {beneficiary.first_name} !
        </h1>
        <p className="text-muted-foreground">Bienvenue sur votre espace formation</p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Formations</p>
                <p className="text-2xl font-bold">{enrollments?.length ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">En cours</p>
                <p className="text-2xl font-bold">{activeEnrollments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Terminées</p>
                <p className="text-2xl font-bold">{completedEnrollments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Heures</p>
                <p className="text-2xl font-bold">{totalHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active formations */}
      {activeEnrollments.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Formations en cours</h2>
          {activeEnrollments.map((enrollment) => (
            <Link key={enrollment.id} to={`/mon-espace/formations/${enrollment.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{enrollment.sessions?.formations?.title ?? 'Formation'}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                        {enrollment.sessions?.start_date && (
                          <span>
                            Du {new Date(enrollment.sessions.start_date).toLocaleDateString('fr-FR')} au{' '}
                            {new Date(enrollment.sessions.end_date).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                        {enrollment.sessions?.trainers && (
                          <span>
                            - {enrollment.sessions.trainers.first_name} {enrollment.sessions.trainers.last_name}
                          </span>
                        )}
                      </div>
                      {enrollment.sessions?.formations?.modality && (
                        <Badge variant="outline" className="mt-2">{enrollment.sessions.formations.modality}</Badge>
                      )}
                    </div>
                    <Badge variant={STATUS_COLOR[enrollment.status] ?? 'secondary'}>
                      {INSCRIPTION_STATUSES[enrollment.status]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/mon-espace/documents">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">Mes documents</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Conventions, convocations, livrets</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/mon-espace/certificats">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <Award className="h-10 w-10 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">Mes certificats</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Attestations et certificats</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/mon-espace/evaluations">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <CheckCircle2 className="h-10 w-10 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">Mes évaluations</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Questionnaires à compléter</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* All formations */}
      {enrollments && enrollments.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Toutes mes formations</h2>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left text-sm font-medium">Formation</th>
                  <th className="px-4 py-2 text-left text-sm font-medium hidden sm:table-cell">Dates</th>
                  <th className="px-4 py-2 text-left text-sm font-medium hidden md:table-cell">Durée</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b last:border-0">
                    <td className="px-4 py-2">
                      <Link to={`/mon-espace/formations/${enrollment.id}`} className="text-sm font-medium hover:underline">
                        {enrollment.sessions?.formations?.title ?? '—'}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-sm text-muted-foreground hidden sm:table-cell">
                      {enrollment.sessions?.start_date
                        ? new Date(enrollment.sessions.start_date).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="px-4 py-2 text-sm text-muted-foreground hidden md:table-cell">
                      {enrollment.sessions?.formations?.duration_hours
                        ? `${enrollment.sessions.formations.duration_hours}h`
                        : '—'}
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant={STATUS_COLOR[enrollment.status] ?? 'secondary'} className="text-xs">
                        {INSCRIPTION_STATUSES[enrollment.status]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
