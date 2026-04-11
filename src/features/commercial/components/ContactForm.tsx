import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Contact } from '@/lib/types/database'

const contactSchema = z.object({
  first_name: z.string().min(1, 'Le prénom est requis'),
  last_name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide').nullable().or(z.literal('')),
  phone: z.string().nullable().or(z.literal('')),
  job_title: z.string().nullable().or(z.literal('')),
  contact_type: z.string().nullable().or(z.literal('')),
  is_active: z.boolean(),
  notes: z.string().nullable().or(z.literal('')),
})

type ContactFormData = z.infer<typeof contactSchema>

interface ContactFormProps {
  defaultValues?: Partial<Contact>
  onSubmit: (data: ContactFormData) => Promise<void>
  isSubmitting?: boolean
}

export function ContactForm({ defaultValues, onSubmit, isSubmitting }: ContactFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      first_name: defaultValues?.first_name ?? '',
      last_name: defaultValues?.last_name ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      job_title: defaultValues?.job_title ?? '',
      contact_type: defaultValues?.contact_type ?? '',
      is_active: defaultValues?.is_active ?? true,
      notes: defaultValues?.notes ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Prénom *</Label>
          <Input id="first_name" {...register('first_name')} />
          {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Nom *</Label>
          <Input id="last_name" {...register('last_name')} />
          {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input id="contact-email" type="email" {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="job_title">Fonction</Label>
          <Input id="job_title" placeholder="ex: DRH, Responsable formation" {...register('job_title')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact-phone">Téléphone</Label>
          <Input id="contact-phone" {...register('phone')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_type">Type de contact</Label>
          <Input id="contact_type" placeholder="ex: signataire, facturation, formation" {...register('contact_type')} />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded" {...register('is_active')} />
          Contact actif
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {defaultValues?.id ? 'Mettre à jour' : 'Ajouter le contact'}
        </Button>
      </div>
    </form>
  )
}
