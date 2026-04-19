import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2, Check, X, Plus, FileDown } from 'lucide-react'
import { toast } from 'sonner'
import { pdf } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { useSession } from '@/features/sessions/hooks/use-sessions'
import { useEnrollments } from '@/features/enrollments/hooks/use-enrollments'
import {
  useSessionSlots,
  useEnrollmentAttendances,
  useMarkAttendance,
  useCreateSessionSlot,
} from '../hooks/use-attendance'
import { SignatureCanvas } from '../components/SignatureCanvas'
import { AttendanceSheetPDF } from '@/features/documents/templates/AttendanceSheetPDF'
import { toPDFOrgInfo, readOrgSettings } from '@/features/shared/pdf/org-info'
import { useAuthContext } from '@/features/auth/auth-context'

export function AttendancePage() {
  const { id: sessionId } = useParams<{ id: string }>()
  const { data: session, isLoading: sessionLoading } = useSession(sessionId)
  const { data: enrollments } = useEnrollments(sessionId)
  const { data: slots } = useSessionSlots(sessionId)
  const markAttendance = useMarkAttendance()
  const createSlot = useCreateSessionSlot()
  const { organization } = useAuthContext()

  const [showAddSlot, setShowAddSlot] = useState(false)
  const [slotDate, setSlotDate] = useState('')
  const [slotStart, setSlotStart] = useState('09:00')
  const [slotEnd, setSlotEnd] = useState('12:30')
  const [slotPeriod, setSlotPeriod] = useState<'matin' | 'apres_midi' | 'journee'>('matin')
  const [slotTopic, setSlotTopic] = useState('')
  const [signingFor, setSigningFor] = useState<{ enrollmentId: string; slotId: string } | null>(null)

  if (sessionLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Session introuvable</p>
      </div>
    )
  }

  async function handleAddSlot() {
    if (!slotDate || !sessionId) return
    await createSlot.mutateAsync({
      session_id: sessionId,
      slot_date: slotDate,
      start_time: slotStart,
      end_time: slotEnd,
      period: slotPeriod || null,
      topic: slotTopic || null,
    })
    toast.success('Créneau ajouté')
    setShowAddSlot(false)
    setSlotDate('')
    setSlotTopic('')
  }

  async function handleMark(enrollmentId: string, slotId: string, present: boolean) {
    await markAttendance.mutateAsync({
      enrollment_id: enrollmentId,
      session_slot_id: slotId,
      is_present: present,
    })
    toast.success(present ? 'Présent' : 'Absent')
  }

  async function handleSignature(signatureData: string) {
    if (!signingFor) return
    await markAttendance.mutateAsync({
      enrollment_id: signingFor.enrollmentId,
      session_slot_id: signingFor.slotId,
      is_present: true,
      signed_at: new Date().toISOString(),
      signature_data: signatureData,
    })
    toast.success('Signature enregistrée')
    setSigningFor(null)
  }

  async function handleDownloadPDF() {
    if (!slots || !enrollments || !organization || !session) return
    const s = session
    const days = slots.map((slot) => ({
      date: slot.slot_date,
      topic: slot.topic,
      entries: enrollments.map((e) => ({
        beneficiary_name: e.beneficiaries
          ? `${e.beneficiaries.last_name} ${e.beneficiaries.first_name}`
          : '—',
        morning_present: null,
        afternoon_present: null,
        morning_signature: null,
        afternoon_signature: null,
      })),
    }))

    const blob = await pdf(
      <AttendanceSheetPDF
        data={{
          organization: toPDFOrgInfo(organization),
          formation: {
            title: s.formations?.title ?? 'Formation',
            duration_hours: s.formations?.duration_hours ?? null,
          },
          session: {
            code: s.code,
            start_date: s.start_date,
            end_date: s.end_date,
            location: s.is_remote ? 'Distanciel' : s.locations?.name ?? '—',
          },
          trainer: s.trainers
            ? { first_name: s.trainers.first_name, last_name: s.trainers.last_name }
            : null,
          days,
          legalMentions: readOrgSettings(organization.settings).legal_mentions ?? null,
        }}
      />
    ).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `emargement-${s.code ?? sessionId}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Sessions', href: '/dashboard/sessions' }, { label: 'Émargement' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Émargement</h1>
          <p className="text-sm text-muted-foreground">
            {session.formations?.title} — {session.code ?? ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <FileDown className="mr-2 h-4 w-4" />
            PDF Émargement
          </Button>
          <Button size="sm" onClick={() => setShowAddSlot(!showAddSlot)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter créneau
          </Button>
        </div>
      </div>

      {showAddSlot && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nouveau créneau</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Début</Label>
                <Input type="time" value={slotStart} onChange={(e) => setSlotStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Fin</Label>
                <Input type="time" value={slotEnd} onChange={(e) => setSlotEnd(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Période</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={slotPeriod}
                  onChange={(e) => setSlotPeriod(e.target.value as 'matin' | 'apres_midi' | 'journee')}
                >
                  <option value="matin">Matin</option>
                  <option value="apres_midi">Après-midi</option>
                  <option value="journee">Journée</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Sujet</Label>
                <Input value={slotTopic} onChange={(e) => setSlotTopic(e.target.value)} placeholder="Optionnel" />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button size="sm" onClick={handleAddSlot} disabled={!slotDate || createSlot.isPending}>
                {createSlot.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ajouter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signature modal */}
      {signingFor && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-base">Signature électronique</CardTitle>
          </CardHeader>
          <CardContent>
            <SignatureCanvas onSave={handleSignature} />
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setSigningFor(null)}>
              Annuler
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Slots and attendance grid */}
      {!slots?.length ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun créneau défini. Ajoutez des créneaux pour commencer l'émargement.</p>
        </div>
      ) : (
        slots.map((slot) => (
          <Card key={slot.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {new Date(slot.slot_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  {' — '}
                  {slot.start_time?.slice(0, 5)} à {slot.end_time?.slice(0, 5)}
                </CardTitle>
                <div className="flex gap-2">
                  {slot.period && <Badge variant="secondary">{slot.period === 'matin' ? 'Matin' : slot.period === 'apres_midi' ? 'Après-midi' : 'Journée'}</Badge>}
                  {slot.topic && <Badge variant="outline">{slot.topic}</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!enrollments?.length ? (
                <p className="text-sm text-muted-foreground">Aucun inscrit</p>
              ) : (
                <div className="space-y-2">
                  {enrollments.map((enrollment) => (
                    <AttendanceRow
                      key={enrollment.id}
                      enrollmentId={enrollment.id}
                      slotId={slot.id}
                      name={enrollment.beneficiaries ? `${enrollment.beneficiaries.last_name} ${enrollment.beneficiaries.first_name}` : '—'}
                      onMark={(present) => handleMark(enrollment.id, slot.id, present)}
                      onSign={() => setSigningFor({ enrollmentId: enrollment.id, slotId: slot.id })}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

function AttendanceRow({
  enrollmentId,
  slotId,
  name,
  onMark,
  onSign,
}: {
  enrollmentId: string
  slotId: string
  name: string
  onMark: (present: boolean) => void
  onSign: () => void
}) {
  const { data: attendances } = useEnrollmentAttendances(enrollmentId)
  const attendance = attendances?.find((a) => a.session_slot_id === slotId)

  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <span className="text-sm font-medium">{name}</span>
      <div className="flex items-center gap-2">
        {attendance?.signed_at && (
          <Badge variant="success" className="text-xs">Signé</Badge>
        )}
        {attendance?.is_present === true && !attendance?.signed_at && (
          <Badge variant="default" className="text-xs">Présent</Badge>
        )}
        {attendance?.is_present === false && (
          <Badge variant="destructive" className="text-xs">Absent</Badge>
        )}
        <Button variant="outline" size="sm" onClick={() => onMark(true)} title="Présent">
          <Check className="h-4 w-4 text-green-600" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onMark(false)} title="Absent">
          <X className="h-4 w-4 text-red-600" />
        </Button>
        <Button variant="outline" size="sm" onClick={onSign} title="Signer">
          Signer
        </Button>
      </div>
    </div>
  )
}
