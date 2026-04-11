import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { computeInvoiceTotals, formatEuros } from '../lib/calculations'

const lineSchema = z.object({
  description: z.string().min(1, 'Description requise'),
  quantity: z.coerce.number().min(0.01),
  unit_price_ht: z.coerce.number().min(0),
})

const invoiceSchema = z.object({
  invoice_number: z.string().min(1, 'Numéro requis'),
  invoice_type: z.enum(['facture', 'avoir', 'acompte']),
  recipient_name: z.string().min(1, 'Destinataire requis'),
  issue_date: z.string().min(1, 'Date requise'),
  due_date: z.string().min(1, 'Échéance requise'),
  tva_rate: z.coerce.number().min(0).max(100),
  nda_mention: z.string().optional(),
  tva_mention: z.string().optional(),
  notes: z.string().optional(),
  lines: z.array(lineSchema).min(1, 'Au moins une ligne'),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

interface InvoiceFormProps {
  defaultValues?: Partial<InvoiceFormData>
  tvaExempt?: boolean
  ndaNumber?: string
  onSubmit: (data: InvoiceFormData) => Promise<void>
  isSubmitting?: boolean
}

export function InvoiceForm({ defaultValues, tvaExempt = false, ndaNumber, onSubmit, isSubmitting }: InvoiceFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoice_type: 'facture',
      tva_rate: tvaExempt ? 0 : 20,
      nda_mention: ndaNumber ? `Déclaration d'activité enregistrée sous le numéro ${ndaNumber} auprès du préfet de région.` : '',
      tva_mention: tvaExempt ? 'TVA non applicable, art. 261 du CGI (organisme de formation exonéré)' : '',
      lines: [{ description: '', quantity: 1, unit_price_ht: 0 }],
      ...defaultValues,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })
  const [_preview] = useState(false)

  const watchedLines = watch('lines')
  const watchedTvaRate = watch('tva_rate')

  const { totalHt, tvaAmount, totalTtc } = computeInvoiceTotals(watchedLines, watchedTvaRate)

  const formatCurrency = formatEuros

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="invoice_number">Numéro *</Label>
          <Input id="invoice_number" placeholder="FA-2026-001" {...register('invoice_number')} />
          {errors.invoice_number && <p className="text-sm text-destructive">{errors.invoice_number.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice_type">Type</Label>
          <select
            id="invoice_type"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...register('invoice_type')}
          >
            <option value="facture">Facture</option>
            <option value="avoir">Avoir</option>
            <option value="acompte">Acompte</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="recipient_name">Destinataire *</Label>
          <Input id="recipient_name" {...register('recipient_name')} />
          {errors.recipient_name && <p className="text-sm text-destructive">{errors.recipient_name.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="issue_date">Date d'émission *</Label>
          <Input id="issue_date" type="date" {...register('issue_date')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="due_date">Date d'échéance *</Label>
          <Input id="due_date" type="date" {...register('due_date')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tva_rate">Taux TVA (%)</Label>
          <Input id="tva_rate" type="number" step="0.01" {...register('tva_rate')} />
        </div>
      </div>

      {/* Lines */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-base">Lignes de facturation</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ description: '', quantity: 1, unit_price_ht: 0 })}
          >
            <Plus className="mr-1 h-3 w-3" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
              <div className="col-span-6">Description</div>
              <div className="col-span-2">Quantité</div>
              <div className="col-span-2">Prix unit. HT</div>
              <div className="col-span-1 text-right">Total HT</div>
              <div className="col-span-1" />
            </div>
            {fields.map((field, index) => {
              const lineTotal = (watchedLines?.[index]?.quantity || 0) * (watchedLines?.[index]?.unit_price_ht || 0)
              return (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <Input
                      placeholder="Formation, prestation..."
                      {...register(`lines.${index}.description`)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" step="0.01" {...register(`lines.${index}.quantity`)} />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" step="0.01" {...register(`lines.${index}.unit_price_ht`)} />
                  </div>
                  <div className="col-span-1 text-right text-sm font-medium">
                    {formatCurrency(lineTotal)}
                  </div>
                  <div className="col-span-1 text-center">
                    {fields.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {errors.lines && <p className="text-sm text-destructive mt-2">{errors.lines.message}</p>}
        </CardContent>
      </Card>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total HT</span>
            <span className="font-medium">{formatCurrency(totalHt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">TVA ({watchedTvaRate}%)</span>
            <span>{formatCurrency(tvaAmount)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-bold text-base">
            <span>Total TTC</span>
            <span>{formatCurrency(totalTtc)}</span>
          </div>
        </div>
      </div>

      {/* Legal mentions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nda_mention">Mention NDA</Label>
          <textarea
            id="nda_mention"
            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...register('nda_mention')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tva_mention">Mention TVA</Label>
          <textarea
            id="tva_mention"
            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...register('tva_mention')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="inv-notes">Notes</Label>
        <textarea
          id="inv-notes"
          className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          {...register('notes')}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enregistrer
        </Button>
      </div>
    </form>
  )
}
