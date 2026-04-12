import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/test/query-client'
import type { Tables } from '@/types/supabase'

type Trainer = Tables<'trainers'>

const useTrainersMock = vi.fn()
const useCreateTrainerMock = vi.fn()
vi.mock('../hooks/use-trainers', () => ({
  useTrainers: () => useTrainersMock(),
  useCreateTrainer: () => useCreateTrainerMock(),
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

vi.mock('../components/TrainerForm', () => ({
  TrainerForm: () => <div data-testid="trainer-form-stub" />,
}))

import { TrainersListPage } from './TrainersListPage'

function makeTrainer(overrides: Partial<Trainer> = {}): Trainer {
  return {
    id: 'tr-1',
    organization_id: 'org-1',
    first_name: 'Jean',
    last_name: 'Martin',
    email: 'jean@example.com',
    phone: '0612345678',
    daily_rate: 500,
    hourly_rate: null,
    is_internal: true,
    is_active: true,
    specialties: ['Qualiopi', 'RGPD'],
    bio: null,
    cv_url: null,
    cv_updated_at: null,
    company_id: null,
    profile_id: null,
    qualifications: null,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
    ...overrides,
  }
}

function renderPage() {
  return renderWithQueryClient(
    <MemoryRouter>
      <TrainersListPage />
    </MemoryRouter>,
  )
}

describe('TrainersListPage', () => {
  beforeEach(() => {
    useTrainersMock.mockReset()
    useCreateTrainerMock.mockReset()
    useCreateTrainerMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false })
  })

  it('shows a loading spinner while trainers are loading', () => {
    useTrainersMock.mockReturnValue({ data: undefined, isLoading: true })

    const { container } = renderPage()

    expect(screen.getByRole('heading', { name: /formateurs/i })).toBeInTheDocument()
    expect(container.querySelector('.animate-spin')).not.toBeNull()
  })

  it('renders the empty state when no trainers exist', () => {
    useTrainersMock.mockReturnValue({ data: [], isLoading: false })

    renderPage()

    expect(screen.getByText(/aucun formateur/i)).toBeInTheDocument()
    expect(screen.getByText(/commencez par ajouter un formateur/i)).toBeInTheDocument()
  })

  it('renders a card per trainer with name, email, daily rate and specialties', () => {
    useTrainersMock.mockReturnValue({
      data: [
        makeTrainer(),
        makeTrainer({
          id: 'tr-2',
          first_name: 'Marie',
          last_name: 'Dupont',
          email: 'marie@example.com',
          is_internal: false,
          specialties: ['Management', 'Lean', 'Agile', 'DevOps'],
          daily_rate: 700,
        }),
      ],
      isLoading: false,
    })

    renderPage()

    expect(screen.getByText('Jean Martin')).toBeInTheDocument()
    expect(screen.getByText('Marie Dupont')).toBeInTheDocument()
    expect(screen.getByText('jean@example.com')).toBeInTheDocument()
    expect(screen.getByText('marie@example.com')).toBeInTheDocument()
    expect(screen.getByText('Interne')).toBeInTheDocument()
    expect(screen.getByText('Externe')).toBeInTheDocument()
    // Specialties: first 3 shown + a "+1" badge for the 4th
    expect(screen.getByText('Management')).toBeInTheDocument()
    expect(screen.getByText('+1')).toBeInTheDocument()

    // Links to detail pages
    const links = screen.getAllByRole('link')
    const hrefs = links.map((a) => a.getAttribute('href'))
    expect(hrefs).toContain('/formateurs/tr-1')
    expect(hrefs).toContain('/formateurs/tr-2')
  })

  it('filters trainers by name', async () => {
    const user = userEvent.setup()
    useTrainersMock.mockReturnValue({
      data: [
        makeTrainer(),
        makeTrainer({ id: 'tr-2', first_name: 'Marie', last_name: 'Dupont', email: 'marie@example.com' }),
      ],
      isLoading: false,
    })

    renderPage()

    await user.type(screen.getByPlaceholderText(/rechercher par nom/i), 'dupont')

    expect(screen.queryByText('Jean Martin')).not.toBeInTheDocument()
    expect(screen.getByText('Marie Dupont')).toBeInTheDocument()
  })

  it('filters trainers by specialty', async () => {
    const user = userEvent.setup()
    useTrainersMock.mockReturnValue({
      data: [
        makeTrainer(),
        makeTrainer({ id: 'tr-2', first_name: 'Marie', last_name: 'Dupont', specialties: ['Management'] }),
      ],
      isLoading: false,
    })

    renderPage()

    await user.type(screen.getByPlaceholderText(/rechercher par nom/i), 'management')

    expect(screen.queryByText('Jean Martin')).not.toBeInTheDocument()
    expect(screen.getByText('Marie Dupont')).toBeInTheDocument()
  })

  it('toggles the create form when "Nouveau formateur" is clicked', async () => {
    const user = userEvent.setup()
    useTrainersMock.mockReturnValue({ data: [makeTrainer()], isLoading: false })

    renderPage()

    expect(screen.queryByTestId('trainer-form-stub')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /nouveau formateur/i }))

    expect(screen.getByTestId('trainer-form-stub')).toBeInTheDocument()
  })

  it('shows "aucun résultat" when search filters everything out', async () => {
    const user = userEvent.setup()
    useTrainersMock.mockReturnValue({ data: [makeTrainer()], isLoading: false })

    renderPage()

    await user.type(screen.getByPlaceholderText(/rechercher par nom/i), 'zzz')

    expect(screen.getByText(/aucun formateur/i)).toBeInTheDocument()
    expect(screen.getByText(/aucun résultat/i)).toBeInTheDocument()
  })
})
