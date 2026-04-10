import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, MapPin, Monitor, Clock, User, CheckCircle2, XCircle, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { INSCRIPTION_STATUSES } from '@/lib/constants'
import { useAuthContext } from '@/features/auth/auth-context'
import { useMyBeneficiaryProfile, useMyEnrollments, useMyAttendance } from '../hooks/use-my-enrollments'

export function LearnerFormationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { data: beneficiary } = useMyBeneficiaryProfile(user?.id)
  const { data: enrollments, isLoading } = useMyEnrollments(beneficiary?.id)
  const enrollment = enrollments?.find((e) => e.id === id)
  const { data: attendance } = useMyAttendance(id)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!enrollment) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Formation introuvable</p>
      </div>
    )
  }

  const formation = enrollment.sessions?.formations
  const session = enrollment.sessions
  const presentCount = attendance?.filter((a) => a.is_present === true).length ?? 0
  const absentCount = attendance?.filter((a) => a.is_present === false).length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/mon-espace')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{formation?.title ?? 'Formation'}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge>{INSCRIPTION_STATUSES[enrollment.status]}</Badge>
            {session?.code && <span className="text-sm text-muted-foreground font-mono">{session.code}</span>}
          </div>
        </div>
      </div>

      {/* Session info */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Durée</p>
                <p className="text-sm font-semibold">{formation?.duration_hours ? `${formation.duration_hours}h` : '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {session?.is_remote ? <Monitor className="h-5 w-5 text-muted-foreground" /> : <MapPin className="h-5 w-5 text-muted-foreground" />}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Modalité</p>
                <p className="text-sm font-semibold">{session?.is_remote ? 'Distanciel' : 'Présentiel'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Formateur</p>
                <p className="text-sm font-semibold">
                  {session?.trainers ? `${session.trainers.first_name} ${session.trainers.last_name}` : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Présence</p>
                <p className="text-sm font-semibold">{presentCount}/{(attendance?.length ?? 0)} séances</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Objectifs */}
        {formation?.objectives && formation.objectives.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Objectifs de la formation</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {formation.objectives.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dates et statut</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Début</p>
                <p className="text-sm">{session?.start_date ? new Date(session.start_date).toLocaleDateString('fr-FR') : '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Fin</p>
                <p className="text-sm">{session?.end_date ? new Date(session.end_date).toLocaleDateString('fr-FR') : '—'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Inscription</p>
                <p className="text-sm">{new Date(enrollment.enrollment_date).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Positionnement</p>
                <p className="text-sm">{enrollment.positioning_done ? 'Réalisé' : 'Non réalisé'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Convention</p>
                <p className="text-sm">{enrollment.convention_signed ? 'Signée' : 'Non signée'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Convocation</p>
                <p className="text-sm">{enrollment.convocation_sent ? 'Reçue' : 'Non reçue'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance */}
      {attendance && attendance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mon émargement ({attendance.length} séances)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Badge variant="success">{presentCount} présent(e)</Badge>
              <Badge variant="destructive">{absentCount} absent(e)</Badge>
              <Badge variant="outline">{attendance.length - presentCount - absentCount} non renseigné</Badge>
            </div>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left text-sm font-medium">Date</th>
                    <th className="px-4 py-2 text-left text-sm font-medium hidden sm:table-cell">Horaires</th>
                    <th className="px-4 py-2 text-left text-sm font-medium hidden md:table-cell">Thème</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Présence</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Signé</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((a) => (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="px-4 py-2 text-sm">
                        {a.session_slots?.slot_date ? new Date(a.session_slots.slot_date).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="px-4 py-2 text-sm text-muted-foreground hidden sm:table-cell">
                        {a.session_slots?.start_time?.slice(0, 5)} - {a.session_slots?.end_time?.slice(0, 5)}
                      </td>
                      <td className="px-4 py-2 text-sm text-muted-foreground hidden md:table-cell">
                        {a.session_slots?.topic ?? '—'}
                      </td>
                      <td className="px-4 py-2">
                        {a.is_present === true && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                        {a.is_present === false && <XCircle className="h-4 w-4 text-red-600" />}
                        {a.is_present == null && <Minus className="h-4 w-4 text-muted-foreground" />}
                      </td>
                      <td className="px-4 py-2 text-sm text-muted-foreground">
                        {a.signed_at ? new Date(a.signed_at).toLocaleDateString('fr-FR') : '—'}
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
