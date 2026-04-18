import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCompanies } from '@/features/commercial/hooks/use-companies'
import { useSessions } from '@/features/sessions/hooks/use-sessions'
import { FUNDING_TYPES } from '@/lib/constants'

const schema = z.object({
  reference: z.string().min(1, 'Référence requise'),
  company_id: z.string().min(1, 'Entreprise requise'),
  session_id: z.string().optional(),
  type: z.enum(['intra', 'inter']),
  funding_type: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  amount_ht: z.coerce.number().min(0),
  terms: z.string().optional(),
  notes: z.string().optional(),
})

export type ConventionFormData = z.infer<typeof schema>

interface ConventionFormProps {
  defaultValues?: Partial<ConventionFormData>
  onSubmit: (data: ConventionFormData) => Promise<void>
  isSubmitting?: boolean
}

export function ConventionForm({ defaultValues, onSubmit, isSubmitting }: ConventionFormProps) {
  const { data: companies } = useCompanies()
  const { data: sessions } = useSessions()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ConventionFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'inter',
      amount_ht: 0,
      company_id: '',
      session_id: '',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reference">Référence *</Label>
          <Input id="reference" readOnly className="bg-muted" {...register('reference')} />
          {errors.reference && <p className="text-sm text-destructive">{errors.reference.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <select
            id="type"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...register('type')}
          >
            <option value="inter">Inter-entreprise</option>
            <option value="intra">Intra-entreprise</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="session_id">Session</Label>
          <Controller
            control={control}
            name="session_id"
            render={({ field }) => (
              <select
                id="session_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value || undefined)}
              >
                <option value="">—</option>
                {sessions?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code ?? s.id.slice(0, 8)} · {new Date(s.start_date).toLocaleDateString('fr-FR')}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Début</Label>
          <Input id="start_date" type="date" {...register('start_date')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">Fin</Label>
          <Input id="end_date" type="date" {...register('end_date')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount_ht">Montant HT</Label>
          <Input id="amount_ht" type="number" step="0.01" {...register('amount_ht')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="funding_type">Financement</Label>
        <select
          id="funding_type"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          {...register('funding_type')}
        >
          <option value="">—</option>
          {Object.entries(FUNDING_TYPES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="terms">Conditions particulières</Label>
        <textarea
          id="terms"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          {...register('terms')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes internes</Label>
        <textarea
          id="notes"
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
