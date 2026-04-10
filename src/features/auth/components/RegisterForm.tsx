import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/lib/hooks/use-auth'

const registerSchema = z.object({
  first_name: z.string().min(1, 'Le pr\u00e9nom est requis'),
  last_name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caract\u00e8res'),
  confirm_password: z.string(),
  org_name: z.string().min(1, "Le nom de l'organisme est requis"),
  siret: z.string().length(14, 'Le SIRET doit contenir 14 chiffres').regex(/^\d+$/, 'Le SIRET ne doit contenir que des chiffres'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm_password'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterFormData) {
    setError(null)
    try {
      await signUp(data.email, data.password, {
        first_name: data.first_name,
        last_name: data.last_name,
      })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  if (success) {
    return (
      <div className="rounded-md bg-green-50 p-4 text-center">
        <p className="text-sm text-green-800">
          Un email de confirmation vous a &eacute;t&eacute; envoy&eacute;.
          V&eacute;rifiez votre bo&icirc;te de r&eacute;ception pour activer votre compte.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Pr&eacute;nom</Label>
          <Input id="first_name" {...register('first_name')} />
          {errors.first_name && (
            <p className="text-sm text-destructive">{errors.first_name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Nom</Label>
          <Input id="last_name" {...register('last_name')} />
          {errors.last_name && (
            <p className="text-sm text-destructive">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input id="reg-email" type="email" {...register('email')} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reg-password">Mot de passe</Label>
          <Input id="reg-password" type="password" {...register('password')} />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirmer</Label>
          <Input id="confirm_password" type="password" {...register('confirm_password')} />
          {errors.confirm_password && (
            <p className="text-sm text-destructive">{errors.confirm_password.message}</p>
          )}
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="text-sm font-medium mb-3">Organisme de formation</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="org_name">Nom de l&apos;organisme</Label>
            <Input id="org_name" {...register('org_name')} />
            {errors.org_name && (
              <p className="text-sm text-destructive">{errors.org_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="siret">SIRET</Label>
            <Input id="siret" placeholder="12345678901234" maxLength={14} {...register('siret')} />
            {errors.siret && (
              <p className="text-sm text-destructive">{errors.siret.message}</p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Cr&eacute;er mon compte
      </Button>
    </form>
  )
}
