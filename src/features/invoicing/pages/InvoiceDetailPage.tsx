import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Download, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useInvoice, useInvoiceLines, useUpdateInvoice } from '../hooks/use-invoices'
import { InvoiceWorkflow } from '../components/InvoiceWorkflow'
import { INVOICE_STATUSES } from '@/lib/constants'

function getWorkflowStep(status: string | null): string {
  if (status === 'brouillon') return 'devis'
  if (status === 'emise' || status === 'envoyee') return 'facture'
  if (status === 'payee' || status === 'payee_partiellement') return 'paiement'
  return 'convention'
}

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: invoice, isLoading } = useInvoice(id)
  const { data: lines } = useInvoiceLines(id)
  const updateInvoice = useUpdateInvoice()

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!invoice) {
    return <p className="text-center text-muted-foreground py-12">Facture non trouvée</p>
  }

  async function advanceStatus() {
    if (!invoice || !invoice.status) return
    const nextStatus: Record<string, string> = {
      brouillon: 'emise',
      emise: 'envoyee',
      envoyee: 'payee',
    }
    const next = nextStatus[invoice.status]
    if (!next) return
    await updateInvoice.mutateAsync({ id: invoice.id, status: next } as never)
    toast.success(`Statut mis à jour : ${INVOICE_STATUSES[next as keyof typeof INVOICE_STATUSES]}`)
  }

  const amountPaid = invoice.amount_paid ?? 0
  const remaining = invoice.total_ttc - amountPaid

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/factures">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {invoice.invoice_number}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge>
              {invoice.status ? (INVOICE_STATUSES[invoice.status as keyof typeof INVOICE_STATUSES] ?? invoice.status) : '—'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {invoice.recipient_name}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          {(invoice.status === 'brouillon' || invoice.status === 'emise' || invoice.status === 'envoyee') && (
            <Button size="sm" onClick={advanceStatus} disabled={updateInvoice.isPending}>
              <Send className="mr-2 h-4 w-4" />
              {invoice.status === 'brouillon' ? 'Émettre' : invoice.status === 'emise' ? 'Marquer envoyée' : 'Marquer payée'}
            </Button>
          )}
        </div>
      </div>

      {/* Workflow */}
      <InvoiceWorkflow currentStep={getWorkflowStep(invoice.status)} />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Émission</span>
              <span>{new Date(invoice.issue_date).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Échéance</span>
              <span>{new Date(invoice.due_date).toLocaleDateString('fr-FR')}</span>
            </div>
            {invoice.payment_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paiement</span>
                <span>{new Date(invoice.payment_date).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Montants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total HT</span>
              <span>{formatCurrency(invoice.total_ht)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">TVA ({invoice.tva_rate ?? 0}%)</span>
              <span>{formatCurrency(invoice.tva_amount ?? 0)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total TTC</span>
              <span>{formatCurrency(invoice.total_ttc)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paiement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payé</span>
              <span className="text-green-600 font-medium">{formatCurrency(amountPaid)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reste dû</span>
              <span className={remaining > 0 ? 'text-red-600 font-medium' : ''}>
                {formatCurrency(remaining)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lines */}
      {lines && lines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lignes</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="py-2 text-left">Description</th>
                  <th className="py-2 text-right w-24">Qté</th>
                  <th className="py-2 text-right w-32">Prix unit. HT</th>
                  <th className="py-2 text-right w-32">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id} className="border-b last:border-0">
                    <td className="py-2">{line.description}</td>
                    <td className="py-2 text-right">{line.quantity}</td>
                    <td className="py-2 text-right">{formatCurrency(line.unit_price_ht)}</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(line.total_ht)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Legal mentions */}
      {(invoice.nda_mention || invoice.tva_mention) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mentions légales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {invoice.nda_mention && <p>{invoice.nda_mention}</p>}
            {invoice.tva_mention && <p>{invoice.tva_mention}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
