import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/test/query-client'
import type { EvaluationWithRelations } from '../hooks/use-evaluations'

const useEvaluationsMock = vi.fn()
const useCreateEvaluationMock = vi.fn()
vi.mock('../hooks/use-evaluations', () => ({
  useEvaluations: () => useEvaluationsMock(),
  useCreateEvaluation: () => useCreateEvaluationMock(),
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

import { EvaluationsListPage } from './EvaluationsListPage'

function makeEvaluation(overrides: Partial<EvaluationWithRelations> = {}): EvaluationWithRelations {
  return {
    id: 'eval-1',
    organization_id: 'org-1',
    title: 'Satisfaction Formation Qualiopi',
    eval_type: 'satisfaction_chaud',
    session_id: 'sess-1',
    formation_id: null,
    questions: [{ id: 'q1', text: 'Note globale' }, { id: 'q2', text: 'Recommanderiez-vous ?' }],
    is_active: true,
    scheduled_date: '2026-05-15',
    deadline_date: null,
    description: null,
    created_by: null,
    created_at: '2026-04-01T00:00:00Z',
    sessions: { code: 'S-2026-01', formations: { title: 'Qualiopi Essentials' } },
    ...overrides,
  }
}

function renderPage() {
  return renderWithQueryClient(
    <MemoryRouter>
      <EvaluationsListPage />
    </MemoryRouter>,
  )
}

describe('EvaluationsListPage', () => {
  beforeEach(() => {
    useEvaluationsMock.mockReset()
    useCreateEvaluationMock.mockReset()
    useCreateEvaluationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false })
  })

  it('shows a loading spinner while evaluations are loading', () => {
    useEvaluationsMock.mockReturnValue({ data: undefined, isLoading: true })

    const { container } = renderPage()

    expect(screen.getByRole('heading', { name: /évaluations/i })).toBeInTheDocument()
    expect(container.querySelector('.animate-spin')).not.toBeNull()
  })

  it('renders the empty state when no evaluations exist', () => {
    useEvaluationsMock.mockReturnValue({ data: [], isLoading: false })

    renderPage()

    expect(screen.getByText(/aucune évaluation/i)).toBeInTheDocument()
    expect(screen.getByText(/créez une évaluation/i)).toBeInTheDocument()
  })

  it('renders a card per evaluation with title, type, formation and question count', () => {
    useEvaluationsMock.mockReturnValue({
      data: [
        makeEvaluation(),
        makeEvaluation({
          id: 'eval-2',
          title: 'Positionnement RGPD',
          eval_type: 'positionnement',
          questions: [{ id: 'q1', text: 'Connaissances RGPD' }],
          sessions: { code: 'S-2026-02', formations: { title: 'RGPD Formations' } },
        }),
      ],
      isLoading: false,
    })

    renderPage()

    expect(screen.getByText('Satisfaction Formation Qualiopi')).toBeInTheDocument()
    expect(screen.getByText('Positionnement RGPD')).toBeInTheDocument()

    // Type badges (label also appears in the filter dropdown, so use getAllByText)
    expect(screen.getAllByText('Satisfaction à chaud').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Positionnement').length).toBeGreaterThanOrEqual(1)

    // Formation titles
    expect(screen.getByText('Qualiopi Essentials')).toBeInTheDocument()
    expect(screen.getByText('RGPD Formations')).toBeInTheDocument()

    // Question counts
    expect(screen.getByText('2 question(s)')).toBeInTheDocument()
    expect(screen.getByText('1 question(s)')).toBeInTheDocument()

    // Links to detail pages
    const links = screen.getAllByRole('link')
    const hrefs = links.map((a) => a.getAttribute('href'))
    expect(hrefs).toContain('/evaluations/eval-1')
    expect(hrefs).toContain('/evaluations/eval-2')
  })

  it('shows Inactif badge for inactive evaluations', () => {
    useEvaluationsMock.mockReturnValue({
      data: [makeEvaluation({ is_active: false })],
      isLoading: false,
    })

    renderPage()

    expect(screen.getByText('Inactif')).toBeInTheDocument()
  })

  it('filters evaluations by title', async () => {
    const user = userEvent.setup()
    useEvaluationsMock.mockReturnValue({
      data: [
        makeEvaluation(),
        makeEvaluation({ id: 'eval-2', title: 'Positionnement RGPD', eval_type: 'positionnement' }),
      ],
      isLoading: false,
    })

    renderPage()

    await user.type(screen.getByPlaceholderText(/rechercher/i), 'rgpd')

    expect(screen.queryByText('Satisfaction Formation Qualiopi')).not.toBeInTheDocument()
    expect(screen.getByText('Positionnement RGPD')).toBeInTheDocument()
  })

  it('toggles the create form when "Nouvelle évaluation" is clicked', async () => {
    const user = userEvent.setup()
    useEvaluationsMock.mockReturnValue({ data: [makeEvaluation()], isLoading: false })

    renderPage()

    // Initially no form visible
    expect(screen.queryByText(/titre \*/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /nouvelle évaluation/i }))

    // Inline form appears with title input
    expect(screen.getByText(/titre \*/i)).toBeInTheDocument()
  })

  it('shows "aucun résultat" when search filters everything out', async () => {
    const user = userEvent.setup()
    useEvaluationsMock.mockReturnValue({ data: [makeEvaluation()], isLoading: false })

    renderPage()

    await user.type(screen.getByPlaceholderText(/rechercher/i), 'zzz')

    expect(screen.getByText(/aucune évaluation/i)).toBeInTheDocument()
    expect(screen.getByText(/aucun résultat/i)).toBeInTheDocument()
  })
})
