import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QUALIFICATION_LEVELS } from '@/lib/constants'
import { useCompanies } from '@/features/commercial/hooks/use-companies'
import type { Beneficiary } from '@/lib/types/database'

const beneficiarySchema = z.object({
  first_name: z.string().min(1, 'Le prénom est requis'),
  last_name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide').nullable().or(z.literal('')),
  phone: z.string().nullable().or(z.literal('')),
  birth_date: z.string().nullable().or(z.literal('')),
  company_id: z.string().nullable().or(z.literal('')),
  job_title: z.string().nullable().or(z.literal('')),
  qualification_level: z.string().nullable().or(z.literal('')),
  // Handicap (ind. 26)
  has_disability: z.boolean(),
  disability_details: z.string().nullable().or(z.literal('')),
  disability_consent: z.boolean(),
  // Apprentissage
  is_apprentice: z.boolean(),
  apprentice_contract_start: z.string().nullable().or(z.literal('')),
  apprentice_contract_end: z.string().nullable().or(z.literal('')),
  // Métadonnées
  france_travail_id: z.string().nullable().or(z.literal('')),
  cpf_holder: z.boolean(),
  notes: z.string().nullable().or(z.literal('')),
})

type BeneficiaryFormData = z.infer<typeof beneficiarySchema>

interface BeneficiaryFormProps {
  defaultValues?: Partial<Beneficiary>
  onSubmit: (data: BeneficiaryFormData) => Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
}

export function BeneficiaryForm({ defaultValues, onSubmit, isSubmitting, onCancel }: BeneficiaryFormProps) {
  const { data: companies } = useCompanies()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      first_name: defaultValues?.first_name ?? '',
      last_name: defaultValues?.last_name ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      birth_date: defaultValues?.birth_date ?? '',
      company_id: defaultValues?.company_id ?? '',
      job_title: defaultValues?.job_title ?? '',
      qualification_level: defaultValues?.qualification_level ?? '',
      has_disability: defaultValues?.has_disability ?? false,
      disability_details: defaultValues?.disability_details ?? '',
      disability_consent: defaultValues?.disability_consent ?? false,
      is_apprentice: defaultValues?.is_apprentice ?? false,
      apprentice_contract_start: defaultValues?.apprentice_contract_start ?? '',
      apprentice_contract_end: defaultValues?.apprentice_contract_end ?? '',
      france_travail_id: defaultValues?.france_travail_id ?? '',
      cpf_holder: defaultValues?.cpf_holder ?? false,
      notes: defaultValues?.notes ?? '',
    },
  })

  const hasDisability = watch('has_disability')
  const isApprentice = watch('is_apprentice')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Identité */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Identité
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="last_name">Nom *</Label>
            <Input id="last_name" {...register('last_name')} />
            {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="first_name">Prénom *</Label>
            <Input id="first_name" {...register('first_name')} />
            {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" {...register('phone')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birth_date">Date de naissance</Label>
            <Input id="birth_date" type="date" {...register('birth_date')} />
          </div>
        </div>
      </fieldset>

      {/* Situation professionnelle */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Situation professionnelle
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_id">Entreprise</Label>
            <select
              id="company_id"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register('company_id')}
            >
              <option value="">-- Aucune --</option>
              {companies?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="job_title">Poste occupé</Label>
            <Input id="job_title" {...register('job_title')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qualification_level">Niveau de qualification</Label>
            <select
              id="qualification_level"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register('qualification_level')}
            >
              <option value="">-- Choisir --</option>
              {Object.entries(QUALIFICATION_LEVELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="france_travail_id">Identifiant France Travail</Label>
            <Input id="france_travail_id" {...register('france_travail_id')} />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="cpf_holder"
              className="h-4 w-4 rounded border-gray-300"
              {...register('cpf_holder')}
            />
            <Label htmlFor="cpf_holder">Titulaire CPF</Label>
          </div>
        </div>
      </fieldset>

      {/* Handicap (ind. 26) */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Situation de handicap (Ind. 26)
        </legend>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="has_disability"
            className="h-4 w-4 rounded border-gray-300"
            {...register('has_disability')}
          />
          <Label htmlFor="has_disability">Personne en situation de handicap</Label>
        </div>
        {hasDisability && (
          <>
            <div className="flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 p-3">
              <input
                type="checkbox"
                id="disability_consent"
                className="h-4 w-4 rounded border-gray-300"
                {...register('disability_consent')}
              />
              <Label htmlFor="disability_consent" className="text-sm">
                Le bénéficiaire consent au traitement de ses données de handicap (RGPD)
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="disability_details">Détails / aménagements nécessaires</Label>
              <textarea
                id="disability_details"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...register('disability_details')}
              />
            </div>
          </>
        )}
      </fieldset>

      {/* Apprentissage */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Apprentissage
        </legend>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_apprentice"
            className="h-4 w-4 rounded border-gray-300"
            {...register('is_apprentice')}
          />
          <Label htmlFor="is_apprentice">Apprenti</Label>
        </div>
        {isApprentice && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="apprentice_contract_start">Début du contrat</Label>
              <Input id="apprentice_contract_start" type="date" {...register('apprentice_contract_start')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apprentice_contract_end">Fin du contrat</Label>
              <Input id="apprentice_contract_end" type="date" {...register('apprentice_contract_end')} />
            </div>
          </div>
        )}
      </fieldset>

      {/* Notes */}
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
          {defaultValues?.id ? 'Mettre à jour' : 'Créer le bénéficiaire'}
        </Button>
      </div>
    </form>
  )
}
