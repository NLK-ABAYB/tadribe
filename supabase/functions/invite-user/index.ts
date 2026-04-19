// @ts-nocheck - Deno runtime, not Node
// Edge function: invite a beneficiary or company contact to the portal.
// Requires SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected by Supabase).
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

type InviteRole = 'apprenant' | 'apprenti' | 'entreprise'

interface InviteBody {
  email: string
  role: InviteRole
  target_id: string // beneficiary_id for apprenant/apprenti, contact_id for entreprise
  first_name?: string
  last_name?: string
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
  const siteUrl = Deno.env.get('SITE_URL') ?? Deno.env.get('APP_URL') ?? 'http://localhost:5173'

  const authHeader = req.headers.get('authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) return json(401, { error: 'missing bearer token' })

  // Admin client (service role) bypasses RLS
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  // User-scoped client to identify the caller (staff user)
  const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: userData, error: userErr } = await userClient.auth.getUser()
  if (userErr || !userData.user) return json(401, { error: 'invalid session' })

  // Ensure the caller is a staff member of some organization
  const { data: callerProfile, error: profileErr } = await admin
    .from('profiles')
    .select('id, organization_id, role')
    .eq('id', userData.user.id)
    .single()
  if (profileErr || !callerProfile || !callerProfile.organization_id) {
    return json(403, { error: 'caller has no organization' })
  }
  if (!['admin_of', 'gestionnaire', 'commercial'].includes(callerProfile.role)) {
    return json(403, { error: 'only staff members can invite users' })
  }

  // Parse body
  let body: InviteBody
  try {
    body = (await req.json()) as InviteBody
  } catch {
    return json(400, { error: 'invalid JSON body' })
  }
  if (!body.email || !body.role || !body.target_id) {
    return json(400, { error: 'email, role and target_id are required' })
  }

  // Map role → table/column for linking
  const isBeneficiary = body.role === 'apprenant' || body.role === 'apprenti'
  const tableName = isBeneficiary ? 'beneficiaries' : 'contacts'
  const linkColumn = isBeneficiary ? 'beneficiary_id' : 'contact_id'
  const profileLinkColumn = isBeneficiary ? 'profile_id' : 'user_id'

  // Verify the target belongs to the caller's organization
  const { data: target, error: targetErr } = await admin
    .from(tableName)
    .select('id, organization_id, first_name, last_name, email')
    .eq('id', body.target_id)
    .maybeSingle()
  if (targetErr || !target || target.organization_id !== callerProfile.organization_id) {
    return json(404, { error: 'target not found in your organization' })
  }

  // Check if a user with this email already exists
  const { data: existingList } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
  const existingUser = existingList?.users?.find(
    (u: { email?: string }) => u.email?.toLowerCase() === body.email.toLowerCase(),
  )

  let userId: string
  let alreadyInvited = false

  if (existingUser) {
    userId = existingUser.id
    alreadyInvited = true
  } else {
    const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(body.email, {
      redirectTo: `${siteUrl}/onboarding`,
      data: {
        first_name: body.first_name ?? target.first_name,
        last_name: body.last_name ?? target.last_name,
      },
    })
    if (inviteErr || !invited.user) {
      return json(500, { error: `invite failed: ${inviteErr?.message ?? 'unknown'}` })
    }
    userId = invited.user.id
  }

  // Upsert the profile row (the on-signup trigger may have created one with
  // role='admin_of' and organization_id=NULL — fix both)
  const { error: upsertErr } = await admin
    .from('profiles')
    .upsert(
      {
        id: userId,
        organization_id: callerProfile.organization_id,
        role: body.role,
        email: body.email,
        first_name: body.first_name ?? target.first_name ?? '',
        last_name: body.last_name ?? target.last_name ?? '',
        [linkColumn]: body.target_id,
        invited_at: new Date().toISOString(),
        invited_by: callerProfile.id,
      },
      { onConflict: 'id' },
    )
  if (upsertErr) return json(500, { error: `profile upsert failed: ${upsertErr.message}` })

  // Reverse-link on the target row
  const { error: linkErr } = await admin
    .from(tableName)
    .update({ [profileLinkColumn]: userId })
    .eq('id', body.target_id)
  if (linkErr) return json(500, { error: `target link failed: ${linkErr.message}` })

  return json(200, {
    ok: true,
    user_id: userId,
    already_invited: alreadyInvited,
  })
})
