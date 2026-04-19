// @ts-nocheck - Deno runtime
// Edge function: send a document by email via Resend, attaching the PDF blob.
// Expects the caller to include the already-generated PDF as base64 in the payload,
// since regenerating react-pdf on Deno adds significant cold-start time.
// Secrets required: RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

type DocType = 'devis' | 'convention' | 'facture' | 'certificat' | 'convocation' | 'emargement'

interface EmailBody {
  document_type: DocType
  document_id: string
  to: string
  cc?: string
  subject: string
  body: string
  pdf_base64: string
  pdf_filename: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json(405, { error: 'method not allowed' })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const resendKey = Deno.env.get('RESEND_API_KEY')
  const fromEmail = Deno.env.get('RESEND_FROM') ?? 'Tadribe <onboarding@resend.dev>'

  if (!resendKey) return json(500, { error: 'RESEND_API_KEY not configured' })

  const authHeader = req.headers.get('authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) return json(401, { error: 'missing bearer token' })

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
  const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: userData, error: userErr } = await userClient.auth.getUser()
  if (userErr || !userData.user) return json(401, { error: 'invalid session' })

  const { data: caller, error: callerErr } = await admin
    .from('profiles')
    .select('id, organization_id, role')
    .eq('id', userData.user.id)
    .single()
  if (callerErr || !caller || !caller.organization_id) {
    return json(403, { error: 'caller has no organization' })
  }
  if (!['admin_of', 'gestionnaire', 'commercial'].includes(caller.role)) {
    return json(403, { error: 'only staff can send documents' })
  }

  let payload: EmailBody
  try {
    payload = (await req.json()) as EmailBody
  } catch {
    return json(400, { error: 'invalid JSON body' })
  }
  if (!payload.to || !payload.subject || !payload.pdf_base64 || !payload.document_type || !payload.document_id) {
    return json(400, { error: 'missing required fields' })
  }

  // Call Resend API
  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [payload.to],
      cc: payload.cc ? [payload.cc] : undefined,
      subject: payload.subject,
      html: `<div style="font-family:sans-serif;line-height:1.5">${payload.body
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/\n/g, '<br/>')}</div>`,
      attachments: [
        {
          filename: payload.pdf_filename,
          content: payload.pdf_base64,
        },
      ],
    }),
  })

  const resendData = await resendRes.json().catch(() => ({}))
  const ok = resendRes.ok
  const resendId = resendData?.id ?? null
  const errorMessage = ok ? null : resendData?.message ?? `HTTP ${resendRes.status}`

  // Insert audit row
  await admin.from('document_emails').insert({
    organization_id: caller.organization_id,
    document_type: payload.document_type,
    document_id: payload.document_id,
    to_email: payload.to,
    cc_email: payload.cc ?? null,
    subject: payload.subject,
    body: payload.body,
    sent_by: caller.id,
    status: ok ? 'sent' : 'failed',
    error_message: errorMessage,
    resend_message_id: resendId,
  })

  // Side effects: mark the corresponding entity as sent
  if (ok) {
    try {
      if (payload.document_type === 'devis') {
        await admin.from('quotes').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', payload.document_id)
      } else if (payload.document_type === 'convention') {
        await admin.from('conventions').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', payload.document_id)
      } else if (payload.document_type === 'facture') {
        // Only promote brouillon → envoyee, leave paid/partial as-is
        await admin.from('invoices').update({ status: 'envoyee' })
          .eq('id', payload.document_id)
          .in('status', ['brouillon', 'emise'])
      } else if (payload.document_type === 'convocation') {
        // Payload may include enrollment_id via document_id
        await admin.from('enrollments').update({ convocation_date: new Date().toISOString().slice(0, 10) }).eq('id', payload.document_id)
      }
    } catch {
      // non-fatal
    }
  }

  if (!ok) return json(500, { error: errorMessage ?? 'send failed' })
  return json(200, { ok: true, resend_id: resendId })
})
