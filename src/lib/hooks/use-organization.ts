import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Organization } from '@/lib/types/database'

export function useOrganization(organizationId: string | null | undefined) {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('[org] useOrganization effect, organizationId =', organizationId)
    if (!organizationId) {
      setOrganization(null)
      setLoading(false)
      return
    }

    setLoading(true)
    supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('[org] fetch error:', {
            code: error.code,
            message: error.message,
          })
          setOrganization(null)
        } else {
          console.log('[org] fetched:', { id: data.id, name: data.name })
          setOrganization(data)
        }
        setLoading(false)
      })
  }, [organizationId])

  return { organization, loading }
}
