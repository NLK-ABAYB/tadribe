import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FUNDING_TYPES, FUNDING_STATUSES } from '@/lib/constants'
import { useBeneficiaries } from '@/features/beneficiaries/hooks/use-beneficiaries'
import { useEnrollments } from '@/features/enrollments/hooks/use-enrollments'
import type { FundingDossier } from '@/lib/types/database'

const fundingSchema = z.object({
  funding_type: z.string().min(1, 'Le type est requis'),
  status: z.string().min(1),
  enrollment_id: z.string().nullable().or(z.literal('')),
  beneficiary_id: z.string().nullable().or(z.literal('')),
  company_id: z.string().nullable().or(z.literal('')),
  funder_name: z.string().nullable().or(z.literal('')),
  funder_reference: z.string().nullable().or(z.literal('')),
  amount_requested: z.coerce.number().min(0).nullable().or(z.literal('')),
  amount_granted: z.coerce.number().min(0).nullable().or(z.literal('')),
  amount_paid: z.coerce.number().min(0).nullable().or(z.literal('')),
  remainder_beneficiary: z.coerce.number().min(0).nullable().or(z.literal('')),
  remainder_company: z.coerce.number().min(0).nullable().or(z.literal('')),
  is_subrogation: z.boolean(),
  submitted_at: z.string().nullable().or(z.literal('')),
  deadline_date: z.string().nullable().or(z.literal('')),
  decision_date: z.string().nullable().or(z.literal('')),
  cpf_dossier_id: z.string().nullable().or(z.literal('')),
  cpf_reste_charge: z.coerce.number().min(0).nullable().or(z.literal('')),
  notes: z.string().nullable().or(z.literal('')),
})

type FundingFormData = z.infer<typeof fundingSchema>

interface FundingFormProps {
  defaultValues?: Partial<FundingDossier>
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
}

export function FundingForm({ defaultValues, onSubmit, isSubmitting, onCancel }: FundingFormProps) {
  const { data: beneficiaries } = useBeneficiaries()
  const { data: enrollments } = useEnrollments()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FundingFormData>({
    resolver: zodResolver(fundingSchema),
    defaultValues: {
      funding_type: defaultValues?.funding_type ?? '',
      status: defaultValues?.status ?? 'brouillon',
      enrollment_id: defaultValues?.enrollment_id ?? '',
      beneficiary_id: defaultValues?.beneficiary_id ?? '',
      company_id: defaultValues?.company_id ?? '',
      funder_name: defaultValues?.funder_name ?? '',
      funder_reference: defaultValues?.funder_reference ?? '',
      amount_requested: defaultValues?.amount_requested ?? '',
      amount_granted: defaultValues?.amount_granted ?? '',
      amount_paid: defaultValues?.amount_paid ?? '',
      remainder_beneficiary: defaultValues?.remainder_beneficiary ?? '',
      remainder_company: defaultValues?.remainder_company ?? '',
      is_subrogation: defaultValues?.is_subrogation ?? false,
      submitted_at: defaultValues?.submitted_at?.slice(0, 10) ?? '',
      deadline_date: defaultValues?.deadline_date ?? '',
      decision_date: defaultValues?.decision_date ?? '',
      cpf_dossier_id: defaultValues?.cpf_dossier_id ?? '',
      cpf_reste_charge: defaultValues?.cpf_reste_charge ?? '',
      notes: defaultValues?.notes ?? '',
    },
  })

  const fundingType = watch('funding_type')
  const isCpf = fundingType === 'cpf'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Type et statut */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Type de financement
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="funding_type">Type *</Label>
            <select
              id="funding_type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('funding_type')}
            >
              <option value="">-- Choisir --</option>
              {Object.entries(FUNDING_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            {errors.funding_type && <p className="text-sm text-destructive">{errors.funding_type.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <select
              id="status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('status')}
            >
              {Object.entries(FUNDING_STATUSES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="funder_name">Nom du financeur</Label>
            <Input id="funder_name" placeholder="ex: OPCO Atlas" {...register('funder_name')} />
          </div>
        </div>
      </fieldset>

      {/* Liaison inscription / bénéficiaire */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Liaison
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="enrollment_id">Inscription liée</Label>
            <select
              id="enrollment_id"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('enrollment_id')}
            >
              <option value="">-- Aucune --</option>
              {enrollments?.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.beneficiaries ? `${e.beneficiaries.last_name} ${e.beneficiaries.first_name}` : '—'}
                  {' — '}
                  {e.sessions?.formations?.title ?? 'Session'}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="beneficiary_id">Bénéficiaire</Label>
            <select
              id="beneficiary_id"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('beneficiary_id')}
            >
              <option value="">-- Aucun --</option>
              {beneficiaries?.map((b) => (
                <option key={b.id} value={b.id}>{b.last_name} {b.first_name}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* Montants */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Montants
        </legend>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount_requested">Montant demandé</Label>
            <Input id="amount_requested" type="number" min={0} step={0.01} {...register('amount_requested')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount_granted">Montant accordé</Label>
            <Input id="amount_granted" type="number" min={0} step={0.01} {...register('amount_granted')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount_paid">Montant payé</Label>
            <Input id="amount_paid" type="number" min={0} step={0.01} {...register('amount_paid')} />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="remainder_beneficiary">Reste à charge bénéficiaire</Label>
            <Input id="remainder_beneficiary" type="number" min={0} step={0.01} {...register('remainder_beneficiary')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="remainder_company">Reste à charge entreprise</Label>
            <Input id="remainder_company" type="number" min={0} step={0.01} {...register('remainder_company')} />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="is_subrogation" className="h-4 w-4 rounded border-gray-300" {...register('is_subrogation')} />
            <Label htmlFor="is_subrogation">Subrogation de paiement</Label>
          </div>
        </div>
      </fieldset>

      {/* CPF spécifique */}
      {isCpf && (
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            CPF — Mon Compte Formation
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpf_dossier_id">N° dossier CPF</Label>
              <Input id="cpf_dossier_id" {...register('cpf_dossier_id')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf_reste_charge">Reste à charge CPF</Label>
              <Input id="cpf_reste_charge" type="number" min={0} step={0.01} {...register('cpf_reste_charge')} />
            </div>
          </div>
        </fieldset>
      )}

      {/* Dates */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Suivi
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="funder_reference">Référence financeur</Label>
            <Input id="funder_reference" {...register('funder_reference')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="submitted_at">Date de dépôt</Label>
            <Input id="submitted_at" type="date" {...register('submitted_at')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline_date">Date limite</Label>
            <Input id="deadline_date" type="date" {...register('deadline_date')} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="decision_date">Date de décision</Label>
          <Input id="decision_date" type="date" {...register('decision_date')} className="max-w-xs" />
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          {...register('notes')}
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {defaultValues?.id ? 'Mettre à jour' : 'Créer le dossier'}
        </Button>
      </div>
    </form>
  )
}
