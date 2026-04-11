import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/test/query-client'
import type { Invoice } from '../hooks/use-invoices'

// Mock the hook the page consumes. We only care about the page's rendering logic here.
const useInvoicesMock = vi.fn()
vi.mock('../hooks/use-invoices', () => ({
  useInvoices: () => useInvoicesMock(),
}))

// Import after the mock is registered so the module picks up our stub.
import { InvoicesListPage } from './InvoicesListPage'

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

function renderPage() {
  return renderWithQueryClient(
    <MemoryRouter>
      <InvoicesListPage />
    </MemoryRouter>,
  )
}

describe('InvoicesListPage', () => {
  beforeEach(() => {
    useInvoicesMock.mockReset()
  })

  it('renders a loading spinner while the query is in flight', () => {
    useInvoicesMock.mockReturnValue({ data: undefined, isLoading: true })

    const { container } = renderPage()

    // Heading is always visible; loading state hides the table and empty state.
    expect(screen.getByRole('heading', { name: /factures/i })).toBeInTheDocument()
    expect(container.querySelector('.animate-spin')).not.toBeNull()
    expect(screen.queryByText(/aucune facture/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('renders the empty state when the list is empty', () => {
    useInvoicesMock.mockReturnValue({ data: [], isLoading: false })

    renderPage()

    expect(screen.getByText(/aucune facture/i)).toBeInTheDocument()
    expect(screen.getByText(/créez votre première facture/i)).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('renders rows for each invoice returned by the hook', () => {
    useInvoicesMock.mockReturnValue({
      data: [
        makeInvoice(),
        makeInvoice({
          id: 'inv-2',
          invoice_number: 'FA-2026-002',
          recipient_name: 'Beta SAS',
          total_ttc: 2400,
          amount_paid: 2400,
          status: 'payee',
        }),
      ],
      isLoading: false,
    })

    renderPage()

    expect(screen.getByRole('link', { name: 'FA-2026-001' })).toHaveAttribute(
      'href',
      '/factures/inv-1',
    )
    expect(screen.getByRole('link', { name: 'FA-2026-002' })).toHaveAttribute(
      'href',
      '/factures/inv-2',
    )
    expect(screen.getByText('ACME')).toBeInTheDocument()
    expect(screen.getByText('Beta SAS')).toBeInTheDocument()
    // Table rendered (1 header + 2 data rows)
    expect(screen.getAllByRole('row')).toHaveLength(3)
  })

  it('filters invoices as the user types in the search input', async () => {
    const user = userEvent.setup()
    useInvoicesMock.mockReturnValue({
      data: [
        makeInvoice({ invoice_number: 'FA-2026-001', recipient_name: 'ACME' }),
        makeInvoice({ id: 'inv-2', invoice_number: 'FA-2026-002', recipient_name: 'Beta SAS' }),
      ],
      isLoading: false,
    })

    renderPage()

    await user.type(screen.getByPlaceholderText(/rechercher par numéro/i), 'beta')

    expect(screen.queryByText('ACME')).not.toBeInTheDocument()
    expect(screen.getByText('Beta SAS')).toBeInTheDocument()
  })

  it('shows the empty state when the search term matches nothing', async () => {
    const user = userEvent.setup()
    useInvoicesMock.mockReturnValue({
      data: [makeInvoice()],
      isLoading: false,
    })

    renderPage()

    await user.type(screen.getByPlaceholderText(/rechercher par numéro/i), 'zzzzz')

    expect(screen.getByText(/aucune facture/i)).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
