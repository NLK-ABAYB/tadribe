import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCompanies } from '../hooks/use-companies'
import { useContacts } from '../hooks/use-contacts'
import { PIPELINE_STAGES } from '@/lib/constants'

const OPPORTUNITY_SOURCES = [
  { value: 'inbound_call', label: 'Appel entrant' },
  { value: 'website', label: 'Site web' },
  { value: 'referral', label: 'Referral' },
  { value: 'cold_email', label: 'Cold email' },
  { value: 'event', label: 'Événement' },
  { value: 'partner', label: 'Partenaire' },
  { value: 'other', label: 'Autre' },
] as const

const schema = z.object({
  title: z.string().min(1, 'Titre requis'),
  company_id: z.string().optional(),
  contact_id: z.string().optional(),
  stage: z.enum(['prospect', 'qualification', 'proposition', 'negociation', 'gagne', 'perdu', 'abandonne']).optional(),
  amount: z.coerce.number().min(0).optional(),
  probability: z.coerce.number().min(0).max(100).optional(),
  source: z.string().optional(),
  expected_close: z.string().optional(),
  description: z.string().optional(),
})

export type OpportunityFormData = z.infer<typeof schema>

interface OpportunityFormProps {
  defaultValues?: Partial<OpportunityFormData>
  onSubmit: (data: OpportunityFormData) => Promise<void>
  isSubmitting?: boolean
  showStage?: boolean
}

export function OpportunityForm({ defaultValues, onSubmit, isSubmitting, showStage = false }: OpportunityFormProps) {
  const { data: companies } = useCompanies()

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<OpportunityFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      stage: 'prospect',
      probability: 50,
      amount: undefined,
      company_id: '',
      contact_id: '',
      ...defaultValues,
    },
  })

  const watchedCompanyId = watch('company_id')
  const { data: contacts } = useContacts(watchedCompanyId || undefined)
  const watchedProbability = watch('probability') ?? 50

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="opp-title">Titre *</Label>
        <Input
          id="opp-title"
          placeholder="ex: Formation Excel - Société ABC"
          {...register('title')}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="opp-company">Entreprise</Label>
          <Controller
            control={control}
            name="company_id"
            render={({ field }) => (
              <select
                id="opp-company"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value || undefined)}
              >
                <option value="">—</option>
                {companies?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="opp-contact">Contact</Label>
          <Controller
            control={control}
            name="contact_id"
            render={({ field }) => (
              <select
                id="opp-contact"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value || undefined)}
                disabled={!watchedCompanyId || !contacts?.length}
              >
                <option value="">—</option>
                {contacts?.map((c) => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                ))}
              </select>
            )}
          />
        </div>
      </div>

      {showStage && (
        <div className="space-y-2">
          <Label htmlFor="opp-stage">Étape</Label>
          <select
            id="opp-stage"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...register('stage')}
          >
            {Object.entries(PIPELINE_STAGES).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="opp-amount">Montant HT (€)</Label>
          <Input id="opp-amount" type="number" step="0.01" {...register('amount')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="opp-close">Clôture prévue</Label>
          <Input id="opp-close" type="date" {...register('expected_close')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="opp-probability">
          Probabilité : <span className="font-medium">{watchedProbability}%</span>
        </Label>
        <Input
          id="opp-probability"
          type="range"
          min={0}
          max={100}
          step={5}
          {...register('probability')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="opp-source">Source</Label>
        <select
          id="opp-source"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          {...register('source')}
        >
          <option value="">—</option>
          {OPPORTUNITY_SOURCES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="opp-description">Description</Label>
        <textarea
          id="opp-description"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          {...register('description')}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enregistrer
        </Button>
      </div>
    </form>
  )
}
