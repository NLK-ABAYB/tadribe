import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/test/query-client'
import type { Company } from '@/lib/types/database'

const useCompaniesMock = vi.fn()
const useCreateCompanyMock = vi.fn()
vi.mock('../hooks/use-companies', () => ({
  useCompanies: () => useCompaniesMock(),
  useCreateCompany: () => useCreateCompanyMock(),
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

// CompanyForm pulls in react-hook-form + Zod, which we don't need for this suite.
// Stub it so the "Nouvelle entreprise" card renders cheaply.
vi.mock('../components/CompanyForm', () => ({
  CompanyForm: () => <div data-testid="company-form-stub" />,
}))

import { CompaniesListPage } from './CompaniesListPage'

function makeCompany(overrides: Partial<Company> = {}): Company {
  return {
    id: 'co-1',
    organization_id: 'org-1',
    name: 'ACME',
    siret: '12345678900012',
    address: null,
    phone: null,
    email: 'contact@acme.test',
    website: null,
    sector: 'Industrie',
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

function renderPage() {
  return renderWithQueryClient(
    <MemoryRouter>
      <CompaniesListPage />
    </MemoryRouter>,
  )
}

describe('CompaniesListPage', () => {
  beforeEach(() => {
    useCompaniesMock.mockReset()
    useCreateCompanyMock.mockReset()
    useCreateCompanyMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false })
  })

  it('shows a loading spinner while companies are loading', () => {
    useCompaniesMock.mockReturnValue({ data: undefined, isLoading: true })

    const { container } = renderPage()

    expect(screen.getByRole('heading', { name: /entreprises/i })).toBeInTheDocument()
    expect(container.querySelector('.animate-spin')).not.toBeNull()
  })

  it('renders the empty state when no companies exist', () => {
    useCompaniesMock.mockReturnValue({ data: [], isLoading: false })

    renderPage()

    expect(screen.getByText(/aucune entreprise/i)).toBeInTheDocument()
    expect(screen.getByText(/commencez par ajouter une entreprise/i)).toBeInTheDocument()
  })

  it('renders a card per company with name, SIRET and sector', () => {
    useCompaniesMock.mockReturnValue({
      data: [
        makeCompany(),
        makeCompany({ id: 'co-2', name: 'Beta SAS', siret: '98765432100012', sector: 'Tech' }),
      ],
      isLoading: false,
    })

    renderPage()

    expect(screen.getByText('ACME')).toBeInTheDocument()
    expect(screen.getByText('Beta SAS')).toBeInTheDocument()
    expect(screen.getByText(/12345678900012/)).toBeInTheDocument()
    expect(screen.getByText(/98765432100012/)).toBeInTheDocument()
    expect(screen.getByText('Industrie')).toBeInTheDocument()
    expect(screen.getByText('Tech')).toBeInTheDocument()

    // Cards are links to the detail page
    const links = screen.getAllByRole('link')
    const hrefs = links.map((a) => a.getAttribute('href'))
    expect(hrefs).toContain('/entreprises/co-1')
    expect(hrefs).toContain('/entreprises/co-2')
  })

  it('filters the list as the user types a search term', async () => {
    const user = userEvent.setup()
    useCompaniesMock.mockReturnValue({
      data: [
        makeCompany(),
        makeCompany({ id: 'co-2', name: 'Beta SAS', siret: '98765432100012' }),
      ],
      isLoading: false,
    })

    renderPage()

    await user.type(screen.getByPlaceholderText(/rechercher par nom/i), 'beta')

    expect(screen.queryByText('ACME')).not.toBeInTheDocument()
    expect(screen.getByText('Beta SAS')).toBeInTheDocument()
  })

  it('toggles the create form when the "Nouvelle entreprise" button is clicked', async () => {
    const user = userEvent.setup()
    useCompaniesMock.mockReturnValue({ data: [makeCompany()], isLoading: false })

    renderPage()

    expect(screen.queryByTestId('company-form-stub')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /nouvelle entreprise/i }))

    expect(screen.getByTestId('company-form-stub')).toBeInTheDocument()
  })

  it('shows a "no results" hint when the search term filters everything out', async () => {
    const user = userEvent.setup()
    useCompaniesMock.mockReturnValue({ data: [makeCompany()], isLoading: false })

    renderPage()

    await user.type(screen.getByPlaceholderText(/rechercher par nom/i), 'zzz')

    expect(screen.getByText(/aucune entreprise/i)).toBeInTheDocument()
    expect(screen.getByText(/aucun résultat pour cette recherche/i)).toBeInTheDocument()
  })
})
