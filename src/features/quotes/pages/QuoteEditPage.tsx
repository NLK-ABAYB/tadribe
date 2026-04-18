import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { useAuthContext } from '@/features/auth/auth-context'
import { QuoteForm, type QuoteFormData } from '../components/QuoteForm'
import { useCreateQuote, useCreateQuoteLine, useNextQuoteNumber } from '../hooks/use-quotes'

export function QuoteEditPage() {
  const navigate = useNavigate()
  const { profile, organization } = useAuthContext()
  const { data: nextNumber, isLoading: loadingNumber } = useNextQuoteNumber()
  const createQuote = useCreateQuote()
  const createLine = useCreateQuoteLine()

  async function handleSubmit(data: QuoteFormData) {
    if (!profile?.organization_id) return
    try {
      const subtotal = data.lines.reduce(
        (s, l) => s + Number(l.quantity) * Number(l.unit_price_ht),
        0,
      )
      const taxAmount = subtotal * (Number(data.tax_rate) / 100)
      const totalTtc = subtotal + taxAmount

      const quote = await createQuote.mutateAsync({
        organization_id: profile.organization_id,
        company_id: data.company_id,
        quote_number: data.quote_number,
        valid_until: data.valid_until || null,
        subtotal_ht: subtotal,
        tax_rate: data.tax_rate,
        tax_amount: taxAmount,
        total_ttc: totalTtc,
        terms: data.terms || null,
        notes: data.notes || null,
        status: 'draft',
      })

      await Promise.all(
        data.lines.map((line, idx) =>
          createLine.mutateAsync({
            quote_id: quote.id,
            description: line.description,
            quantity: Number(line.quantity),
            unit_price_ht: Number(line.unit_price_ht),
            line_order: idx,
          }),
        ),
      )

      toast.success('Devis créé')
      navigate(`/dashboard/devis/${quote.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création')
    }
  }

  if (loadingNumber || !nextNumber) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Devis', href: '/dashboard/devis' }, { label: 'Nouveau' }]} />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nouveau devis</h1>
        <p className="text-muted-foreground">Créez un devis et envoyez-le à votre prospect</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <QuoteForm
            defaultValues={{ quote_number: nextNumber }}
            tvaExempt={organization?.tva_exempt ?? false}
            onSubmit={handleSubmit}
            isSubmitting={createQuote.isPending || createLine.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
