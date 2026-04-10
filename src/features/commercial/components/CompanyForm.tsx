import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Company } from '@/lib/types/database'

const companySchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  siret: z.string().length(14, 'Le SIRET doit contenir 14 chiffres').regex(/^\d+$/, 'Chiffres uniquement').nullable().or(z.literal('')),
  email: z.string().email('Email invalide').nullable().or(z.literal('')),
  phone: z.string().nullable().or(z.literal('')),
  website: z.string().nullable().or(z.literal('')),
  sector: z.string().nullable().or(z.literal('')),
  size_range: z.string().nullable().or(z.literal('')),
  convention_collective: z.string().nullable().or(z.literal('')),
  notes: z.string().nullable().or(z.literal('')),
})

type CompanyFormData = z.infer<typeof companySchema>

interface CompanyFormProps {
  defaultValues?: Partial<Company>
  onSubmit: (data: CompanyFormData) => Promise<void>
  isSubmitting?: boolean
}

export function CompanyForm({ defaultValues, onSubmit, isSubmitting }: CompanyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      siret: defaultValues?.siret ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      website: defaultValues?.website ?? '',
      sector: defaultValues?.sector ?? '',
      size_range: defaultValues?.size_range ?? '',
      convention_collective: defaultValues?.convention_collective ?? '',
      notes: defaultValues?.notes ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom de l'entreprise *</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="siret">SIRET</Label>
          <Input id="siret" maxLength={14} placeholder="12345678901234" {...register('siret')} />
          {errors.siret && <p className="text-sm text-destructive">{errors.siret.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sector">Secteur d'activité</Label>
          <Input id="sector" {...register('sector')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="size_range">Taille</Label>
          <Input id="size_range" placeholder="ex: 50-249" {...register('size_range')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="website">Site web</Label>
          <Input id="website" {...register('website')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="convention_collective">Convention collective</Label>
          <Input id="convention_collective" {...register('convention_collective')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...register('notes')}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {defaultValues?.id ? 'Mettre à jour' : 'Créer l\'entreprise'}
        </Button>
      </div>
    </form>
  )
}
