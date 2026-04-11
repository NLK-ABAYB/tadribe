import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { waitFor } from '@testing-library/react'
import { server, SUPABASE_REST } from '@/test/msw-server'
import { renderHookWithQueryClient } from '@/test/query-client'
import {
  useCompanies,
  useCompany,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
} from './use-companies'
import type { Company } from '@/lib/types/database'

function makeCompany(overrides: Partial<Company> = {}): Company {
  return {
    id: 'co-1',
    organization_id: 'org-1',
    name: 'ACME',
    siret: '12345678900012',
    address: null,
    phone: null,
    email: null,
    website: null,
    sector: null,
    size_range: null,
    opco_id: null,
    default_funding_type: null,
    convention_collective: null,
    notes: null,
    is_active: true,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
    ...overrides,
  }
}

describe('useCompanies', () => {
  it('returns the list of companies', async () => {
    server.use(
      http.get(`${SUPABASE_REST}/companies`, () =>
        HttpResponse.json([makeCompany(), makeCompany({ id: 'co-2', name: 'Beta SAS' })]),
      ),
    )

    const { result } = renderHookWithQueryClient(() => useCompanies())

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[1].name).toBe('Beta SAS')
  })

  it('returns an error state when the request fails', async () => {
    server.use(
      http.get(`${SUPABASE_REST}/companies`, () =>
        HttpResponse.json({ message: 'fail' }, { status: 500 }),
      ),
    )

    const { result } = renderHookWithQueryClient(() => useCompanies())

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useCompany', () => {
  it('is idle when id is undefined', () => {
    const { result } = renderHookWithQueryClient(() => useCompany(undefined))
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('fetches a single company', async () => {
    server.use(
      http.get(`${SUPABASE_REST}/companies`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('id')).toBe('eq.co-42')
        return HttpResponse.json(makeCompany({ id: 'co-42', name: 'Target Co' }))
      }),
    )

    const { result } = renderHookWithQueryClient(() => useCompany('co-42'))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.name).toBe('Target Co')
  })
})

describe('useCreateCompany', () => {
  it('posts a new company', async () => {
    server.use(
      http.post(`${SUPABASE_REST}/companies`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        expect(body.name).toBe('Gamma')
        return HttpResponse.json(makeCompany({ id: 'co-new', name: 'Gamma' }))
      }),
    )

    const { result } = renderHookWithQueryClient(() => useCreateCompany())

    const returned = await result.current.mutateAsync({
      organization_id: 'org-1',
      name: 'Gamma',
    })

    expect(returned.id).toBe('co-new')
    expect(returned.name).toBe('Gamma')
  })
})

describe('useUpdateCompany', () => {
  it('patches a company by id', async () => {
    server.use(
      http.patch(`${SUPABASE_REST}/companies`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('id')).toBe('eq.co-1')
        return HttpResponse.json(makeCompany({ sector: 'Industrie' }))
      }),
    )

    const { result } = renderHookWithQueryClient(() => useUpdateCompany())

    const returned = await result.current.mutateAsync({ id: 'co-1', sector: 'Industrie' })

    expect(returned.sector).toBe('Industrie')
  })
})

describe('useDeleteCompany', () => {
  it('deletes a company by id', async () => {
    let called = false
    server.use(
      http.delete(`${SUPABASE_REST}/companies`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('id')).toBe('eq.co-1')
        called = true
        return new HttpResponse(null, { status: 204 })
      }),
    )

    const { result } = renderHookWithQueryClient(() => useDeleteCompany())

    await result.current.mutateAsync('co-1')

    expect(called).toBe(true)
  })
})
