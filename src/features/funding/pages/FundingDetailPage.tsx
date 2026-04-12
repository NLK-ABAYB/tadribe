import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Pencil, Loader2 } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FUNDING_TYPES, FUNDING_STATUSES } from '@/lib/constants'
import { useFundingDossier, useUpdateFundingDossier } from '../hooks/use-funding'
import { FundingForm } from '../components/FundingForm'
import type { FundingStatus } from '@/lib/types/database'

const STATUS_VARIANT: Record<FundingStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  brouillon: 'secondary',
  depose: 'default',
  en_instruction: 'warning',
  accorde: 'success',
  refuse: 'destructive',
  annule: 'destructive',
  realise: 'outline',
  paye: 'success',
}

const WORKFLOW_STEPS: { key: FundingStatus; label: string }[] = [
  { key: 'brouillon', label: 'Brouillon' },
  { key: 'depose', label: 'Déposé' },
  { key: 'en_instruction', label: 'En instruction' },
  { key: 'accorde', label: 'Accordé' },
  { key: 'realise', label: 'Réalisé' },
  { key: 'paye', label: 'Payé' },
]

export function FundingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: dossier, isLoading } = useFundingDossier(id)
  const updateDossier = useUpdateFundingDossier()
  const [editing, setEditing] = useState(false)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!dossier) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Dossier introuvable</p>
      </div>
    )
  }

  const fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
  const currentStepIndex = WORKFLOW_STEPS.findIndex((s) => s.key === dossier.status)

  async function handleUpdate(data: Record<string, unknown>) {
    try {
      await updateDossier.mutateAsync({ id: id!, ...data } as Parameters<typeof updateDossier.mutateAsync>[0])
      toast.success('Dossier mis à jour')
      setEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  async function handleStatusChange(newStatus: FundingStatus) {
    try {
      await updateDossier.mutateAsync({ id: id!, status: newStatus })
      toast.success(`Statut mis à jour : ${FUNDING_STATUSES[newStatus]}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Financements', href: '/dashboard/financements' }, { label: 'Dossier #' + (dossier.id?.slice(0, 8) ?? '') }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {FUNDING_TYPES[dossier.funding_type]}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            {dossier.funder_reference && (
              <span className="text-sm font-mono text-muted-foreground">{dossier.funder_reference}</span>
            )}
            {dossier.status && (
              <Badge variant={STATUS_VARIANT[dossier.status]}>
                {FUNDING_STATUSES[dossier.status]}
              </Badge>
            )}
            {dossier.is_subrogation && <Badge variant="outline">Subrogation</Badge>}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
          <Pencil className="mr-2 h-4 w-4" />
          {editing ? 'Annuler' : 'Modifier'}
        </Button>
      </div>

      {/* Workflow stepper */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progression du dossier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {WORKFLOW_STEPS.map((step, i) => {
              const isActive = step.key === dossier.status
              const isDone = i < currentStepIndex
              return (
                <div key={step.key} className="flex flex-col items-center gap-1 flex-1">
                  <button
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      isDone
                        ? 'bg-primary text-primary-foreground'
                        : isActive
                          ? 'bg-primary/20 text-primary ring-2 ring-primary'
                          : 'bg-muted text-muted-foreground'
                    }`}
                    onClick={() => handleStatusChange(step.key)}
                    title={`Passer à : ${step.label}`}
                  >
                    {i + 1}
                  </button>
                  <span className={`text-xs text-center ${isActive ? 'font-semibold' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {editing ? (
        <Card>
          <CardContent className="pt-6">
            <FundingForm
              defaultValues={dossier}
              onSubmit={handleUpdate}
              isSubmitting={updateDossier.isPending}
              onCancel={() => setEditing(false)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Montants */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Montants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Demandé</p>
                  <p className="text-lg font-semibold">{dossier.amount_requested != null ? fmt.format(dossier.amount_requested) : '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Accordé</p>
                  <p className="text-lg font-semibold text-green-600">{dossier.amount_granted != null ? fmt.format(dossier.amount_granted) : '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Payé</p>
                  <p className="text-lg font-semibold text-blue-600">{dossier.amount_paid != null ? fmt.format(dossier.amount_paid) : '—'}</p>
                </div>
              </div>
              {(dossier.remainder_beneficiary != null || dossier.remainder_company != null) && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">RAC bénéficiaire</p>
                    <p className="text-sm">{dossier.remainder_beneficiary != null ? fmt.format(dossier.remainder_beneficiary) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">RAC entreprise</p>
                    <p className="text-sm">{dossier.remainder_company != null ? fmt.format(dossier.remainder_company) : '—'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Financeur</p>
                <p className="text-sm">{dossier.funder_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Bénéficiaire</p>
                <p className="text-sm">
                  {dossier.beneficiaries ? `${dossier.beneficiaries.first_name} ${dossier.beneficiaries.last_name}` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Entreprise</p>
                <p className="text-sm">{dossier.companies?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Formation</p>
                <p className="text-sm">{dossier.enrollments?.sessions?.formations?.title ?? '—'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Suivi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Date de dépôt</p>
                  <p className="text-sm">{dossier.submitted_at ? new Date(dossier.submitted_at).toLocaleDateString('fr-FR') : '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Date limite</p>
                  <p className="text-sm">{dossier.deadline_date ? new Date(dossier.deadline_date).toLocaleDateString('fr-FR') : '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Date de décision</p>
                <p className="text-sm">{dossier.decision_date ? new Date(dossier.decision_date).toLocaleDateString('fr-FR') : '—'}</p>
              </div>
              {dossier.payment_date && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Date de paiement</p>
                  <p className="text-sm">{new Date(dossier.payment_date).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CPF */}
          {dossier.funding_type === 'cpf' && (dossier.cpf_dossier_id || dossier.cpf_reste_charge != null) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">CPF — Mon Compte Formation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dossier.cpf_dossier_id && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">N° dossier</p>
                    <p className="text-sm font-mono">{dossier.cpf_dossier_id}</p>
                  </div>
                )}
                {dossier.cpf_reste_charge != null && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Reste à charge</p>
                    <p className="text-sm">{fmt.format(dossier.cpf_reste_charge)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {dossier.notes && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{dossier.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Liens rapides</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {dossier.enrollment_id && (
            <Link to={`/dashboard/inscriptions/${dossier.enrollment_id}`}>
              <Button variant="outline" size="sm">Inscription</Button>
            </Link>
          )}
          {dossier.beneficiary_id && (
            <Link to={`/dashboard/beneficiaires/${dossier.beneficiary_id}`}>
              <Button variant="outline" size="sm">Bénéficiaire</Button>
            </Link>
          )}
          {dossier.company_id && (
            <Link to={`/dashboard/entreprises/${dossier.company_id}`}>
              <Button variant="outline" size="sm">Entreprise</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
