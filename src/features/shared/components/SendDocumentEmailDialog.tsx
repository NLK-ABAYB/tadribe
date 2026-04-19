import { useState, useEffect } from 'react'
import { Loader2, Send, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSendDocumentEmail, type DocumentType } from '../hooks/use-send-document-email'

interface SendDocumentEmailDialogProps {
  open: boolean
  onClose: () => void
  documentType: DocumentType
  documentId: string
  pdfFilename: string
  buildPdfBlob: () => Promise<Blob>
  defaultTo?: string | null
  defaultSubject: string
  defaultBody: string
}

export function SendDocumentEmailDialog({
  open,
  onClose,
  documentType,
  documentId,
  pdfFilename,
  buildPdfBlob,
  defaultTo,
  defaultSubject,
  defaultBody,
}: SendDocumentEmailDialogProps) {
  const sendEmail = useSendDocumentEmail()
  const [to, setTo] = useState(defaultTo ?? '')
  const [cc, setCc] = useState('')
  const [subject, setSubject] = useState(defaultSubject)
  const [body, setBody] = useState(defaultBody)
  const [building, setBuilding] = useState(false)

  useEffect(() => {
    if (open) {
      setTo(defaultTo ?? '')
      setCc('')
      setSubject(defaultSubject)
      setBody(defaultBody)
    }
  }, [open, defaultTo, defaultSubject, defaultBody])

  if (!open) return null

  async function handleSend() {
    if (!to) {
      toast.error('Destinataire requis')
      return
    }
    setBuilding(true)
    try {
      const blob = await buildPdfBlob()
      await sendEmail.mutateAsync({
        document_type: documentType,
        document_id: documentId,
        to,
        cc: cc || undefined,
        subject,
        body,
        pdf_blob: blob,
        pdf_filename: pdfFilename,
      })
      toast.success('Email envoyé')
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'envoi")
    } finally {
      setBuilding(false)
    }
  }

  const isPending = building || sendEmail.isPending

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={() => !isPending && onClose()}
    >
      <div
        className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background">
          <h2 className="text-lg font-semibold">Envoyer par email</h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isPending}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Destinataire *</Label>
            <Input type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="exemple@domaine.fr" />
          </div>
          <div className="space-y-2">
            <Label>CC</Label>
            <Input type="email" value={cc} onChange={(e) => setCc(e.target.value)} placeholder="copie@domaine.fr" />
          </div>
          <div className="space-y-2">
            <Label>Objet *</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <textarea
              className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Le PDF <span className="font-mono">{pdfFilename}</span> sera joint automatiquement.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Annuler
            </Button>
            <Button onClick={handleSend} disabled={isPending || !to}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Envoyer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
