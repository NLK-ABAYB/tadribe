import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { waitFor } from '@testing-library/react'
import { server, SUPABASE_REST } from '@/test/msw-server'
import { renderHookWithQueryClient } from '@/test/query-client'
import { useContacts, useCreateContact, useUpdateContact } from './use-contacts'
import type { Contact } from '@/lib/types/database'

function makeContact(overrides: Partial<Contact> = {}): Contact {
  return {
    id: 'ct-1',
    organization_id: 'org-1',
    company_id: 'co-1',
    user_id: null,
    first_name: 'Alice',
    last_name: 'Durand',
    email: 'alice@example.com',
    phone: null,
    mobile: null,
    job_title: 'RH',
    role_in_company: null,
    is_signatory: true,
    is_billing_contact: false,
    is_training_manager: false,
    notes: null,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
    ...overrides,
  }
}

describe('useContacts', () => {
  it('fetches all contacts when no companyId filter is set', async () => {
    server.use(
      http.get(`${SUPABASE_REST}/contacts`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('company_id')).toBeNull()
        return HttpResponse.json([
          makeContact(),
          makeContact({ id: 'ct-2', first_name: 'Bob', last_name: 'Bernard' }),
        ])
      }),
    )

    const { result } = renderHookWithQueryClient(() => useContacts())

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
  })

  it('filters contacts by company_id when provided', async () => {
    server.use(
      http.get(`${SUPABASE_REST}/contacts`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('company_id')).toBe('eq.co-9')
        return HttpResponse.json([makeContact({ company_id: 'co-9' })])
      }),
    )

    const { result } = renderHookWithQueryClient(() => useContacts('co-9'))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.[0].company_id).toBe('co-9')
  })
})

describe('useCreateContact', () => {
  it('inserts a new contact', async () => {
    server.use(
      http.post(`${SUPABASE_REST}/contacts`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        expect(body.first_name).toBe('Claire')
        return HttpResponse.json(makeContact({ id: 'ct-new', first_name: 'Claire' }))
      }),
    )

    const { result } = renderHookWithQueryClient(() => useCreateContact())

    const returned = await result.current.mutateAsync({
      organization_id: 'org-1',
      first_name: 'Claire',
      last_name: 'Dupont',
    })

    expect(returned.id).toBe('ct-new')
  })
})

describe('useUpdateContact', () => {
  it('patches a contact by id', async () => {
    server.use(
      http.patch(`${SUPABASE_REST}/contacts`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('id')).toBe('eq.ct-1')
        return HttpResponse.json(makeContact({ job_title: 'DRH' }))
      }),
    )

    const { result } = renderHookWithQueryClient(() => useUpdateContact())

    const returned = await result.current.mutateAsync({ id: 'ct-1', job_title: 'DRH' })

    expect(returned.job_title).toBe('DRH')
  })
})
