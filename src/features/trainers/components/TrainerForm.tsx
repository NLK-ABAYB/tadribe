import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Trainer } from '@/lib/types/database'

const trainerSchema = z.object({
  first_name: z.string().min(1, 'Le prénom est requis'),
  last_name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide').nullable().or(z.literal('')),
  phone: z.string().nullable().or(z.literal('')),
  siret: z
    .string()
    .regex(/^\d{14}$|^$/u, 'SIRET doit contenir 14 chiffres')
    .nullable()
    .or(z.literal('')),
  is_internal: z.boolean(),
  specialties: z.string(),
  certifications: z.string(),
  hourly_rate: z.coerce.number().min(0).nullable().or(z.literal('')),
  daily_rate: z.coerce.number().min(0).nullable().or(z.literal('')),
  bio: z.string().nullable().or(z.literal('')),
})

type TrainerFormData = z.infer<typeof trainerSchema>

interface TrainerFormProps {
  defaultValues?: Partial<Trainer>
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
}

export function TrainerForm({ defaultValues, onSubmit, isSubmitting, onCancel }: TrainerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrainerFormData>({
    resolver: zodResolver(trainerSchema),
    defaultValues: {
      first_name: defaultValues?.first_name ?? '',
      last_name: defaultValues?.last_name ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      siret: (defaultValues as { siret?: string | null })?.siret ?? '',
      is_internal: defaultValues?.is_internal ?? true,
      specialties: defaultValues?.specialties?.join('\n') ?? '',
      certifications: (() => {
        const certs = (defaultValues as { certifications?: unknown })?.certifications
        if (Array.isArray(certs)) {
          return certs
            .map((c: { name?: string; issuer?: string; date?: string }) =>
              [c.name ?? '', c.issuer ?? '', c.date ?? ''].filter(Boolean).join(' — '),
            )
            .join('\n')
        }
        return ''
      })(),
      hourly_rate: defaultValues?.hourly_rate ?? '',
      daily_rate: defaultValues?.daily_rate ?? '',
      bio: defaultValues?.bio ?? '',
    } as never,
  })

  return (
    <form onSubmit={handleSubmit((data) => onSubmit({
      ...data,
      specialties: data.specialties ? data.specialties.split('\n').filter(Boolean) : [],
      certifications: data.certifications
        ? data.certifications
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
              const [name, issuer, date] = line.split('—').map((s) => s.trim())
              return { name: name ?? '', issuer: issuer ?? null, date: date ?? null }
            })
        : [],
      siret: data.siret || null,
    }))} className="space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" {...register('phone')} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="siret">SIRET (si prestataire externe)</Label>
          <Input id="siret" placeholder="14 chiffres" maxLength={14} {...register('siret')} />
          {errors.siret && <p className="text-sm text-destructive">{errors.siret.message}</p>}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_internal"
            className="h-4 w-4 rounded border-gray-300"
            {...register('is_internal')}
          />
          <Label htmlFor="is_internal">Formateur interne</Label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Compétences et tarifs (Ind. 21)
        </legend>
        <div className="space-y-2">
          <Label htmlFor="specialties">Spécialités (une par ligne)</Label>
          <textarea
            id="specialties"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="ex: Management&#10;Comptabilité&#10;Bureautique"
            {...register('specialties')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hourly_rate">Taux horaire</Label>
            <Input id="hourly_rate" type="number" min={0} step={0.01} {...register('hourly_rate')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="daily_rate">Taux journalier</Label>
            <Input id="daily_rate" type="number" min={0} step={0.01} {...register('daily_rate')} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="certifications">Certifications (une par ligne — format "Nom — Organisme — 2024")</Label>
          <textarea
            id="certifications"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="ex: CNV niveau 2 — ICNV France — 2023&#10;Formation de formateur — AFPA — 2020"
            {...register('certifications')}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Biographie
        </legend>
        <div className="space-y-2">
          <Label htmlFor="bio">Biographie / parcours</Label>
          <textarea
            id="bio"
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...register('bio')}
          />
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
          {defaultValues?.id ? 'Mettre à jour' : 'Créer le formateur'}
        </Button>
      </div>
    </form>
  )
}
