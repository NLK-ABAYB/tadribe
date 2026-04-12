import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, CheckCircle2, Circle, FileText, Send, BookOpenCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { INSCRIPTION_STATUSES } from '@/lib/constants'
import { useEnrollment, useUpdateEnrollment } from '../hooks/use-enrollments'
import type { InscriptionStatus } from '@/lib/types/database'

const STATUS_VARIANT: Record<InscriptionStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  pre_inscrit: 'secondary',
  en_attente_financement: 'warning',
  confirme: 'default',
  en_formation: 'success',
  abandonne: 'destructive',
  termine: 'outline',
  annule: 'destructive',
}

const WORKFLOW_STEPS = [
  { key: 'pre_inscrit', label: 'Pré-inscription', icon: Circle },
  { key: 'en_attente_financement', label: 'Financement', icon: FileText },
  { key: 'confirme', label: 'Confirmé', icon: CheckCircle2 },
  { key: 'en_formation', label: 'En formation', icon: BookOpenCheck },
  { key: 'termine', label: 'Terminé', icon: Send },
] as const

export function EnrollmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: enrollment, isLoading } = useEnrollment(id)
  const updateEnrollment = useUpdateEnrollment()
  const [updatingStatus, setUpdatingStatus] = useState(false)

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
        <p className="text-muted-foreground">Inscription introuvable</p>
      </div>
    )
  }

  const currentStepIndex = WORKFLOW_STEPS.findIndex((s) => s.key === enrollment.status)

  async function handleStatusChange(newStatus: InscriptionStatus) {
    setUpdatingStatus(true)
    try {
      await updateEnrollment.mutateAsync({ id: id!, status: newStatus })
      toast.success(`Statut mis à jour : ${INSCRIPTION_STATUSES[newStatus]}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function toggleField(field: string, value: boolean) {
    try {
      await updateEnrollment.mutateAsync({
        id: id!,
        [field]: value,
        ...(field === 'positioning_done' && value ? { positioning_date: new Date().toISOString().slice(0, 10) } : {}),
        ...(field === 'convention_signed' && value ? { convention_date: new Date().toISOString().slice(0, 10) } : {}),
        ...(field === 'convocation_sent' && value ? { convocation_date: new Date().toISOString().slice(0, 10) } : {}),
      } as Parameters<typeof updateEnrollment.mutateAsync>[0])
      toast.success('Mis à jour')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/inscriptions')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {enrollment.beneficiaries
                ? `${enrollment.beneficiaries.first_name} ${enrollment.beneficiaries.last_name}`
                : 'Inscription'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {enrollment.sessions?.formations?.title ?? 'Session'} — {enrollment.sessions?.code ?? ''}
            </p>
          </div>
        </div>
        {enrollment.status && (
          <Badge variant={STATUS_VARIANT[enrollment.status]} className="text-sm">
            {INSCRIPTION_STATUSES[enrollment.status]}
          </Badge>
        )}
      </div>

      {/* Workflow stepper */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progression de l'inscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {WORKFLOW_STEPS.map((step, i) => {
              const isActive = step.key === enrollment.status
              const isDone = i < currentStepIndex
              const Icon = step.icon
              return (
                <div key={step.key} className="flex flex-col items-center gap-1 flex-1">
                  <button
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                      isDone
                        ? 'bg-primary text-primary-foreground'
                        : isActive
                          ? 'bg-primary/20 text-primary ring-2 ring-primary'
                          : 'bg-muted text-muted-foreground'
                    }`}
                    onClick={() => !updatingStatus && handleStatusChange(step.key as InscriptionStatus)}
                    disabled={updatingStatus}
                    title={`Passer à : ${step.label}`}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                  <span className={`text-xs text-center ${isActive ? 'font-semibold' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div className="absolute" />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations session */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Session de formation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Formation</p>
              <p className="text-sm">{enrollment.sessions?.formations?.title ?? '—'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Dates</p>
                <p className="text-sm">
                  {enrollment.sessions
                    ? `${new Date(enrollment.sessions.start_date).toLocaleDateString('fr-FR')} — ${new Date(enrollment.sessions.end_date).toLocaleDateString('fr-FR')}`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Code session</p>
                <p className="text-sm font-mono">{enrollment.sessions?.code ?? '—'}</p>
              </div>
            </div>
            {enrollment.company_id && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Entreprise</p>
                <p className="text-sm">{enrollment.companies?.name ?? '—'}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Type de contrat</p>
              <p className="text-sm">{enrollment.contract_type || '—'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Bénéficiaire */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bénéficiaire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Nom</p>
              <p className="text-sm">
                {enrollment.beneficiaries
                  ? <Link to={`/beneficiaires/${enrollment.beneficiary_id}`} className="text-primary hover:underline">
                      {enrollment.beneficiaries.first_name} {enrollment.beneficiaries.last_name}
                    </Link>
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Email</p>
              <p className="text-sm">{enrollment.beneficiaries?.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Date d'inscription</p>
              <p className="text-sm">{enrollment.enrollment_date ? new Date(enrollment.enrollment_date).toLocaleDateString('fr-FR') : '—'}</p>
            </div>
            {enrollment.retraction_deadline && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Délai de rétractation</p>
                <p className="text-sm">{new Date(enrollment.retraction_deadline).toLocaleDateString('fr-FR')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Positionnement (ind. 8) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Positionnement (Ind. 8)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Positionnement réalisé</span>
              <Button
                variant={enrollment.positioning_done ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleField('positioning_done', !enrollment.positioning_done)}
              >
                {enrollment.positioning_done ? 'Fait' : 'À faire'}
              </Button>
            </div>
            {enrollment.positioning_done && enrollment.positioning_date && (
              <p className="text-xs text-muted-foreground">
                Réalisé le {new Date(enrollment.positioning_date).toLocaleDateString('fr-FR')}
              </p>
            )}
            {enrollment.positioning_notes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Notes</p>
                <p className="text-sm">{enrollment.positioning_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents transmis (ind. 9) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documents transmis (Ind. 9)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { field: 'convention_signed', label: 'Convention signée', date: enrollment.convention_date },
              { field: 'convocation_sent', label: 'Convocation envoyée', date: enrollment.convocation_date },
              { field: 'welcome_booklet_sent', label: 'Livret d\'accueil transmis', date: null },
              { field: 'rules_acknowledged', label: 'Règlement intérieur accepté', date: null },
            ].map(({ field, label, date }) => (
              <div key={field} className="flex items-center justify-between">
                <div>
                  <span className="text-sm">{label}</span>
                  {date && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(date).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
                <Button
                  variant={(enrollment as unknown as Record<string, unknown>)[field] ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleField(field, !(enrollment as unknown as Record<string, unknown>)[field])}
                >
                  {(enrollment as unknown as Record<string, unknown>)[field] ? 'Fait' : 'À faire'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notes */}
        {enrollment.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{enrollment.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
