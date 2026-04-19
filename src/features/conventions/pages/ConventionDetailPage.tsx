import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { pdf } from '@react-pdf/renderer'
import { Loader2, Download, Send, CheckCircle, XCircle, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthContext } from '@/features/auth/auth-context'
import { useConvention, useUpdateConvention } from '../hooks/use-conventions'
import { ConventionPDF } from '@/features/documents/templates/ConventionPDF'
import { toPDFOrgInfo, readOrgSettings } from '@/features/shared/pdf/org-info'
import { SendDocumentEmailDialog } from '@/features/shared/components/SendDocumentEmailDialog'
import { DocumentEmailsHistory } from '@/features/shared/components/DocumentEmailsHistory'
import { CONVENTION_STATUS_LABELS, CONVENTION_TYPE_LABELS, type ConventionStatus } from '../types'

const STATUS_VARIANT: Record<ConventionStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  sent: 'default',
  signed: 'success',
  cancelled: 'outline',
}

export function ConventionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { organization } = useAuthContext()
  const { data: convention, isLoading } = useConvention(id)
  const updateConvention = useUpdateConvention()
  const [showEmailDialog, setShowEmailDialog] = useState(false)

  const fmt = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!convention) {
    return <p className="text-center text-muted-foreground py-12">Convention non trouvée</p>
  }

  async function buildConventionPdfBlob(): Promise<Blob> {
    if (!organization || !convention) throw new Error('Convention non disponible')
    const settings = readOrgSettings(organization.settings)
    return pdf(
      <ConventionPDF
        data={{
          organization: toPDFOrgInfo(organization),
          company: {
            name: convention.companies?.name ?? '',
            siret: convention.companies?.siret ?? null,
            address: '',
          },
          formation: {
            title: convention.sessions?.formations?.title ?? 'Formation',
            objectives: convention.sessions?.formations?.objectives ?? [],
            duration_hours: convention.sessions?.formations?.duration_hours ?? null,
            teaching_methods: null,
            assessment_methods: null,
            prerequisites: null,
          },
          session: {
            start_date: convention.start_date ?? convention.sessions?.start_date ?? '',
            end_date: convention.end_date ?? convention.sessions?.end_date ?? '',
            location: '—',
            code: convention.sessions?.code ?? null,
          },
          beneficiaries: [],
          price_ht: convention.amount_ht,
          price_ttc: null,
          tva_exempt: organization.tva_exempt ?? false,
          convention_date: new Date().toISOString().slice(0, 10),
          reference: convention.reference,
          legalMentions: settings.legal_mentions ?? null,
        }}
      />,
    ).toBlob()
  }

  async function handleDownloadPDF() {
    if (!convention) return
    const blob = await buildConventionPdfBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${convention.reference}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleStatusChange(status: ConventionStatus) {
    if (!convention) return
    const patch: Record<string, unknown> = { status }
    if (status === 'sent') patch.sent_at = new Date().toISOString()
    if (status === 'signed') patch.signed_at = new Date().toISOString()
    try {
      await updateConvention.mutateAsync({ id: convention.id, ...patch })
      toast.success(`Convention marquée ${CONVENTION_STATUS_LABELS[status].toLowerCase()}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Conventions', href: '/dashboard/conventions' }, { label: convention.reference }]} />

      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{convention.reference}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={STATUS_VARIANT[convention.status] ?? 'secondary'}>
              {CONVENTION_STATUS_LABELS[convention.status]}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {CONVENTION_TYPE_LABELS[convention.type]} · {convention.companies?.name ?? '—'}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowEmailDialog(true)}>
            <Mail className="mr-2 h-4 w-4" />
            Envoyer
          </Button>
          {convention.status === 'draft' && (
            <Button size="sm" onClick={() => handleStatusChange('sent')}>
              <Send className="mr-2 h-4 w-4" />
              Envoyer pour signature
            </Button>
          )}
          {convention.status === 'sent' && (
            <>
              <Button size="sm" onClick={() => handleStatusChange('signed')}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Marquer signée
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleStatusChange('cancelled')}>
                <XCircle className="mr-2 h-4 w-4" />
                Annuler
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm text-muted-foreground">Montant HT</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{fmt(convention.amount_ht)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm text-muted-foreground">Période</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {convention.start_date ? new Date(convention.start_date).toLocaleDateString('fr-FR') : '—'}
              {' → '}
              {convention.end_date ? new Date(convention.end_date).toLocaleDateString('fr-FR') : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Formation</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p className="font-medium">{convention.sessions?.formations?.title ?? 'Formation non liée'}</p>
          {convention.sessions?.formations?.duration_hours && (
            <p className="text-muted-foreground">Durée : {convention.sessions.formations.duration_hours}h</p>
          )}
          {convention.funding_type && (
            <p className="text-muted-foreground">Financement : {convention.funding_type}</p>
          )}
        </CardContent>
      </Card>

      {convention.terms && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conditions particulières</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{convention.terms}</p>
          </CardContent>
        </Card>
      )}

      {convention.signed_at && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Signature</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>Signée le {new Date(convention.signed_at).toLocaleDateString('fr-FR')}</p>
            {convention.signed_by_name && <p>Par {convention.signed_by_name}</p>}
          </CardContent>
        </Card>
      )}

      <DocumentEmailsHistory documentType="convention" documentId={convention.id} />

      <SendDocumentEmailDialog
        open={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        documentType="convention"
        documentId={convention.id}
        pdfFilename={`${convention.reference}.pdf`}
        buildPdfBlob={buildConventionPdfBlob}
        defaultTo={null}
        defaultSubject={`Convention ${convention.reference} — ${organization?.name ?? ''}`}
        defaultBody={`Bonjour,\n\nVeuillez trouver ci-joint la convention de formation ${convention.reference}.\n\nMerci de bien vouloir la retourner signée.\n\nCordialement,\n${organization?.name ?? ''}`}
      />
    </div>
  )
}
