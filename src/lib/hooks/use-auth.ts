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
    // Track the last user ID we fetched a profile for, to deduplicate.
    let lastFetchedUserId: string | null = null
    let cancelled = false

    function handleSession(session: Session | null) {
      if (cancelled) return
      if (session?.user) {
        const userId = session.user.id
        // Deduplicate: skip if we already fetched/are fetching for this user
        if (lastFetchedUserId === userId) return
        lastFetchedUserId = userId

        setState(prev => ({ ...prev, user: session.user, session, loading: true }))
        fetchProfile(userId).then(profile => {
          if (cancelled) return
          setState({ user: session.user, profile, session, loading: false })
        })
      } else {
        lastFetchedUserId = null
        setState({ user: null, profile: null, session: null, loading: false })
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session)
    })

    // Listen for auth changes.
    // IMPORTANT: the callback must NOT be async. Since supabase-js v2.39+,
    // signInWithPassword() awaits all onAuthStateChange callbacks via
    // Promise.allSettled(). An async callback that awaits a network call
    // (fetchProfile) blocks signInWithPassword from ever resolving, which
    // freezes the login button spinner.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // On SIGNED_OUT, always clear regardless of dedup
        if (event === 'SIGNED_OUT') {
          lastFetchedUserId = null
          setState({ user: null, profile: null, session: null, loading: false })
          return
        }
        handleSession(session)
      }
    )

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return state
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('[auth] fetchProfile error:', error.message)
    return null
  }

  return data
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
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
