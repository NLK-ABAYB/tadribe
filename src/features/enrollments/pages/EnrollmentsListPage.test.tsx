import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/test/query-client'
import type { Tables } from '@/types/supabase'

type Enrollment = Tables<'enrollments'>

interface EnrollmentWithRelations extends Enrollment {
  beneficiaries: { first_name: string; last_name: string; email: string | null } | null
  sessions: { code: string | null; formations: { title: string } | null } | null
  companies: { name: string } | null
}

const useEnrollmentsMock = vi.fn()
const useCreateEnrollmentMock = vi.fn()
vi.mock('../hooks/use-enrollments', () => ({
  useEnrollments: () => useEnrollmentsMock(),
  useCreateEnrollment: () => useCreateEnrollmentMock(),
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

vi.mock('../components/EnrollmentForm', () => ({
  EnrollmentForm: () => <div data-testid="enrollment-form-stub" />,
}))

import { EnrollmentsListPage } from './EnrollmentsListPage'

function makeEnrollment(overrides: Partial<EnrollmentWithRelations> = {}): EnrollmentWithRelations {
  return {
    id: 'enr-1',
    organization_id: 'org-1',
    session_id: 'sess-1',
    beneficiary_id: 'ben-1',
    company_id: 'co-1',
    status: 'confirme',
    enrollment_date: '2026-04-01',
    contract_type: null,
    convention_signed: null,
    convention_date: null,
    convocation_sent: null,
    convocation_date: null,
    positioning_done: null,
    positioning_date: null,
    positioning_notes: null,
    positioning_result: null,
    rules_acknowledged: null,
    welcome_booklet_sent: null,
    retraction_deadline: null,
    completion_date: null,
    dropout_date: null,
    dropout_reason: null,
    notes: null,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
    beneficiaries: { first_name: 'Alice', last_name: 'Durand', email: 'alice@example.com' },
    sessions: { code: 'S-2026-01', formations: { title: 'Qualiopi Essentials' } },
    companies: { name: 'ACME' },
    ...overrides,
  }
}

function renderPage() {
  return renderWithQueryClient(
    <MemoryRouter>
      <EnrollmentsListPage />
    </MemoryRouter>,
  )
}

describe('EnrollmentsListPage', () => {
  beforeEach(() => {
    useEnrollmentsMock.mockReset()
    useCreateEnrollmentMock.mockReset()
    useCreateEnrollmentMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false })
  })

  it('shows a loading spinner while enrollments are loading', () => {
    useEnrollmentsMock.mockReturnValue({ data: undefined, isLoading: true })

    const { container } = renderPage()

    expect(screen.getByRole('heading', { name: /inscriptions/i })).toBeInTheDocument()
    expect(container.querySelector('.animate-spin')).not.toBeNull()
  })

  it('renders the empty state when no enrollments exist', () => {
    useEnrollmentsMock.mockReturnValue({ data: [], isLoading: false })

    renderPage()

    expect(screen.getByText(/aucune inscription/i)).toBeInTheDocument()
    expect(screen.getByText(/les inscriptions apparaîtront ici/i)).toBeInTheDocument()
  })

  it('renders a row per enrollment with beneficiary, formation, session and company', () => {
    useEnrollmentsMock.mockReturnValue({
      data: [
        makeEnrollment(),
        makeEnrollment({
          id: 'enr-2',
          status: 'en_formation',
          enrollment_date: '2026-04-10',
          beneficiaries: { first_name: 'Bob', last_name: 'Leroy', email: 'bob@example.com' },
          sessions: { code: 'S-2026-02', formations: { title: 'RGPD Formations' } },
          companies: { name: 'Beta SAS' },
        }),
      ],
      isLoading: false,
    })

    renderPage()

    // Beneficiary names as links
    expect(screen.getByRole('link', { name: /durand alice/i })).toHaveAttribute('href', '/inscriptions/enr-1')
    expect(screen.getByRole('link', { name: /leroy bob/i })).toHaveAttribute('href', '/inscriptions/enr-2')

    // Formation titles
    expect(screen.getByText('Qualiopi Essentials')).toBeInTheDocument()
    expect(screen.getByText('RGPD Formations')).toBeInTheDocument()

    // Session codes
    expect(screen.getByText('S-2026-01')).toBeInTheDocument()
    expect(screen.getByText('S-2026-02')).toBeInTheDocument()

    // Companies
    expect(screen.getByText('ACME')).toBeInTheDocument()
    expect(screen.getByText('Beta SAS')).toBeInTheDocument()

    // Status badges (also present in filter dropdown, so use getAllByText)
    expect(screen.getAllByText('Confirmé').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('En formation').length).toBeGreaterThanOrEqual(1)

    // Table rendered (1 header + 2 data rows)
    expect(screen.getAllByRole('row')).toHaveLength(3)
  })

  it('filters enrollments by beneficiary name', async () => {
    const user = userEvent.setup()
    useEnrollmentsMock.mockReturnValue({
      data: [
        makeEnrollment(),
        makeEnrollment({
          id: 'enr-2',
          beneficiaries: { first_name: 'Bob', last_name: 'Leroy', email: null },
          sessions: { code: 'S-2026-02', formations: { title: 'RGPD Formations' } },
        }),
      ],
      isLoading: false,
    })

    renderPage()

    await user.type(screen.getByPlaceholderText(/rechercher par nom/i), 'leroy')

    expect(screen.queryByText('Qualiopi Essentials')).not.toBeInTheDocument()
    expect(screen.getByText('RGPD Formations')).toBeInTheDocument()
  })

  it('filters enrollments by formation title', async () => {
    const user = userEvent.setup()
    useEnrollmentsMock.mockReturnValue({
      data: [
        makeEnrollment(),
        makeEnrollment({
          id: 'enr-2',
          beneficiaries: { first_name: 'Bob', last_name: 'Leroy', email: null },
          sessions: { code: 'S-2026-02', formations: { title: 'RGPD Formations' } },
        }),
      ],
      isLoading: false,
    })

    renderPage()

    await user.type(screen.getByPlaceholderText(/rechercher par nom/i), 'rgpd')

    expect(screen.queryByText(/durand/i)).not.toBeInTheDocument()
    expect(screen.getByText(/leroy/i)).toBeInTheDocument()
  })

  it('toggles the create form when "Nouvelle inscription" is clicked', async () => {
    const user = userEvent.setup()
    useEnrollmentsMock.mockReturnValue({ data: [makeEnrollment()], isLoading: false })

    renderPage()

    expect(screen.queryByTestId('enrollment-form-stub')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /nouvelle inscription/i }))

    expect(screen.getByTestId('enrollment-form-stub')).toBeInTheDocument()
  })

  it('shows "aucun résultat" when search filters everything out', async () => {
    const user = userEvent.setup()
    useEnrollmentsMock.mockReturnValue({ data: [makeEnrollment()], isLoading: false })

    renderPage()

    await user.type(screen.getByPlaceholderText(/rechercher par nom/i), 'zzz')

    expect(screen.getByText(/aucune inscription/i)).toBeInTheDocument()
    expect(screen.getByText(/aucun résultat/i)).toBeInTheDocument()
  })
})
