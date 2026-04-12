import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/test/query-client'
import type { Tables } from '@/types/supabase'

type Formation = Tables<'formations'>

const useFormationsMock = vi.fn()
const useCreateFormationMock = vi.fn()
vi.mock('../hooks/use-formations', () => ({
  useFormations: () => useFormationsMock(),
  useCreateFormation: () => useCreateFormationMock(),
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

vi.mock('../components/FormationForm', () => ({
  FormationForm: () => <div data-testid="formation-form-stub" />,
}))

import { FormationsListPage } from './FormationsListPage'

function makeFormation(overrides: Partial<Formation> = {}): Formation {
  return {
    id: 'form-1',
    organization_id: 'org-1',
    title: 'Qualiopi Essentials',
    code: 'QE-001',
    category: 'af',
    duration_hours: 35,
    duration_days: 5,
    modality: 'presentiel',
    price_ht: 2500,
    price_ttc: 3000,
    price_per_hour: null,
    is_cpf_eligible: true,
    is_active: true,
    satisfaction_rate: 95,
    success_rate: null,
    completion_rate: null,
    insertion_rate: null,
    objectives: ['Comprendre Qualiopi', 'Préparer l\'audit'],
    prerequisites: null,
    target_audience: null,
    teaching_methods: null,
    assessment_methods: null,
    pedagogical_scenario: null,
    program_content: null,
    accessibility: null,
    access_delay: null,
    certification_id: null,
    certification_mapping: null,
    mcf_id: null,
    version: 1,
    published_at: null,
    results_updated_at: null,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
    ...overrides,
  }
}

function renderPage() {
  return renderWithQueryClient(
    <MemoryRouter>
      <FormationsListPage />
    </MemoryRouter>,
  )
}

describe('FormationsListPage', () => {
  beforeEach(() => {
    useFormationsMock.mockReset()
    useCreateFormationMock.mockReset()
    useCreateFormationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false })
  })

  it('shows a loading spinner while formations are loading', () => {
    useFormationsMock.mockReturnValue({ data: undefined, isLoading: true })

    const { container } = renderPage()

    expect(screen.getByRole('heading', { name: /formations/i })).toBeInTheDocument()
    expect(container.querySelector('.animate-spin')).not.toBeNull()
  })

  it('renders the empty state when no formations exist', () => {
    useFormationsMock.mockReturnValue({ data: [], isLoading: false })

    renderPage()

    expect(screen.getByText(/aucune formation/i)).toBeInTheDocument()
    expect(screen.getByText(/commencez par créer une formation/i)).toBeInTheDocument()
  })

  it('renders a card per formation with title, code, duration and price', () => {
    useFormationsMock.mockReturnValue({
      data: [
        makeFormation(),
        makeFormation({
          id: 'form-2',
          title: 'RGPD Formations',
          code: 'RGPD-001',
          category: 'bc',
          duration_hours: 14,
          duration_days: 2,
          price_ht: 1200,
          is_cpf_eligible: false,
        }),
      ],
      isLoading: false,
    })

    renderPage()

    expect(screen.getByText('Qualiopi Essentials')).toBeInTheDocument()
    expect(screen.getByText('RGPD Formations')).toBeInTheDocument()
    expect(screen.getByText('QE-001')).toBeInTheDocument()
    expect(screen.getByText('RGPD-001')).toBeInTheDocument()

    // Links to detail pages
    const links = screen.getAllByRole('link')
    const hrefs = links.map((a) => a.getAttribute('href'))
    expect(hrefs).toContain('/dashboard/formations/form-1')
    expect(hrefs).toContain('/dashboard/formations/form-2')
  })

  it('shows CPF badge when eligible', () => {
    useFormationsMock.mockReturnValue({
      data: [makeFormation({ is_cpf_eligible: true })],
      isLoading: false,
    })

    renderPage()

    expect(screen.getByText('CPF')).toBeInTheDocument()
  })

  it('filters formations by search term', async () => {
    const user = userEvent.setup()
    useFormationsMock.mockReturnValue({
      data: [
        makeFormation(),
        makeFormation({ id: 'form-2', title: 'RGPD Formations', code: 'RGPD-001' }),
      ],
      isLoading: false,
    })

    renderPage()

    await user.type(screen.getByPlaceholderText(/rechercher par titre/i), 'rgpd')

    expect(screen.queryByText('Qualiopi Essentials')).not.toBeInTheDocument()
    expect(screen.getByText('RGPD Formations')).toBeInTheDocument()
  })

  it('toggles the create form when "Nouvelle formation" is clicked', async () => {
    const user = userEvent.setup()
    useFormationsMock.mockReturnValue({ data: [makeFormation()], isLoading: false })

    renderPage()

    expect(screen.queryByTestId('formation-form-stub')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /nouvelle formation/i }))

    expect(screen.getByTestId('formation-form-stub')).toBeInTheDocument()
  })

  it('shows "aucun résultat" when search filters everything out', async () => {
    const user = userEvent.setup()
    useFormationsMock.mockReturnValue({ data: [makeFormation()], isLoading: false })

    renderPage()

    await user.type(screen.getByPlaceholderText(/rechercher par titre/i), 'zzz')

    expect(screen.getByText(/aucune formation/i)).toBeInTheDocument()
    expect(screen.getByText(/aucun résultat/i)).toBeInTheDocument()
  })
})
