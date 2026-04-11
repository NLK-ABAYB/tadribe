import { useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/types/database'

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
  })

  useEffect(() => {
    console.log('[auth] mounting useAuth, calling getSession()')

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[auth] getSession resolved:', {
        hasSession: !!session,
        userId: session?.user?.id ?? null,
      })
      if (session?.user) {
        fetchProfile(session.user.id).then(profile => {
          console.log('[auth] initial profile fetched:', {
            hasProfile: !!profile,
            organizationId: profile?.organization_id ?? null,
            role: profile?.role ?? null,
          })
          setState({ user: session.user, profile, session, loading: false })
        })
      } else {
        console.log('[auth] no initial session, marking loading=false')
        setState({ user: null, profile: null, session: null, loading: false })
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[auth] onAuthStateChange:', {
          event,
          hasSession: !!session,
          userId: session?.user?.id ?? null,
        })
        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          console.log('[auth] profile fetched after auth change:', {
            event,
            hasProfile: !!profile,
            organizationId: profile?.organization_id ?? null,
            role: profile?.role ?? null,
          })
          setState({ user: session.user, profile, session, loading: false })
        } else {
          console.log('[auth] auth change with no session, clearing state')
          setState({ user: null, profile: null, session: null, loading: false })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return state
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  console.log('[auth] fetchProfile() →', userId)
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('[auth] fetchProfile error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    })
    return null
  }

  console.log('[auth] fetchProfile success:', {
    id: data.id,
    organizationId: data.organization_id,
    role: data.role,
  })
  return data
}

export async function signInWithEmail(email: string, password: string) {
  console.log('[auth] signInWithEmail →', email)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    console.error('[auth] signInWithEmail error:', error.message)
    throw error
  }
  console.log('[auth] signInWithEmail success:', { userId: data.user?.id ?? null })
  return data
}

export async function signUp(
  email: string,
  password: string,
  metadata: { first_name: string; last_name: string }
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw error
}
