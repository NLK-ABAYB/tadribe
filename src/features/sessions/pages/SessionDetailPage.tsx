import { useParams, Link } from 'react-router-dom'
import { Loader2, MapPin, User, Calendar, Clock, Users, Video, ClipboardCheck, ClipboardList, FileText } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useSession } from '../hooks/use-sessions'
import { SESSION_STATUSES } from '@/lib/constants'

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session, isLoading } = useSession(id)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!session) {
    return <p className="text-center text-muted-foreground py-12">Session non trouvée</p>
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Sessions', href: '/dashboard/sessions' }, { label: session.formations?.title ?? session.code ?? 'Session' }]} />
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {session.formation_id ? (
              <Link to={`/dashboard/formations/${session.formation_id}`} className="hover:underline">{session.formations?.title ?? 'Session'}</Link>
            ) : (
              session.formations?.title ?? 'Session'
            )}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            {session.code && <Badge variant="outline">{session.code}</Badge>}
            {session.status && <Badge>{SESSION_STATUSES[session.status]}</Badge>}
          </div>
        </div>
        <Link to={`/dashboard/sessions/${id}/emargement`}>
          <Button variant="outline" size="sm">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Émargement
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Début</span>
              <span>{new Date(session.start_date).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fin</span>
              <span>{new Date(session.end_date).toLocaleDateString('fr-FR')}</span>
            </div>
            {session.formations?.duration_hours && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durée</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {session.formations.duration_hours}h
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {session.is_remote ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
              Lieu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {session.is_remote ? (
              <>
                <p className="font-medium">Formation à distance</p>
                {session.remote_url && (
                  <a
                    href={session.remote_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Lien de connexion
                  </a>
                )}
              </>
            ) : session.locations ? (
              <>
                <p className="font-medium">{session.locations.name}</p>
                {session.locations.capacity && (
                  <p className="text-muted-foreground">Capacité : {session.locations.capacity} places</p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Non défini</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Formateur
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {session.trainers ? (
              <div>
                <Link to={`/dashboard/formateurs/${session.trainer_id}`} className="font-medium text-primary hover:underline">
                  {session.trainers.first_name} {session.trainers.last_name}
                </Link>
                {session.trainers.email && (
                  <p className="text-muted-foreground">{session.trainers.email}</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Non assigné</p>
            )}
          </CardContent>
        </Card>
      </div>

      {session.formations?.objectives && session.formations.objectives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Objectifs de la formation</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {session.formations.objectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Participants
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {session.min_participants && `Min: ${session.min_participants}`}
            {session.max_participants && ` / Max: ${session.max_participants}`}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link to={`/dashboard/inscriptions?session=${session.id}`}>
              <Button variant="outline" size="sm">
                <ClipboardList className="mr-2 h-4 w-4" />
                Voir les inscriptions
              </Button>
            </Link>
            <Link to={`/dashboard/factures?session=${session.id}`}>
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Factures liées
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {session.notes && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-medium mb-2">Notes</h3>
            <p className="text-sm text-muted-foreground">{session.notes}</p>
          </div>
        </>
      )}
    </div>
  )
}
