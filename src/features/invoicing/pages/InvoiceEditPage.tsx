import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InvoiceForm } from '../components/InvoiceForm'
import { InvoiceWorkflow } from '../components/InvoiceWorkflow'
import { useCreateInvoice } from '../hooks/use-invoices'
import { useAuthContext } from '@/features/auth/auth-context'

export function InvoiceEditPage() {
  const { profile, organization } = useAuthContext()
  const createInvoice = useCreateInvoice()
  const navigate = useNavigate()

  async function handleSubmit(data: Record<string, unknown>) {
    if (!profile?.organization_id) return
    const lines = data.lines as Array<{ description: string; quantity: number; unit_price_ht: number }>
    const totalHt = lines.reduce((sum, l) => sum + l.quantity * l.unit_price_ht, 0)
    const tvaRate = (data.tva_rate as number) || 0
    const tvaAmount = totalHt * tvaRate / 100
    const totalTtc = totalHt + tvaAmount

    try {
      await createInvoice.mutateAsync({
        organization_id: profile.organization_id,
        invoice_number: data.invoice_number as string,
        invoice_type: data.invoice_type as string,
        recipient_name: data.recipient_name as string,
        issue_date: data.issue_date as string,
        due_date: data.due_date as string,
        total_ht: totalHt,
        tva_rate: tvaRate,
        tva_amount: tvaAmount,
        total_ttc: totalTtc,
        nda_mention: (data.nda_mention as string) || null,
        tva_mention: (data.tva_mention as string) || null,
        notes: (data.notes as string) || null,
      } as never)
      toast.success('Facture créée')
      navigate('/factures')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nouvelle facture</h1>
        <p className="text-muted-foreground">
          Créez un devis ou une facture au format légal français
        </p>
      </div>

      <InvoiceWorkflow currentStep="devis" />

      <Card>
        <CardHeader>
          <CardTitle>Détails de la facture</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceForm
            tvaExempt={organization?.tva_exempt ?? false}
            ndaNumber={organization?.nda ?? undefined}
            onSubmit={handleSubmit}
            isSubmitting={createInvoice.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
