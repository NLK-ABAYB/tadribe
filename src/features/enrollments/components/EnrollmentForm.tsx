import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { INSCRIPTION_STATUSES } from '@/lib/constants'
import { useBeneficiaries } from '@/features/beneficiaries/hooks/use-beneficiaries'
import { useSessions } from '@/features/sessions/hooks/use-sessions'
import type { Enrollment, InscriptionStatus } from '@/lib/types/database'

const enrollmentSchema = z.object({
  session_id: z.string().min(1, 'La session est requise'),
  beneficiary_id: z.string().min(1, 'Le bénéficiaire est requis'),
  company_id: z.string().nullable().or(z.literal('')),
  status: z.string().min(1) as z.ZodType<InscriptionStatus>,
  enrollment_date: z.string().min(1, 'La date est requise'),
  contract_type: z.string().nullable().or(z.literal('')),
  notes: z.string().nullable().or(z.literal('')),
})

type EnrollmentFormData = z.infer<typeof enrollmentSchema>

interface EnrollmentFormProps {
  defaultValues?: Partial<Enrollment>
  sessionId?: string
  onSubmit: (data: EnrollmentFormData) => Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
}

export function EnrollmentForm({ defaultValues, sessionId, onSubmit, isSubmitting, onCancel }: EnrollmentFormProps) {
  const { data: beneficiaries } = useBeneficiaries()
  const { data: sessions } = useSessions()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      session_id: defaultValues?.session_id ?? sessionId ?? '',
      beneficiary_id: defaultValues?.beneficiary_id ?? '',
      company_id: defaultValues?.company_id ?? '',
      status: defaultValues?.status ?? 'pre_inscrit',
      enrollment_date: defaultValues?.enrollment_date ?? new Date().toISOString().slice(0, 10),
      contract_type: defaultValues?.contract_type ?? '',
      notes: defaultValues?.notes ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="session_id">Session *</Label>
          <select
            id="session_id"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...register('session_id')}
          >
            <option value="">-- Choisir une session --</option>
            {sessions?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.formations?.title ?? 'Session'} — {new Date(s.start_date).toLocaleDateString('fr-FR')}
              </option>
            ))}
          </select>
          {errors.session_id && <p className="text-sm text-destructive">{errors.session_id.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="beneficiary_id">Bénéficiaire *</Label>
          <select
            id="beneficiary_id"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...register('beneficiary_id')}
          >
            <option value="">-- Choisir un bénéficiaire --</option>
            {beneficiaries?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.last_name} {b.first_name}
                {b.companies ? ` (${b.companies.name})` : ''}
              </option>
            ))}
          </select>
          {errors.beneficiary_id && <p className="text-sm text-destructive">{errors.beneficiary_id.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Statut</Label>
          <select
            id="status"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...register('status')}
          >
            {Object.entries(INSCRIPTION_STATUSES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="enrollment_date">Date d'inscription *</Label>
          <Input id="enrollment_date" type="date" {...register('enrollment_date')} />
          {errors.enrollment_date && <p className="text-sm text-destructive">{errors.enrollment_date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contract_type">Type de contrat</Label>
          <select
            id="contract_type"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...register('contract_type')}
          >
            <option value="">-- Choisir --</option>
            <option value="convention_entreprise">Convention entreprise</option>
            <option value="contrat_individuel">Contrat individuel</option>
            <option value="contrat_apprentissage">Contrat d'apprentissage</option>
            <option value="contrat_pro">Contrat de professionnalisation</option>
          </select>
        </div>
      </div>

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
          {defaultValues?.id ? 'Mettre à jour' : 'Inscrire le bénéficiaire'}
        </Button>
      </div>
    </form>
  )
}
