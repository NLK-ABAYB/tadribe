import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type DocumentType = 'devis' | 'convention' | 'facture' | 'certificat' | 'convocation' | 'emargement'

// Pending migration 020 — types will be regenerated after `supabase db push`
export interface DocumentEmail {
  id: string
  organization_id: string
  document_type: DocumentType
  document_id: string
  to_email: string
  cc_email: string | null
  subject: string
  body: string | null
  sent_at: string | null
  sent_by: string | null
  status: 'sent' | 'failed' | 'bounced'
  error_message: string | null
  resend_message_id: string | null
}

export interface SendDocumentEmailArgs {
  document_type: DocumentType
  document_id: string
  to: string
  cc?: string
  subject: string
  body: string
  pdf_blob: Blob
  pdf_filename: string
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

export function useSendDocumentEmail() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (args: SendDocumentEmailArgs) => {
      const pdf_base64 = await blobToBase64(args.pdf_blob)
      const { data, error } = await supabase.functions.invoke<{ ok: boolean; resend_id: string | null }>(
        'send-document-email',
        {
          body: {
            document_type: args.document_type,
            document_id: args.document_id,
            to: args.to,
            cc: args.cc ?? undefined,
            subject: args.subject,
            body: args.body,
            pdf_base64,
            pdf_filename: args.pdf_filename,
          },
        },
      )
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document-emails', variables.document_type, variables.document_id] })
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      queryClient.invalidateQueries({ queryKey: ['conventions'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
    },
  })
}

export function useDocumentEmails(documentType: DocumentType, documentId: string | undefined) {
  return useQuery({
    queryKey: ['document-emails', documentType, documentId],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase as any
      const { data, error } = await client
        .from('document_emails')
        .select('*')
        .eq('document_type', documentType)
        .eq('document_id', documentId!)
        .order('sent_at', { ascending: false })
      if (error) throw error
      return data as DocumentEmail[]
    },
    enabled: !!documentId,
  })
}
