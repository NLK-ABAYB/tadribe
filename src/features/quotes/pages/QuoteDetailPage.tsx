import { useParams, useNavigate } from 'react-router-dom'
import { pdf } from '@react-pdf/renderer'
import { Loader2, Download, Send, CheckCircle, XCircle, FileText, Receipt } from 'lucide-react'
import { toast } from 'sonner'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthContext } from '@/features/auth/auth-context'
import { useQuote, useQuoteLines, useUpdateQuote } from '../hooks/use-quotes'
import { useCreateInvoice } from '@/features/invoicing/hooks/use-invoices'
import { useNextInvoiceNumber } from '@/features/invoicing/hooks/use-invoices'
import { QuotePDF } from '../templates/QuotePDF'
import { QUOTE_STATUS_LABELS, type QuoteStatus } from '../types'

const STATUS_VARIANT: Record<QuoteStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  sent: 'default',
  accepted: 'success',
  rejected: 'destructive',
  expired: 'outline',
  converted: 'success',
}

export function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { organization } = useAuthContext()
  const { data: quote, isLoading } = useQuote(id)
  const { data: lines } = useQuoteLines(id)
  const updateQuote = useUpdateQuote()
  const createInvoice = useCreateInvoice()
  const { data: nextInvoiceNumber } = useNextInvoiceNumber()

  const fmt = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!quote) {
    return <p className="text-center text-muted-foreground py-12">Devis non trouvé</p>
  }

  async function handleDownloadPDF() {
    if (!organization || !quote || !lines) return
    const blob = await pdf(
      <QuotePDF
        quote={{
          quote_number: quote.quote_number,
          created_at: quote.created_at,
          valid_until: quote.valid_until,
          subtotal_ht: quote.subtotal_ht,
          tax_rate: quote.tax_rate,
          tax_amount: quote.tax_amount,
          total_ttc: quote.total_ttc,
          terms: quote.terms,
        }}
        lines={lines}
        organization={{
          name: organization.name,
          siret: organization.siret,
          nda: organization.nda,
          email: organization.email,
          phone: organization.phone,
          tva_exempt: organization.tva_exempt ?? false,
        }}
        company={{
          name: quote.companies?.name ?? '',
          siret: quote.companies?.siret ?? null,
        }}
      />,
    ).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${quote.quote_number}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleStatusChange(status: QuoteStatus) {
    if (!quote) return
    const patch: Record<string, unknown> = { status }
    if (status === 'sent') patch.sent_at = new Date().toISOString()
    if (status === 'accepted') patch.accepted_at = new Date().toISOString()
    if (status === 'rejected') patch.rejected_at = new Date().toISOString()
    try {
      await updateQuote.mutateAsync({ id: quote.id, ...patch })
      toast.success(`Devis marqué ${QUOTE_STATUS_LABELS[status].toLowerCase()}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    }
  }

  async function handleConvertToInvoice() {
    if (!quote || !lines || !nextInvoiceNumber || !organization) return
    try {
      const invoice = await createInvoice.mutateAsync({
        organization_id: quote.organization_id,
        invoice_number: nextInvoiceNumber,
        company_id: quote.company_id,
        recipient_name: quote.companies?.name ?? '',
        total_ht: quote.subtotal_ht,
        tva_rate: quote.tax_rate,
        tva_amount: quote.tax_amount,
        total_ttc: quote.total_ttc,
        issue_date: new Date().toISOString().slice(0, 10),
        due_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
        status: 'brouillon',
        notes: `Converti depuis devis ${quote.quote_number}`,
      })
      await updateQuote.mutateAsync({
        id: quote.id,
        status: 'converted',
        converted_invoice_id: invoice.id,
      })
      toast.success('Converti en facture')
      navigate(`/dashboard/factures/${invoice.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la conversion')
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Devis', href: '/dashboard/devis' }, { label: quote.quote_number }]} />

      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{quote.quote_number}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={STATUS_VARIANT[quote.status] ?? 'secondary'}>
              {QUOTE_STATUS_LABELS[quote.status]}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {quote.companies?.name ?? '—'}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          {quote.status === 'draft' && (
            <Button size="sm" onClick={() => handleStatusChange('sent')}>
              <Send className="mr-2 h-4 w-4" />
              Envoyer
            </Button>
          )}
          {quote.status === 'sent' && (
            <>
              <Button size="sm" onClick={() => handleStatusChange('accepted')}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Marquer accepté
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleStatusChange('rejected')}>
                <XCircle className="mr-2 h-4 w-4" />
                Marquer refusé
              </Button>
            </>
          )}
          {quote.status === 'accepted' && (
            <Button size="sm" onClick={handleConvertToInvoice} disabled={createInvoice.isPending}>
              <Receipt className="mr-2 h-4 w-4" />
              Convertir en facture
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm text-muted-foreground">Total HT</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{fmt(quote.subtotal_ht)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm text-muted-foreground">TVA ({quote.tax_rate}%)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{fmt(quote.tax_amount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm text-muted-foreground">Total TTC</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{fmt(quote.total_ttc)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lignes du devis</CardTitle>
        </CardHeader>
        <CardContent>
          {!lines?.length ? (
            <p className="text-sm text-muted-foreground">Aucune ligne</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Description</th>
                  <th className="text-center py-2">Qté</th>
                  <th className="text-right py-2">Prix unit. HT</th>
                  <th className="text-right py-2">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id} className="border-b last:border-0">
                    <td className="py-2">{line.description}</td>
                    <td className="text-center">{line.quantity}</td>
                    <td className="text-right">{fmt(line.unit_price_ht)}</td>
                    <td className="text-right font-medium">{fmt(line.total_ht)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {quote.terms && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{quote.terms}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
