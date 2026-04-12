import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/test/query-client'
import type { FundingDossierWithRelations } from '../hooks/use-funding'

const useFundingDossiersMock = vi.fn()
const useCreateFundingDossierMock = vi.fn()
vi.mock('../hooks/use-funding', () => ({
  useFundingDossiers: () => useFundingDossiersMock(),
  useCreateFundingDossier: () => useCreateFundingDossierMock(),
}))

vi.mock('@/features/auth/auth-context', () => ({
  useAuthContext: () => ({
    profile: { id: 'prof-1', organization_id: 'org-1' },
    user: null,
    session: null,
    organization: null,
    loading: false,
    role: { role: 'admin_of', isStaff: true, isAdmin: true },
  }),
}))

vi.mock('../components/FundingForm', () => ({
  FundingForm: () => <div data-testid="funding-form-stub" />,
}))

import { FundingListPage } from './FundingListPage'

function makeDossier(overrides: Partial<FundingDossierWithRelations> = {}): FundingDossierWithRelations {
  return {
    id: 'fund-1',
    organization_id: 'org-1',
    funding_type: 'opco_plan',
    status: 'depose',
    amount_requested: 5000,
    amount_granted: 4000,
    amount_paid: 0,
    beneficiary_id: 'ben-1',
    company_id: 'co-1',
    enrollment_id: 'enr-1',
    session_id: null,
    opco_id: null,
    funder_name: null,
    funder_reference: 'REF-001',
    cpf_dossier_id: null,
    cpf_reste_charge: null,
    is_subrogation: null,
    remainder_beneficiary: null,
    remainder_company: null,
    submitted_at: null,
    decision_date: null,
    payment_date: null,
    deadline_date: null,
    notes: null,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
    beneficiaries: { first_name: 'Alice', last_name: 'Durand' },
    companies: { name: 'ACME' },
    enrollments: { sessions: { code: 'S-2026-01', formations: { title: 'Qualiopi Essentials' } } },
    ...overrides,
  }
}

function renderPage() {
  return renderWithQueryClient(
    <MemoryRouter>
      <FundingListPage />
    </MemoryRouter>,
  )
}

describe('FundingListPage', () => {
  beforeEach(() => {
    useFundingDossiersMock.mockReset()
    useCreateFundingDossierMock.mockReset()
    useCreateFundingDossierMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false })
  })

  it('shows a loading spinner while dossiers are loading', () => {
    useFundingDossiersMock.mockReturnValue({ data: undefined, isLoading: true })

    const { container } = renderPage()

    expect(screen.getByRole('heading', { name: /financements/i })).toBeInTheDocument()
    expect(container.querySelector('.animate-spin')).not.toBeNull()
  })

  it('renders the empty state when no dossiers exist', () => {
    useFundingDossiersMock.mockReturnValue({ data: [], isLoading: false })

    renderPage()

    expect(screen.getByText(/aucun dossier/i)).toBeInTheDocument()
    expect(screen.getByText(/créez un dossier de financement/i)).toBeInTheDocument()
  })

  it('renders KPI cards with aggregated amounts', () => {
    useFundingDossiersMock.mockReturnValue({
      data: [
        makeDossier({ amount_requested: 5000, amount_granted: 4000, amount_paid: 1000 }),
        makeDossier({ id: 'fund-2', amount_requested: 3000, amount_granted: 2500, amount_paid: 2500 }),
      ],
      isLoading: false,
    })

    renderPage()

    // KPI labels ("Demandé"/"Accordé" also appear in table headers and
    // filter dropdowns — just verify the KPI values are rendered)
    expect(screen.getByText('8 000,00 €')).toBeInTheDocument() // totalRequested
    expect(screen.getByText('6 500,00 €')).toBeInTheDocument() // totalGranted
    expect(screen.getByText('3 500,00 €')).toBeInTheDocument() // totalPaid
  })

  it('renders a row per dossier with type, beneficiary, formation and status', () => {
    useFundingDossiersMock.mockReturnValue({
      data: [
        makeDossier(),
        makeDossier({
          id: 'fund-2',
          funding_type: 'cpf',
          status: 'accorde',
          funder_reference: 'CPF-999',
          beneficiaries: { first_name: 'Bob', last_name: 'Leroy' },
          enrollments: { sessions: { code: 'S-2026-02', formations: { title: 'RGPD Formations' } } },
        }),
      ],
      isLoading: false,
    })

    renderPage()

    // Funding type as link
    expect(screen.getByRole('link', { name: /opco plan/i })).toHaveAttribute('href', '/financements/fund-1')
    expect(screen.getByRole('link', { name: /cpf/i })).toHaveAttribute('href', '/financements/fund-2')

    // Funder references
    expect(screen.getByText('REF-001')).toBeInTheDocument()
    expect(screen.getByText('CPF-999')).toBeInTheDocument()

    // Beneficiaries
    expect(screen.getByText('Durand Alice')).toBeInTheDocument()
    expect(screen.getByText('Leroy Bob')).toBeInTheDocument()

    // Formations
    expect(screen.getByText('Qualiopi Essentials')).toBeInTheDocument()
    expect(screen.getByText('RGPD Formations')).toBeInTheDocument()

    // Status badges (also present in filter dropdown, so use getAllByText)
    expect(screen.getAllByText('Déposé').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Accordé').length).toBeGreaterThanOrEqual(1)
  })

  it('filters dossiers by beneficiary name', async () => {
    const user = userEvent.setup()
    useFundingDossiersMock.mockReturnValue({
      data: [
        makeDossier(),
        makeDossier({
          id: 'fund-2',
          beneficiaries: { first_name: 'Bob', last_name: 'Leroy' },
          enrollments: { sessions: { code: 'S-2', formations: { title: 'RGPD' } } },
        }),
      ],
      isLoading: false,
    })

    renderPage()

    await user.type(screen.getByPlaceholderText(/rechercher/i), 'leroy')

    expect(screen.queryByText('Durand Alice')).not.toBeInTheDocument()
    expect(screen.getByText('Leroy Bob')).toBeInTheDocument()
  })

  it('toggles the create form when "Nouveau dossier" is clicked', async () => {
    const user = userEvent.setup()
    useFundingDossiersMock.mockReturnValue({ data: [makeDossier()], isLoading: false })

    renderPage()

    expect(screen.queryByTestId('funding-form-stub')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /nouveau dossier/i }))

    expect(screen.getByTestId('funding-form-stub')).toBeInTheDocument()
  })

  it('shows "aucun résultat" when search filters everything out', async () => {
    const user = userEvent.setup()
    useFundingDossiersMock.mockReturnValue({ data: [makeDossier()], isLoading: false })

    renderPage()

    await user.type(screen.getByPlaceholderText(/rechercher/i), 'zzz')

    expect(screen.getByText(/aucun dossier/i)).toBeInTheDocument()
    expect(screen.getByText(/aucun résultat/i)).toBeInTheDocument()
  })
})
