import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ACTION_CATEGORIES, FORMATION_MODALITIES } from '@/lib/constants'
import type { Formation } from '@/lib/types/database'

const formationSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  code: z.string().nullable().or(z.literal('')),
  category: z.enum(['af', 'bc', 'vae', 'cfa']),
  objectives: z.string(),
  prerequisites: z.string().nullable().or(z.literal('')),
  target_audience: z.string().nullable().or(z.literal('')),
  duration_hours: z.coerce.number().min(0).nullable().or(z.literal('')),
  duration_days: z.coerce.number().min(0).nullable().or(z.literal('')),
  modality: z.string().nullable().or(z.literal('')),
  teaching_methods: z.string().nullable().or(z.literal('')),
  assessment_methods: z.string().nullable().or(z.literal('')),
  accessibility: z.string().nullable().or(z.literal('')),
  access_delay: z.string().nullable().or(z.literal('')),
  price_ht: z.coerce.number().min(0).nullable().or(z.literal('')),
  price_per_hour: z.coerce.number().min(0).nullable().or(z.literal('')),
  is_cpf_eligible: z.boolean(),
  mcf_id: z.string().nullable().or(z.literal('')),
  pedagogical_scenario: z.string().nullable().or(z.literal('')),
})

type FormationFormData = z.infer<typeof formationSchema>

interface FormationFormProps {
  defaultValues?: Partial<Formation>
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
}

export function FormationForm({ defaultValues, onSubmit, isSubmitting, onCancel }: FormationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormationFormData>({
    resolver: zodResolver(formationSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      code: defaultValues?.code ?? '',
      category: defaultValues?.category ?? 'af',
      objectives: defaultValues?.objectives?.join('\n') ?? '',
      prerequisites: defaultValues?.prerequisites ?? '',
      target_audience: defaultValues?.target_audience ?? '',
      duration_hours: defaultValues?.duration_hours ?? '',
      duration_days: defaultValues?.duration_days ?? '',
      modality: defaultValues?.modality ?? '',
      teaching_methods: defaultValues?.teaching_methods ?? '',
      assessment_methods: defaultValues?.assessment_methods ?? '',
      accessibility: defaultValues?.accessibility ?? '',
      access_delay: defaultValues?.access_delay ?? '',
      price_ht: defaultValues?.price_ht ?? '',
      price_per_hour: defaultValues?.price_per_hour ?? '',
      is_cpf_eligible: defaultValues?.is_cpf_eligible ?? false,
      mcf_id: defaultValues?.mcf_id ?? '',
      pedagogical_scenario: defaultValues?.pedagogical_scenario ?? '',
    } as never,
  })

  return (
    <form onSubmit={handleSubmit((data) => onSubmit({ ...data, objectives: data.objectives ? data.objectives.split('\n').filter(Boolean) : [] }))} className="space-y-6">
      {/* Informations générales */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Informations générales
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre de la formation *</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Code interne</Label>
            <Input id="code" placeholder="ex: FORM-001" {...register('code')} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie d'action *</Label>
            <select
              id="category"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register('category')}
            >
              {Object.entries(ACTION_CATEGORIES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="modality">Modalité</Label>
            <select
              id="modality"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register('modality')}
            >
              <option value="">-- Choisir --</option>
              {Object.entries(FORMATION_MODALITIES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* Indicateur 1 : Objectifs et public */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Objectifs et public (Ind. 1)
        </legend>
        <div className="space-y-2">
          <Label htmlFor="objectives">Objectifs pédagogiques (un par ligne)</Label>
          <textarea
            id="objectives"
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Être capable de..."
            {...register('objectives')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prerequisites">Prérequis</Label>
            <textarea
              id="prerequisites"
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register('prerequisites')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_audience">Public visé</Label>
            <textarea
              id="target_audience"
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register('target_audience')}
            />
          </div>
        </div>
      </fieldset>

      {/* Durée et tarification */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Durée et tarification
        </legend>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration_hours">Durée (heures)</Label>
            <Input id="duration_hours" type="number" min={0} step={0.5} {...register('duration_hours')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration_days">Durée (jours)</Label>
            <Input id="duration_days" type="number" min={0} step={0.5} {...register('duration_days')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price_ht">Prix HT</Label>
            <Input id="price_ht" type="number" min={0} step={0.01} {...register('price_ht')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price_per_hour">Prix / heure</Label>
            <Input id="price_per_hour" type="number" min={0} step={0.01} {...register('price_per_hour')} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="access_delay">Délai d'accès</Label>
          <Input id="access_delay" placeholder="ex: 15 jours avant le début" {...register('access_delay')} />
        </div>
      </fieldset>

      {/* Indicateur 6 : Pédagogie */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Pédagogie (Ind. 6)
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="teaching_methods">Méthodes pédagogiques</Label>
            <textarea
              id="teaching_methods"
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register('teaching_methods')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assessment_methods">Modalités d'évaluation</Label>
            <textarea
              id="assessment_methods"
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register('assessment_methods')}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pedagogical_scenario">Scénario pédagogique</Label>
          <textarea
            id="pedagogical_scenario"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...register('pedagogical_scenario')}
          />
        </div>
      </fieldset>

      {/* Accessibilité et CPF */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Accessibilité et référencement
        </legend>
        <div className="space-y-2">
          <Label htmlFor="accessibility">Accessibilité (handicap)</Label>
          <textarea
            id="accessibility"
            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Conditions d'accessibilité pour les personnes en situation de handicap"
            {...register('accessibility')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_cpf_eligible"
              className="h-4 w-4 rounded border-gray-300"
              {...register('is_cpf_eligible')}
            />
            <Label htmlFor="is_cpf_eligible">Éligible CPF</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mcf_id">ID Mon Compte Formation</Label>
            <Input id="mcf_id" placeholder="Référence MCF" {...register('mcf_id')} />
          </div>
        </div>
      </fieldset>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {defaultValues?.id ? 'Mettre à jour' : 'Créer la formation'}
        </Button>
      </div>
    </form>
  )
}
