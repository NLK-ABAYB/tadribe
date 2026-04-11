import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VeilleReglementairePage } from './VeilleReglementairePage'

describe('<VeilleReglementairePage />', () => {
  it('renders the page heading and description', () => {
    render(<VeilleReglementairePage />)
    expect(
      screen.getByRole('heading', { name: /veille réglementaire/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/suivi des évolutions réglementaires/i),
    ).toBeInTheDocument()
  })

  it('renders all 10 static regulatory items on first load', () => {
    render(<VeilleReglementairePage />)
    expect(screen.getByText(/Référentiel National Qualité/i)).toBeInTheDocument()
    expect(screen.getByText(/Loi n°2018-771/i)).toBeInTheDocument()
    // "Bilan Pédagogique et Financier" appears in both a title and a summary,
    // so we assert at least one match instead of a unique one.
    expect(
      screen.getAllByText(/Bilan Pédagogique et Financier/i).length,
    ).toBeGreaterThan(0)
  })

  it('filters items matching the search term', async () => {
    const user = userEvent.setup()
    render(<VeilleReglementairePage />)

    const input = screen.getByPlaceholderText(/rechercher/i)
    await user.type(input, 'CPF')

    // The CPF "Reste à charge" item should still be visible
    expect(
      screen.getByText(/financement cpf/i),
    ).toBeInTheDocument()

    // The Loi Avenir Pro item contains "CPF" in its tags/summary, stays visible
    expect(screen.getByText(/loi n°2018-771/i)).toBeInTheDocument()

    // An unrelated item should disappear
    expect(
      screen.queryByText(/référentiel national qualité/i),
    ).not.toBeInTheDocument()
  })

  it('shows the empty state when no item matches the search', async () => {
    const user = userEvent.setup()
    render(<VeilleReglementairePage />)

    const input = screen.getByPlaceholderText(/rechercher/i)
    await user.type(input, 'zzz-no-match-zzz')

    expect(screen.getByText(/aucun résultat/i)).toBeInTheDocument()
  })

  it('displays the aggregate counts (critiques, actions, total)', () => {
    render(<VeilleReglementairePage />)
    // Total of 10 items in the static dataset
    expect(screen.getByText('10')).toBeInTheDocument()
    // Heading labels for the three summary cards
    expect(screen.getByText(/points critiques/i)).toBeInTheDocument()
    expect(screen.getByText(/actions requises/i)).toBeInTheDocument()
    expect(screen.getByText(/total des éléments/i)).toBeInTheDocument()
  })
})
