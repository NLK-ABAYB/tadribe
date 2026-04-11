import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { waitFor } from '@testing-library/react'
import { server, SUPABASE_REST } from '@/test/msw-server'
import { renderHookWithQueryClient } from '@/test/query-client'
import {
  useSessions,
  useSession,
  useCreateSession,
  useUpdateSession,
} from './use-sessions'

interface SessionFixture {
  id: string
  organization_id: string
  formation_id: string
  code: string | null
  status: string
  start_date: string
  end_date: string
  location_id: string | null
  is_remote: boolean
  remote_url: string | null
  min_participants: number
  max_participants: number | null
  trainer_id: string | null
  coordinator_id: string | null
  notes: string | null
  alternance_calendar: unknown
  created_at: string
  updated_at: string
  formations: { title: string; duration_hours: number; objectives: string[] | null } | null
  trainers: { first_name: string; last_name: string; email?: string } | null
  locations: { name: string; address: unknown; capacity: number | null } | null
}

function makeSession(overrides: Partial<SessionFixture> = {}): SessionFixture {
  return {
    id: 'sess-1',
    organization_id: 'org-1',
    formation_id: 'form-1',
    code: 'S-2026-01',
    status: 'planifiee',
    start_date: '2026-05-01',
    end_date: '2026-05-05',
    location_id: 'loc-1',
    is_remote: false,
    remote_url: null,
    min_participants: 1,
    max_participants: 12,
    trainer_id: 'tr-1',
    coordinator_id: null,
    notes: null,
    alternance_calendar: null,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
    formations: { title: 'Qualiopi Essentials', duration_hours: 35, objectives: ['O1', 'O2'] },
    trainers: { first_name: 'Jean', last_name: 'Martin', email: 'jean@example.com' },
    locations: { name: 'Centre Paris', address: null, capacity: 20 },
    ...overrides,
  }
}

describe('useSessions', () => {
  it('returns the list of sessions with embedded relations', async () => {
    const sessions = [
      makeSession(),
      makeSession({ id: 'sess-2', code: 'S-2026-02', status: 'confirmee' }),
    ]
    server.use(
      http.get(`${SUPABASE_REST}/sessions`, ({ request }) => {
        const url = new URL(request.url)
        // The hook requests embedded relations via PostgREST `select`
        expect(url.searchParams.get('select')).toContain('formations')
        return HttpResponse.json(sessions)
      }),
    )

    const { result } = renderHookWithQueryClient(() => useSessions())

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0].formations?.title).toBe('Qualiopi Essentials')
    expect(result.current.data?.[0].trainers?.last_name).toBe('Martin')
  })

  it('reports an error state when the endpoint fails', async () => {
    server.use(
      http.get(`${SUPABASE_REST}/sessions`, () =>
        HttpResponse.json({ message: 'oops' }, { status: 500 }),
      ),
    )

    const { result } = renderHookWithQueryClient(() => useSessions())

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useSession', () => {
  it('is disabled when id is undefined', () => {
    const { result } = renderHookWithQueryClient(() => useSession(undefined))
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('fetches a single session by id with full relations', async () => {
    const session = makeSession({ id: 'sess-42' })
    server.use(
      http.get(`${SUPABASE_REST}/sessions`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('id')).toBe('eq.sess-42')
        return HttpResponse.json(session)
      }),
    )

    const { result } = renderHookWithQueryClient(() => useSession('sess-42'))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('sess-42')
    expect(result.current.data?.locations?.capacity).toBe(20)
  })
})

describe('useCreateSession', () => {
  it('inserts a session and returns the created row', async () => {
    const created = makeSession({ id: 'sess-new' })
    server.use(
      http.post(`${SUPABASE_REST}/sessions`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        expect(body.formation_id).toBe('form-1')
        return HttpResponse.json(created)
      }),
    )

    const { result } = renderHookWithQueryClient(() => useCreateSession())

    const returned = await result.current.mutateAsync({
      organization_id: 'org-1',
      formation_id: 'form-1',
      start_date: '2026-05-01',
      end_date: '2026-05-05',
    })

    expect(returned.id).toBe('sess-new')
  })
})

describe('useUpdateSession', () => {
  it('patches a session by id', async () => {
    server.use(
      http.patch(`${SUPABASE_REST}/sessions`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('id')).toBe('eq.sess-1')
        return HttpResponse.json(makeSession({ status: 'confirmee' }))
      }),
    )

    const { result } = renderHookWithQueryClient(() => useUpdateSession())

    const returned = await result.current.mutateAsync({
      id: 'sess-1',
      status: 'confirmee',
    })

    expect(returned.status).toBe('confirmee')
  })
})
