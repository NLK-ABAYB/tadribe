import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { pdf } from '@react-pdf/renderer'
import { Loader2, Download, Send, Plus, CreditCard } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthContext } from '@/features/auth/auth-context'
import { useInvoice, useInvoiceLines, useUpdateInvoice } from '../hooks/use-invoices'
import { usePayments, useCreatePayment } from '../hooks/use-payments'
import { InvoiceWorkflow } from '../components/InvoiceWorkflow'
import { InvoicePDF } from '../templates/InvoicePDF'
import { INVOICE_STATUSES } from '@/lib/constants'

function getWorkflowStep(status: string | null): string {
  if (status === 'brouillon') return 'devis'
  if (status === 'emise' || status === 'envoyee') return 'facture'
  if (status === 'payee' || status === 'payee_partiellement') return 'paiement'
  return 'convention'
}

const PAYMENT_METHODS = [
  { value: 'virement', label: 'Virement' },
  { value: 'cheque', label: 'Chèque' },
  { value: 'cb', label: 'Carte bancaire' },
  { value: 'prelevement', label: 'Prélèvement' },
  { value: 'especes', label: 'Espèces' },
  { value: 'autre', label: 'Autre' },
]

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { profile, organization } = useAuthContext()
  const { data: invoice, isLoading } = useInvoice(id)
  const { data: lines } = useInvoiceLines(id)
  const { data: payments } = usePayments(id)
  const updateInvoice = useUpdateInvoice()
  const createPayment = useCreatePayment()

  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0])
  const [payMethod, setPayMethod] = useState('virement')
  const [payRef, setPayRef] = useState('')
  const [payPayer, setPayPayer] = useState('')

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

  async function handleDownloadPDF() {
    if (!invoice || !lines || !organization) return
    try {
      const blob = await pdf(
        <InvoicePDF
          invoice={{
            invoice_number: invoice.invoice_number,
            issue_date: invoice.issue_date,
            due_date: invoice.due_date,
            total_ht: invoice.total_ht,
            tva_rate: invoice.tva_rate,
            tva_amount: invoice.tva_amount,
            total_ttc: invoice.total_ttc,
            amount_paid: invoice.amount_paid,
            nda_mention: invoice.nda_mention,
            tva_mention: invoice.tva_mention,
            recipient_name: invoice.recipient_name,
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
        />,
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${invoice.invoice_number}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error('Erreur lors de la génération du PDF')
    }
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
    try {
      await updateInvoice.mutateAsync({ id: invoice.id, status: next } as never)
      toast.success(`Statut mis à jour : ${INVOICE_STATUSES[next as keyof typeof INVOICE_STATUSES]}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  async function handleAddPayment() {
    if (!invoice || !profile?.organization_id) return
    const amount = parseFloat(payAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Montant invalide')
      return
    }
    try {
      await createPayment.mutateAsync({
        organization_id: profile.organization_id,
        invoice_id: invoice.id,
        amount,
        payment_date: payDate,
        payment_method: payMethod,
        reference: payRef || null,
        payer_name: payPayer || invoice.recipient_name,
      })
      toast.success('Paiement enregistré')
      setShowPaymentForm(false)
      setPayAmount('')
      setPayRef('')
      setPayPayer('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement')
    }
  }

  const amountPaid = invoice.amount_paid ?? 0
  const remaining = invoice.total_ttc - amountPaid

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Factures', href: '/dashboard/factures' }, { label: invoice.invoice_number }]} />
      <div className="flex items-center gap-4">
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
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
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

      {/* Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Paiements ({payments?.length ?? 0})
          </CardTitle>
          {remaining > 0 && (
            <Button size="sm" variant="outline" onClick={() => setShowPaymentForm(!showPaymentForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Enregistrer un paiement
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {showPaymentForm && (
            <div className="mb-4 p-4 border rounded-md space-y-3 bg-muted/30">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Montant *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={formatCurrency(remaining)}
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date *</Label>
                  <Input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Méthode</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Référence</Label>
                  <Input
                    placeholder="ex: VIR-2026-001"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Payeur</Label>
                <Input
                  placeholder={invoice.recipient_name}
                  value={payPayer}
                  onChange={(e) => setPayPayer(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowPaymentForm(false)}>
                  Annuler
                </Button>
                <Button size="sm" onClick={handleAddPayment} disabled={createPayment.isPending}>
                  {createPayment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Valider
                </Button>
              </div>
            </div>
          )}
          {payments && payments.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-left">Méthode</th>
                  <th className="py-2 text-left">Référence</th>
                  <th className="py-2 text-left">Payeur</th>
                  <th className="py-2 text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2">{new Date(p.payment_date).toLocaleDateString('fr-FR')}</td>
                    <td className="py-2">{PAYMENT_METHODS.find((m) => m.value === p.payment_method)?.label ?? p.payment_method ?? '—'}</td>
                    <td className="py-2 text-muted-foreground">{p.reference ?? '—'}</td>
                    <td className="py-2">{p.payer_name ?? '—'}</td>
                    <td className="py-2 text-right font-medium text-green-600">{formatCurrency(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">Aucun paiement enregistré</p>
          )}
        </CardContent>
      </Card>

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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Liens rapides</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {invoice.company_id && (
            <Link to={`/dashboard/entreprises/${invoice.company_id}`}>
              <Button variant="outline" size="sm">Entreprise</Button>
            </Link>
          )}
          {invoice.session_id && (
            <Link to={`/dashboard/sessions/${invoice.session_id}`}>
              <Button variant="outline" size="sm">Session</Button>
            </Link>
          )}
          {invoice.funding_dossier_id && (
            <Link to={`/dashboard/financements/${invoice.funding_dossier_id}`}>
              <Button variant="outline" size="sm">Dossier financement</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
