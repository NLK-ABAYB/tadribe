import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Pencil, Loader2, AlertTriangle } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QUALIFICATION_LEVELS } from '@/lib/constants'
import { useBeneficiary, useUpdateBeneficiary } from '../hooks/use-beneficiaries'
import { useEnrollments } from '@/features/enrollments/hooks/use-enrollments'
import { BeneficiaryForm } from '../components/BeneficiaryForm'

export function BeneficiaryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: beneficiary, isLoading } = useBeneficiary(id)
  const { data: allEnrollments } = useEnrollments()
  const updateBeneficiary = useUpdateBeneficiary()
  const [editing, setEditing] = useState(false)

  const enrollments = allEnrollments?.filter((e) => e.beneficiaries?.first_name === beneficiary?.first_name && e.beneficiaries?.last_name === beneficiary?.last_name)

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
        <p className="text-muted-foreground">Bénéficiaire introuvable</p>
      </div>
    )
  }

  async function handleUpdate(data: Record<string, unknown>) {
    try {
      await updateBeneficiary.mutateAsync({ id: id!, ...data } as Parameters<typeof updateBeneficiary.mutateAsync>[0])
      toast.success('Bénéficiaire mis à jour')
      setEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Bénéficiaires', href: '/dashboard/beneficiaires' }, { label: beneficiary.last_name + ' ' + beneficiary.first_name }]} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {beneficiary.first_name} {beneficiary.last_name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {beneficiary.companies?.name && (
                <span className="text-sm text-muted-foreground">{beneficiary.companies.name}</span>
              )}
              {beneficiary.is_apprentice && <Badge variant="secondary">Apprenti</Badge>}
              {beneficiary.has_disability && <Badge variant="warning">PSH</Badge>}
              {beneficiary.cpf_holder && <Badge variant="outline">CPF</Badge>}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
          <Pencil className="mr-2 h-4 w-4" />
          {editing ? 'Annuler' : 'Modifier'}
        </Button>
      </div>

      {editing ? (
        <Card>
          <CardContent className="pt-6">
            <BeneficiaryForm
              defaultValues={beneficiary}
              onSubmit={handleUpdate}
              isSubmitting={updateBeneficiary.isPending}
              onCancel={() => setEditing(false)}
            />
          </CardContent>
        </Card>
      ) : (
        <>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coordonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Email</p>
                  <p className="text-sm">{beneficiary.email || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Téléphone</p>
                  <p className="text-sm">{beneficiary.phone || '—'}</p>
                </div>
              </div>
              {beneficiary.birth_date && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Date de naissance</p>
                  <p className="text-sm">{new Date(beneficiary.birth_date).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Situation professionnelle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Entreprise</p>
                <p className="text-sm">{beneficiary.companies?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Poste</p>
                <p className="text-sm">{beneficiary.job_title || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Niveau de qualification</p>
                <p className="text-sm">
                  {beneficiary.qualification_level
                    ? QUALIFICATION_LEVELS[beneficiary.qualification_level as keyof typeof QUALIFICATION_LEVELS] ?? beneficiary.qualification_level
                    : '—'}
                </p>
              </div>
              {beneficiary.france_travail_id && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">ID France Travail</p>
                  <p className="text-sm font-mono">{beneficiary.france_travail_id}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Handicap (ind. 26) */}
          {beneficiary.has_disability && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Situation de handicap (Ind. 26)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={beneficiary.disability_consent ? 'success' : 'destructive'}>
                    {beneficiary.disability_consent ? 'Consentement RGPD donné' : 'Consentement RGPD manquant'}
                  </Badge>
                </div>
                {beneficiary.disability_details && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Aménagements</p>
                    <p className="text-sm">{beneficiary.disability_details}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Apprentissage */}
          {beneficiary.is_apprentice && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Apprentissage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Début contrat</p>
                    <p className="text-sm">
                      {beneficiary.apprentice_contract_start
                        ? new Date(beneficiary.apprentice_contract_start).toLocaleDateString('fr-FR')
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Fin contrat</p>
                    <p className="text-sm">
                      {beneficiary.apprentice_contract_end
                        ? new Date(beneficiary.apprentice_contract_end).toLocaleDateString('fr-FR')
                        : '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inscriptions */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Inscriptions aux sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollments?.length ? (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-2 text-left text-sm font-medium">Formation</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Dates</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((e) => (
                        <tr key={e.id} className="border-b last:border-0">
                          <td className="px-4 py-2 text-sm">{e.sessions?.formations?.title ?? '—'}</td>
                          <td className="px-4 py-2 text-sm text-muted-foreground">
                            {e.sessions ? `${new Date(e.sessions.start_date).toLocaleDateString('fr-FR')} — ${new Date(e.sessions.end_date).toLocaleDateString('fr-FR')}` : '—'}
                          </td>
                          <td className="px-4 py-2">
                            <Badge variant="secondary">{e.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune inscription</p>
              )}
            </CardContent>
          </Card>

          {beneficiary.notes && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{beneficiary.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Liens rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link to={`/dashboard/inscriptions?beneficiary=${beneficiary.id}`}>
              <Button variant="outline" size="sm">Inscriptions</Button>
            </Link>
            <Link to={`/dashboard/financements?beneficiary=${beneficiary.id}`}>
              <Button variant="outline" size="sm">Financements</Button>
            </Link>
          </CardContent>
        </Card>
        </>
      )}
    </div>
  )
}
