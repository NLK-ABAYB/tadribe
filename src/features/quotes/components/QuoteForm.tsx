import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCompanies } from '@/features/commercial/hooks/use-companies'

const lineSchema = z.object({
  description: z.string().min(1, 'Description requise'),
  quantity: z.coerce.number().min(0.01),
  unit_price_ht: z.coerce.number().min(0),
})

const quoteSchema = z.object({
  quote_number: z.string().min(1, 'Numéro requis'),
  company_id: z.string().min(1, 'Entreprise requise'),
  valid_until: z.string().optional(),
  tax_rate: z.coerce.number().min(0).max(100),
  terms: z.string().optional(),
  notes: z.string().optional(),
  lines: z.array(lineSchema).min(1, 'Au moins une ligne'),
})

export type QuoteFormData = z.infer<typeof quoteSchema>

interface QuoteFormProps {
  defaultValues?: Partial<QuoteFormData>
  tvaExempt?: boolean
  onSubmit: (data: QuoteFormData) => Promise<void>
  isSubmitting?: boolean
}

export function QuoteForm({ defaultValues, tvaExempt = false, onSubmit, isSubmitting }: QuoteFormProps) {
  const { data: companies } = useCompanies()

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      company_id: '',
      tax_rate: tvaExempt ? 0 : 20,
      valid_until: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      lines: [{ description: '', quantity: 1, unit_price_ht: 0 }],
      ...defaultValues,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })

  const watchedLines = watch('lines')
  const watchedTaxRate = watch('tax_rate')

  const subtotal = (watchedLines ?? []).reduce(
    (sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unit_price_ht) || 0),
    0,
  )
  const taxAmount = subtotal * ((Number(watchedTaxRate) || 0) / 100)
  const totalTtc = subtotal + taxAmount

  const fmt = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quote_number">Numéro *</Label>
          <Input id="quote_number" readOnly className="bg-muted" {...register('quote_number')} />
          {errors.quote_number && <p className="text-sm text-destructive">{errors.quote_number.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="company_id">Entreprise *</Label>
          <Controller
            control={control}
            name="company_id"
            render={({ field }) => (
              <select
                id="company_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              >
                <option value="">Sélectionner…</option>
                {companies?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          />
          {errors.company_id && <p className="text-sm text-destructive">{errors.company_id.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="valid_until">Valide jusqu'au</Label>
          <Input id="valid_until" type="date" {...register('valid_until')} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tax_rate">Taux TVA (%)</Label>
          <Input id="tax_rate" type="number" step="0.01" {...register('tax_rate')} />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <CardTitle className="text-base">Lignes du devis</CardTitle>
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
                      placeholder="Formation, prestation…"
                      {...register(`lines.${index}.description`)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" step="0.01" {...register(`lines.${index}.quantity`)} />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" step="0.01" {...register(`lines.${index}.unit_price_ht`)} />
                  </div>
                  <div className="col-span-1 text-right text-sm font-medium">{fmt(lineTotal)}</div>
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

      <div className="flex justify-end">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total HT</span>
            <span className="font-medium">{fmt(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">TVA ({watchedTaxRate}%)</span>
            <span>{fmt(taxAmount)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-bold text-base">
            <span>Total TTC</span>
            <span>{fmt(totalTtc)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="terms">Conditions</Label>
        <textarea
          id="terms"
          className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Conditions de paiement, validité, réserves…"
          {...register('terms')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quote-notes">Notes internes</Label>
        <textarea
          id="quote-notes"
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
