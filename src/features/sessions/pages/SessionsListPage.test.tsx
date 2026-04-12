import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/test/query-client'

const useSessionsMock = vi.fn()
vi.mock('../hooks/use-sessions', () => ({
  useSessions: () => useSessionsMock(),
}))

import { SessionsListPage } from './SessionsListPage'

interface SessionRow {
  id: string
  organization_id: string
  formation_id: string
  code: string | null
  status: 'planifiee' | 'confirmee' | 'en_cours' | 'terminee' | 'annulee'
  start_date: string
  end_date: string
  location_id: string | null
  is_remote: boolean
  remote_url: string | null
  min_participants: number
  max_participants: number | null
  trainer_id: string | null
  coordinator_id: string | null
  notes: string | null
  alternance_calendar: unknown
  created_at: string
  updated_at: string
  formations: { title: string; duration_hours: number; objectives: string[] | null } | null
  trainers: { first_name: string; last_name: string; email: string } | null
  locations: { name: string; address: Record<string, unknown> | null; capacity: number | null } | null
}

function makeSession(overrides: Partial<SessionRow> = {}): SessionRow {
  return {
    id: 'sess-1',
    organization_id: 'org-1',
    formation_id: 'form-1',
    code: 'S-2026-01',
    status: 'planifiee',
    start_date: '2026-05-01',
    end_date: '2026-05-05',
    location_id: 'loc-1',
    is_remote: false,
    remote_url: null,
    min_participants: 1,
    max_participants: 12,
    trainer_id: 'tr-1',
    coordinator_id: null,
    notes: null,
    alternance_calendar: null,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
    formations: { title: 'Qualiopi Essentials', duration_hours: 35, objectives: null },
    trainers: { first_name: 'Jean', last_name: 'Martin', email: 'jean@example.com' },
    locations: { name: 'Centre Paris', address: null, capacity: 20 },
    ...overrides,
  }
}

function renderPage() {
  return renderWithQueryClient(
    <MemoryRouter>
      <SessionsListPage />
    </MemoryRouter>,
  )
}

describe('SessionsListPage', () => {
  beforeEach(() => {
    useSessionsMock.mockReset()
  })

  it('shows a loading spinner while sessions are fetching', () => {
    useSessionsMock.mockReturnValue({ data: undefined, isLoading: true })

    const { container } = renderPage()

    expect(screen.getByRole('heading', { name: /sessions/i })).toBeInTheDocument()
    expect(container.querySelector('.animate-spin')).not.toBeNull()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('renders the empty state with no sessions and no search term', () => {
    useSessionsMock.mockReturnValue({ data: [], isLoading: false })

    renderPage()

    expect(screen.getByText(/aucune session/i)).toBeInTheDocument()
    expect(screen.getByText(/les sessions apparaîtront ici/i)).toBeInTheDocument()
  })

  it('renders a row per session with formation title, trainer and location', () => {
    useSessionsMock.mockReturnValue({
      data: [
        makeSession(),
        makeSession({
          id: 'sess-2',
          code: 'S-2026-02',
          status: 'confirmee',
          is_remote: true,
          locations: null,
          formations: { title: 'RGPD Formations', duration_hours: 14, objectives: null },
          trainers: { first_name: 'Marie', last_name: 'Dupont', email: 'marie@example.com' },
        }),
      ],
      isLoading: false,
    })

    renderPage()

    expect(screen.getByRole('link', { name: 'Qualiopi Essentials' })).toHaveAttribute(
      'href',
      '/dashboard/sessions/sess-1',
    )
    expect(screen.getByRole('link', { name: 'RGPD Formations' })).toHaveAttribute(
      'href',
      '/dashboard/sessions/sess-2',
    )
    expect(screen.getByText('Jean Martin')).toBeInTheDocument()
    expect(screen.getByText('Marie Dupont')).toBeInTheDocument()
    expect(screen.getByText('Centre Paris')).toBeInTheDocument()
    // Remote session should show "Distanciel" instead of a location name
    expect(screen.getByText('Distanciel')).toBeInTheDocument()
  })

  it('filters sessions by trainer full name', async () => {
    const user = userEvent.setup()
    useSessionsMock.mockReturnValue({
      data: [
        makeSession(),
        makeSession({
          id: 'sess-2',
          code: 'S-2026-02',
          formations: { title: 'RGPD Formations', duration_hours: 14, objectives: null },
          trainers: { first_name: 'Marie', last_name: 'Dupont', email: 'marie@example.com' },
        }),
      ],
      isLoading: false,
    })

    renderPage()

    await user.type(screen.getByPlaceholderText(/rechercher par formation/i), 'dupont')

    expect(screen.queryByText('Qualiopi Essentials')).not.toBeInTheDocument()
    expect(screen.getByText('RGPD Formations')).toBeInTheDocument()
  })

  it('shows an "aucun résultat" hint when search filters everything out', async () => {
    const user = userEvent.setup()
    useSessionsMock.mockReturnValue({
      data: [makeSession()],
      isLoading: false,
    })

    renderPage()

    await user.type(screen.getByPlaceholderText(/rechercher par formation/i), 'xyz-no-match')

    expect(screen.getByText(/aucune session/i)).toBeInTheDocument()
    expect(screen.getByText(/aucun résultat/i)).toBeInTheDocument()
  })
})
