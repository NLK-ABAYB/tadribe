import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Loader2, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuthContext } from '@/features/auth/auth-context'
import { signOut } from '@/lib/hooks/use-auth'
import { useBootstrapOrganization } from '../hooks/use-bootstrap-organization'

const onboardingSchema = z.object({
  name: z.string().min(1, "Le nom de l'organisme est requis"),
  siret: z
    .string()
    .length(14, 'Le SIRET doit contenir 14 chiffres')
    .regex(/^\d+$/, 'Le SIRET ne doit contenir que des chiffres'),
  nda: z
    .string()
    .optional()
    .refine(
      (value) => !value || /^\d{11}$/.test(value),
      'Le NDA doit contenir 11 chiffres',
    ),
  street: z.string().optional(),
  postal_code: z
    .string()
    .optional()
    .refine(
      (value) => !value || /^\d{5}$/.test(value),
      'Le code postal doit contenir 5 chiffres',
    ),
  city: z.string().optional(),
})

type OnboardingFormData = z.infer<typeof onboardingSchema>

export function OnboardingPage() {
  const { profile, loading } = useAuthContext()
  const bootstrap = useBootstrapOrganization()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
  })

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Not authenticated → back to login
  if (!profile) {
    return <Navigate to="/login" replace />
  }

  // Already onboarded → straight to dashboard
  if (profile.organization_id) {
    return <Navigate to="/" replace />
  }

  async function onSubmit(data: OnboardingFormData) {
    setServerError(null)
    try {
      const hasAddress = data.street || data.postal_code || data.city
      await bootstrap.mutateAsync({
        name: data.name,
        siret: data.siret,
        nda: data.nda || null,
        address: hasAddress
          ? {
              street: data.street || undefined,
              postal_code: data.postal_code || undefined,
              city: data.city || undefined,
            }
          : null,
      })
      toast.success('Organisme créé avec succès')
      // Full reload so AuthProvider refetches the profile (which now has
      // organization_id set) and the organization. Keeps the flow simple
      // and avoids a partial in-memory state.
      window.location.assign('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue'
      setServerError(message)
    }
  }

  async function handleSignOut() {
    await signOut()
    window.location.assign('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Créer mon organisme de formation</CardTitle>
            <CardDescription>
              Bienvenue {profile.first_name} ! Renseignez les informations de votre organisme
              pour activer votre espace Tadribe. Vous pourrez compléter le reste depuis les
              paramètres.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'organisme *</Label>
                <Input id="name" {...register('name')} placeholder="Ex. Centre de formation XYZ" />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siret">SIRET *</Label>
                  <Input
                    id="siret"
                    {...register('siret')}
                    placeholder="14 chiffres"
                    maxLength={14}
                    inputMode="numeric"
                  />
                  {errors.siret && (
                    <p className="text-sm text-destructive">{errors.siret.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nda">Numéro de déclaration d'activité (NDA)</Label>
                  <Input
                    id="nda"
                    {...register('nda')}
                    placeholder="11 chiffres (optionnel)"
                    maxLength={11}
                    inputMode="numeric"
                  />
                  {errors.nda && (
                    <p className="text-sm text-destructive">{errors.nda.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 rounded-md border p-4">
                <p className="text-sm font-medium">Adresse</p>
                <div className="space-y-2">
                  <Label htmlFor="street">Rue</Label>
                  <Input id="street" {...register('street')} placeholder="12 rue de la Formation" />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="postal_code">Code postal</Label>
                    <Input
                      id="postal_code"
                      {...register('postal_code')}
                      placeholder="75001"
                      maxLength={5}
                      inputMode="numeric"
                    />
                    {errors.postal_code && (
                      <p className="text-sm text-destructive">{errors.postal_code.message}</p>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input id="city" {...register('city')} placeholder="Paris" />
                  </div>
                </div>
              </div>

              {serverError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {serverError}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting || bootstrap.isPending}>
                {(isSubmitting || bootstrap.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Créer mon organisme
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
