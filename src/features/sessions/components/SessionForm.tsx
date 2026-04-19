import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTrainers } from '@/features/trainers/hooks/use-trainers'
import { useLocations, useCreateLocation } from '../hooks/use-locations'
import { useAuthContext } from '@/features/auth/auth-context'
import { useTeamMembers } from '@/features/settings/hooks/use-settings'

const schema = z.object({
  code: z.string().optional(),
  start_date: z.string().min(1, 'Date de début requise'),
  end_date: z.string().min(1, 'Date de fin requise'),
  trainer_id: z.string().optional(),
  location_id: z.string().optional(),
  coordinator_id: z.string().optional(),
  is_remote: z.boolean().optional(),
  remote_url: z.string().optional(),
  min_participants: z.coerce.number().min(0).optional(),
  max_participants: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
})

export type SessionFormData = z.infer<typeof schema>

interface SessionFormProps {
  defaultValues?: Partial<SessionFormData>
  onSubmit: (data: SessionFormData) => Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
}

export function SessionForm({ defaultValues, onSubmit, isSubmitting, onCancel }: SessionFormProps) {
  const { profile } = useAuthContext()
  const { data: trainers } = useTrainers()
  const { data: locations } = useLocations()
  const { data: teamMembers } = useTeamMembers(profile?.organization_id)
  const createLocation = useCreateLocation()
  const [showNewLocation, setShowNewLocation] = useState(false)
  const [newLocName, setNewLocName] = useState('')
  const [newLocCity, setNewLocCity] = useState('')
  const [newLocStreet, setNewLocStreet] = useState('')
  const [newLocPostal, setNewLocPostal] = useState('')
  const [newLocCapacity, setNewLocCapacity] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<SessionFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      start_date: '',
      end_date: '',
      trainer_id: '',
      location_id: '',
      coordinator_id: '',
      is_remote: false,
      remote_url: '',
      min_participants: undefined,
      max_participants: undefined,
      notes: '',
      ...defaultValues,
    },
  })

  const isRemote = watch('is_remote')

  async function handleCreateLocation() {
    if (!profile?.organization_id || !newLocName) return
    try {
      const loc = await createLocation.mutateAsync({
        organization_id: profile.organization_id,
        name: newLocName,
        address: {
          street: newLocStreet || undefined,
          city: newLocCity || undefined,
          postal_code: newLocPostal || undefined,
        },
        capacity: newLocCapacity ? parseInt(newLocCapacity, 10) : null,
      })
      setValue('location_id', loc.id)
      toast.success('Lieu créé')
      setShowNewLocation(false)
      setNewLocName('')
      setNewLocCity('')
      setNewLocStreet('')
      setNewLocPostal('')
      setNewLocCapacity('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création')
    }
  }

  const staffMembers = teamMembers?.filter((m) =>
    ['admin_of', 'gestionnaire', 'commercial', 'formateur'].includes(m.role),
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="session-code">Code session</Label>
        <Input id="session-code" placeholder="ex: SES-2026-001" {...register('code')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="session-start">Date de début *</Label>
          <Input id="session-start" type="date" {...register('start_date')} />
          {errors.start_date && <p className="text-sm text-destructive">{errors.start_date.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="session-end">Date de fin *</Label>
          <Input id="session-end" type="date" {...register('end_date')} />
          {errors.end_date && <p className="text-sm text-destructive">{errors.end_date.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="session-trainer">Formateur</Label>
          <Controller
            control={control}
            name="trainer_id"
            render={({ field }) => (
              <select
                id="session-trainer"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value || undefined)}
              >
                <option value="">—</option>
                {trainers?.map((t) => (
                  <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                ))}
              </select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="session-coordinator">Coordinateur</Label>
          <Controller
            control={control}
            name="coordinator_id"
            render={({ field }) => (
              <select
                id="session-coordinator"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value || undefined)}
              >
                <option value="">—</option>
                {staffMembers?.map((m) => (
                  <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                ))}
              </select>
            )}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" id="session-remote" {...register('is_remote')} className="h-4 w-4" />
        <Label htmlFor="session-remote">Formation à distance</Label>
      </div>

      {isRemote ? (
        <div className="space-y-2">
          <Label htmlFor="session-url">URL de connexion</Label>
          <Input id="session-url" type="url" placeholder="https://..." {...register('remote_url')} />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="session-location">Lieu</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowNewLocation(!showNewLocation)}
            >
              <Plus className="mr-1 h-3 w-3" />
              Créer un lieu
            </Button>
          </div>
          <Controller
            control={control}
            name="location_id"
            render={({ field }) => (
              <select
                id="session-location"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value || undefined)}
              >
                <option value="">—</option>
                {locations?.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            )}
          />
          {showNewLocation && (
            <div className="mt-2 p-3 rounded-md border bg-muted/30 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Nom du lieu *" value={newLocName} onChange={(e) => setNewLocName(e.target.value)} />
                <Input placeholder="Capacité" type="number" value={newLocCapacity} onChange={(e) => setNewLocCapacity(e.target.value)} />
                <Input placeholder="Rue" value={newLocStreet} onChange={(e) => setNewLocStreet(e.target.value)} className="col-span-2" />
                <Input placeholder="Code postal" value={newLocPostal} onChange={(e) => setNewLocPostal(e.target.value)} />
                <Input placeholder="Ville" value={newLocCity} onChange={(e) => setNewLocCity(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewLocation(false)}>
                  Annuler
                </Button>
                <Button type="button" size="sm" onClick={handleCreateLocation} disabled={!newLocName || createLocation.isPending}>
                  {createLocation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="session-min">Participants min</Label>
          <Input id="session-min" type="number" min={0} {...register('min_participants')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="session-max">Participants max</Label>
          <Input id="session-max" type="number" min={0} {...register('max_participants')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="session-notes">Notes</Label>
        <textarea
          id="session-notes"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
          Enregistrer
        </Button>
      </div>
    </form>
  )
}
