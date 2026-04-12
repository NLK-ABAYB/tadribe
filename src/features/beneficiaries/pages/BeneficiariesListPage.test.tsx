import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/test/query-client'
import type { Tables } from '@/types/supabase'

type Beneficiary = Tables<'beneficiaries'>

interface BeneficiaryWithCompany extends Beneficiary {
  companies: { name: string } | null
}

const useBeneficiariesMock = vi.fn()
const useCreateBeneficiaryMock = vi.fn()
vi.mock('../hooks/use-beneficiaries', () => ({
  useBeneficiaries: () => useBeneficiariesMock(),
  useCreateBeneficiary: () => useCreateBeneficiaryMock(),
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

vi.mock('../components/BeneficiaryForm', () => ({
  BeneficiaryForm: () => <div data-testid="beneficiary-form-stub" />,
}))

import { BeneficiariesListPage } from './BeneficiariesListPage'

function makeBeneficiary(overrides: Partial<BeneficiaryWithCompany> = {}): BeneficiaryWithCompany {
  return {
    id: 'ben-1',
    organization_id: 'org-1',
    first_name: 'Alice',
    last_name: 'Durand',
    email: 'alice@example.com',
    phone: null,
    birth_date: null,
    address: null,
    job_title: null,
    company_id: 'co-1',
    qualification_level: '5',
    is_apprentice: false,
    has_disability: false,
    disability_consent: null,
    disability_details: null,
    cpf_holder: true,
    france_travail_id: null,
    apprentice_contract_start: null,
    apprentice_contract_end: null,
    tutor_contact_id: null,
    profile_id: null,
    status: null,
    notes: null,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
    companies: { name: 'ACME' },
    ...overrides,
  }
}

function renderPage() {
  return renderWithQueryClient(
    <MemoryRouter>
      <BeneficiariesListPage />
    </MemoryRouter>,
  )
}

describe('BeneficiariesListPage', () => {
  beforeEach(() => {
    useBeneficiariesMock.mockReset()
    useCreateBeneficiaryMock.mockReset()
    useCreateBeneficiaryMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false })
  })

  it('shows a loading spinner while beneficiaries are loading', () => {
    useBeneficiariesMock.mockReturnValue({ data: undefined, isLoading: true })

    const { container } = renderPage()

    expect(screen.getByRole('heading', { name: /bénéficiaires/i })).toBeInTheDocument()
    expect(container.querySelector('.animate-spin')).not.toBeNull()
  })

  it('renders the empty state when no beneficiaries exist', () => {
    useBeneficiariesMock.mockReturnValue({ data: [], isLoading: false })

    renderPage()

    expect(screen.getByText(/aucun bénéficiaire/i)).toBeInTheDocument()
    expect(screen.getByText(/commencez par ajouter un bénéficiaire/i)).toBeInTheDocument()
  })

  it('renders a row per beneficiary with name, email, company and badges', () => {
    useBeneficiariesMock.mockReturnValue({
      data: [
        makeBeneficiary(),
        makeBeneficiary({
          id: 'ben-2',
          first_name: 'Bob',
          last_name: 'Leroy',
          email: 'bob@example.com',
          is_apprentice: true,
          has_disability: true,
          cpf_holder: false,
          companies: { name: 'Beta SAS' },
        }),
      ],
      isLoading: false,
    })

    renderPage()

    // Names (displayed as links)
    expect(screen.getByRole('link', { name: /durand alice/i })).toHaveAttribute('href', '/dashboard/beneficiaires/ben-1')
    expect(screen.getByRole('link', { name: /leroy bob/i })).toHaveAttribute('href', '/dashboard/beneficiaires/ben-2')

    // Companies
    expect(screen.getByText('ACME')).toBeInTheDocument()
    expect(screen.getByText('Beta SAS')).toBeInTheDocument()

    // Badges
    expect(screen.getByText('Apprenti')).toBeInTheDocument()
    expect(screen.getByText('PSH')).toBeInTheDocument()
    expect(screen.getByText('CPF')).toBeInTheDocument()

    // Table rendered (1 header + 2 data rows)
    expect(screen.getAllByRole('row')).toHaveLength(3)
  })

  it('filters beneficiaries by name', async () => {
    const user = userEvent.setup()
    useBeneficiariesMock.mockReturnValue({
      data: [
        makeBeneficiary(),
        makeBeneficiary({ id: 'ben-2', first_name: 'Bob', last_name: 'Leroy' }),
      ],
      isLoading: false,
    })

    renderPage()

    await user.type(screen.getByPlaceholderText(/rechercher par nom/i), 'leroy')

    expect(screen.queryByText(/durand/i)).not.toBeInTheDocument()
    expect(screen.getByText(/leroy/i)).toBeInTheDocument()
  })

  it('filters beneficiaries by company name', async () => {
    const user = userEvent.setup()
    useBeneficiariesMock.mockReturnValue({
      data: [
        makeBeneficiary(),
        makeBeneficiary({ id: 'ben-2', first_name: 'Bob', last_name: 'Leroy', companies: { name: 'Beta SAS' } }),
      ],
      isLoading: false,
    })

    renderPage()

    await user.type(screen.getByPlaceholderText(/rechercher par nom/i), 'beta')

    expect(screen.queryByText('ACME')).not.toBeInTheDocument()
    expect(screen.getByText('Beta SAS')).toBeInTheDocument()
  })

  it('toggles the create form when "Nouveau bénéficiaire" is clicked', async () => {
    const user = userEvent.setup()
    useBeneficiariesMock.mockReturnValue({ data: [makeBeneficiary()], isLoading: false })

    renderPage()

    expect(screen.queryByTestId('beneficiary-form-stub')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /nouveau bénéficiaire/i }))

    expect(screen.getByTestId('beneficiary-form-stub')).toBeInTheDocument()
  })

  it('shows "aucun résultat" when search filters everything out', async () => {
    const user = userEvent.setup()
    useBeneficiariesMock.mockReturnValue({ data: [makeBeneficiary()], isLoading: false })

    renderPage()

    await user.type(screen.getByPlaceholderText(/rechercher par nom/i), 'zzz')

    expect(screen.getByText(/aucun bénéficiaire/i)).toBeInTheDocument()
    expect(screen.getByText(/aucun résultat/i)).toBeInTheDocument()
  })
})
