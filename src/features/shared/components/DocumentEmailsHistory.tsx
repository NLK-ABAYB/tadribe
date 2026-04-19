import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail } from 'lucide-react'
import { useDocumentEmails, type DocumentType } from '../hooks/use-send-document-email'

interface DocumentEmailsHistoryProps {
  documentType: DocumentType
  documentId: string | undefined
}

export function DocumentEmailsHistory({ documentType, documentId }: DocumentEmailsHistoryProps) {
  const { data: emails } = useDocumentEmails(documentType, documentId)

  if (!emails || emails.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Emails envoyés ({emails.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="py-2 text-left">Date</th>
              <th className="py-2 text-left">Destinataire</th>
              <th className="py-2 text-left">Objet</th>
              <th className="py-2 text-left">Statut</th>
            </tr>
          </thead>
          <tbody>
            {emails.map((e) => (
              <tr key={e.id} className="border-b last:border-0">
                <td className="py-2">{e.sent_at ? new Date(e.sent_at).toLocaleString('fr-FR') : '—'}</td>
                <td className="py-2">{e.to_email}</td>
                <td className="py-2 text-muted-foreground">{e.subject}</td>
                <td className="py-2">
                  <Badge variant={e.status === 'sent' ? 'success' : 'destructive'} className="text-xs">
                    {e.status === 'sent' ? 'Envoyé' : e.status === 'failed' ? 'Échec' : 'Bounce'}
                  </Badge>
                  {e.error_message && <span className="text-xs text-red-600 ml-2">{e.error_message}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
