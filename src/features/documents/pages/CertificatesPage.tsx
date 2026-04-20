import { useState } from 'react'
import { Loader2, Award, FileDown } from 'lucide-react'
import { toast } from 'sonner'
import { pdf } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { useCertificates, useCreateCertificate } from '../hooks/use-certificates'
import { useEnrollments } from '@/features/enrollments/hooks/use-enrollments'
import { useAuthContext } from '@/features/auth/auth-context'
import { CertificatePDF } from '../templates/CertificatePDF'
import { toPDFOrgInfo, readOrgSettings } from '@/features/shared/pdf/org-info'
import type { CertificateWithRelations } from '../hooks/use-certificates'

export function CertificatesPage() {
  const { profile, organization } = useAuthContext()
  const { data: certificates, isLoading } = useCertificates()
  const { data: enrollments } = useEnrollments()
  const createCertificate = useCreateCertificate()
  const [generating, setGenerating] = useState(false)

  // Enrollments with status "termine" that don't have a certificate yet
  const eligibleEnrollments = enrollments?.filter(
    (e) => e.status === 'termine' && !certificates?.some((c) => c.enrollment_id === e.id)
  )

  async function handleGenerate(enrollmentId: string) {
    if (!profile?.organization_id || !organization) return
    const enrollment = enrollments?.find((e) => e.id === enrollmentId)
    if (!enrollment) return

    setGenerating(true)
    try {
      await createCertificate.mutateAsync({
        organization_id: profile.organization_id,
        enrollment_id: enrollmentId,
        certificate_type: 'realisation',
        title: `Certificat de réalisation — ${enrollment.sessions?.formations?.title ?? 'Formation'}`,
        objectives_achieved: [],
        duration_hours: null,
        start_date: enrollment.sessions?.start_date ?? null,
        end_date: enrollment.sessions?.end_date ?? null,
        issued_date: new Date().toISOString().slice(0, 10),
      })
      toast.success('Certificat généré')
    } finally {
      setGenerating(false)
    }
  }

  async function handleDownloadPDF(cert: CertificateWithRelations) {
    if (!organization) return
    const settings = readOrgSettings(organization.settings)
    const blob = await pdf(
      <CertificatePDF
        data={{
          organization: toPDFOrgInfo(organization),
          beneficiary: {
            first_name: cert.enrollments?.beneficiaries?.first_name ?? '',
            last_name: cert.enrollments?.beneficiaries?.last_name ?? '',
          },
          formation: {
            title: cert.enrollments?.sessions?.formations?.title ?? cert.title,
            objectives: cert.objectives_achieved ?? [],
            duration_hours: cert.duration_hours ?? cert.enrollments?.sessions?.formations?.duration_hours ?? null,
          },
          session: {
            start_date: cert.start_date ?? cert.enrollments?.sessions?.start_date ?? '',
            end_date: cert.end_date ?? cert.enrollments?.sessions?.end_date ?? '',
            code: cert.enrollments?.sessions?.code ?? null,
          },
          issued_date: cert.issued_date,
          objectives_achieved: cert.objectives_achieved ?? [],
          legalMentions: settings.legal_mentions ?? null,
        }}
      />
    ).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `certificat-${cert.enrollments?.beneficiaries?.last_name ?? 'cert'}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Certificats' }]} />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Certificats de réalisation</h1>
        <p className="text-muted-foreground">
          Génération et suivi des certificats (ind. 12)
        </p>
      </div>

      {/* Eligible for certificate generation */}
      {eligibleEnrollments && eligibleEnrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inscriptions terminées sans certificat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {eligibleEnrollments.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <span className="text-sm font-medium">
                      {e.beneficiaries ? `${e.beneficiaries.last_name} ${e.beneficiaries.first_name}` : '—'}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      — {e.sessions?.formations?.title ?? 'Formation'}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleGenerate(e.id)}
                    disabled={generating}
                  >
                    {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Générer certificat
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !certificates?.length ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Award className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Aucun certificat</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Les certificats seront générés pour les inscriptions terminées
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Bénéficiaire</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Formation</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date émission</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Envoi</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => (
                <tr key={cert.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium">
                    {cert.enrollments?.beneficiaries
                      ? `${cert.enrollments.beneficiaries.last_name} ${cert.enrollments.beneficiaries.first_name}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {cert.enrollments?.sessions?.formations?.title ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(cert.issued_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {cert.sent_to_beneficiary && <Badge variant="success" className="text-xs">Bénéficiaire</Badge>}
                      {cert.sent_to_funder && <Badge variant="success" className="text-xs">Financeur</Badge>}
                      {!cert.sent_to_beneficiary && !cert.sent_to_funder && (
                        <Badge variant="outline" className="text-xs">Non envoyé</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(cert)}>
                      <FileDown className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
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
