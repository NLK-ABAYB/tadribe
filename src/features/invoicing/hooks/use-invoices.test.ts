import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { waitFor } from '@testing-library/react'
import { server, SUPABASE_REST } from '@/test/msw-server'
import { renderHookWithQueryClient } from '@/test/query-client'
import {
  useInvoices,
  useInvoice,
  useInvoiceLines,
  useCreateInvoice,
  useUpdateInvoice,
  type Invoice,
  type InvoiceLine,
} from './use-invoices'

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 'inv-1',
    organization_id: 'org-1',
    invoice_number: 'FA-2026-001',
    status: 'emise',
    invoice_type: 'facture',
    company_id: 'co-1',
    beneficiary_id: null,
    funding_dossier_id: null,
    recipient_name: 'ACME',
    recipient_address: null,
    session_id: null,
    total_ht: 1000,
    tva_rate: 20,
    tva_amount: 200,
    total_ttc: 1200,
    amount_paid: 0,
    nda_mention: null,
    tva_mention: null,
    issue_date: '2026-04-01',
    due_date: '2026-05-01',
    payment_date: null,
    notes: null,
    pdf_url: null,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
    ...overrides,
  }
}

describe('useInvoices', () => {
  it('returns the list of invoices on success', async () => {
    const invoices = [makeInvoice(), makeInvoice({ id: 'inv-2', invoice_number: 'FA-2026-002' })]
    server.use(
      http.get(`${SUPABASE_REST}/invoices`, () => HttpResponse.json(invoices)),
    )

    const { result } = renderHookWithQueryClient(() => useInvoices())

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0].invoice_number).toBe('FA-2026-001')
  })

  it('surfaces errors when Supabase returns a non-2xx response', async () => {
    server.use(
      http.get(`${SUPABASE_REST}/invoices`, () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    )

    const { result } = renderHookWithQueryClient(() => useInvoices())

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeTruthy()
  })
})

describe('useInvoice', () => {
  it('is disabled when id is undefined (no fetch, no data)', async () => {
    const { result } = renderHookWithQueryClient(() => useInvoice(undefined))
    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })

  it('fetches a single invoice by id', async () => {
    const invoice = makeInvoice({ id: 'inv-42' })
    server.use(
      http.get(`${SUPABASE_REST}/invoices`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('id')).toBe('eq.inv-42')
        return HttpResponse.json(invoice)
      }),
    )

    const { result } = renderHookWithQueryClient(() => useInvoice('inv-42'))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('inv-42')
  })
})

describe('useInvoiceLines', () => {
  it('is disabled when invoiceId is undefined', () => {
    const { result } = renderHookWithQueryClient(() => useInvoiceLines(undefined))
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('fetches lines filtered by invoice_id', async () => {
    const lines: InvoiceLine[] = [
      {
        id: 'line-1',
        invoice_id: 'inv-1',
        description: 'Formation Qualiopi',
        quantity: 2,
        unit_price_ht: 500,
        total_ht: 1000,
        formation_id: null,
        line_order: 1,
      },
    ]
    server.use(
      http.get(`${SUPABASE_REST}/invoice_lines`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('invoice_id')).toBe('eq.inv-1')
        return HttpResponse.json(lines)
      }),
    )

    const { result } = renderHookWithQueryClient(() => useInvoiceLines('inv-1'))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].description).toContain('Qualiopi')
  })
})

describe('useCreateInvoice', () => {
  it('posts a new invoice and returns the inserted row', async () => {
    const created = makeInvoice({ id: 'inv-new', invoice_number: 'FA-2026-100' })
    server.use(
      http.post(`${SUPABASE_REST}/invoices`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        expect(body).toMatchObject({
          invoice_number: 'FA-2026-100',
          recipient_name: 'ACME',
        })
        return HttpResponse.json(created)
      }),
    )

    const { result } = renderHookWithQueryClient(() => useCreateInvoice())

    const returned = await result.current.mutateAsync({
      organization_id: 'org-1',
      invoice_number: 'FA-2026-100',
      recipient_name: 'ACME',
      total_ht: 1000,
      total_ttc: 1200,
      issue_date: '2026-04-01',
      due_date: '2026-05-01',
    })

    expect(returned.id).toBe('inv-new')
  })

  it('propagates insert errors to the caller', async () => {
    server.use(
      http.post(`${SUPABASE_REST}/invoices`, () =>
        HttpResponse.json({ message: 'conflict' }, { status: 409 }),
      ),
    )

    const { result } = renderHookWithQueryClient(() => useCreateInvoice())

    await expect(
      result.current.mutateAsync({
        organization_id: 'org-1',
        invoice_number: 'FA-2026-101',
        recipient_name: 'ACME',
        total_ht: 0,
        total_ttc: 0,
        issue_date: '2026-04-01',
        due_date: '2026-05-01',
      }),
    ).rejects.toBeTruthy()
  })
})

describe('useUpdateInvoice', () => {
  it('patches the invoice and invalidates the list cache', async () => {
    const updated = makeInvoice({ id: 'inv-1', status: 'payee', amount_paid: 1200 })
    server.use(
      http.patch(`${SUPABASE_REST}/invoices`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('id')).toBe('eq.inv-1')
        return HttpResponse.json(updated)
      }),
    )

    const { result } = renderHookWithQueryClient(() => useUpdateInvoice())

    const returned = await result.current.mutateAsync({
      id: 'inv-1',
      status: 'payee',
      amount_paid: 1200,
    })

    expect(returned.status).toBe('payee')
    expect(returned.amount_paid).toBe(1200)
  })
})
