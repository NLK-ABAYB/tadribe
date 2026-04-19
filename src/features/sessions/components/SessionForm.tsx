import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  code: z.string().optional(),
  start_date: z.string().min(1, 'Date de début requise'),
  end_date: z.string().min(1, 'Date de fin requise'),
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
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SessionFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      start_date: '',
      end_date: '',
      is_remote: false,
      remote_url: '',
      min_participants: undefined,
      max_participants: undefined,
      notes: '',
      ...defaultValues,
    },
  })

  const isRemote = watch('is_remote')

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

      <div className="flex items-center gap-3">
        <input type="checkbox" id="session-remote" {...register('is_remote')} className="h-4 w-4" />
        <Label htmlFor="session-remote">Formation à distance</Label>
      </div>

      {isRemote && (
        <div className="space-y-2">
          <Label htmlFor="session-url">URL de connexion</Label>
          <Input id="session-url" type="url" placeholder="https://..." {...register('remote_url')} />
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
