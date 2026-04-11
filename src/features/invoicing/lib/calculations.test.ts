import { describe, expect, it } from 'vitest'
import { computeInvoiceTotals, formatEuros } from './calculations'

describe('computeInvoiceTotals', () => {
  it('returns zero totals for an empty list', () => {
    expect(computeInvoiceTotals([], 20)).toEqual({
      totalHt: 0,
      tvaAmount: 0,
      totalTtc: 0,
    })
  })

  it('handles a null or undefined list', () => {
    expect(computeInvoiceTotals(null, 20)).toEqual({
      totalHt: 0,
      tvaAmount: 0,
      totalTtc: 0,
    })
    expect(computeInvoiceTotals(undefined, 20)).toEqual({
      totalHt: 0,
      tvaAmount: 0,
      totalTtc: 0,
    })
  })

  it('computes HT by summing quantity * unit_price_ht for each line', () => {
    const { totalHt } = computeInvoiceTotals(
      [
        { quantity: 2, unit_price_ht: 100 },
        { quantity: 1, unit_price_ht: 50 },
      ],
      0,
    )
    expect(totalHt).toBe(250)
  })

  it('applies the VAT rate to the HT total', () => {
    const totals = computeInvoiceTotals(
      [{ quantity: 1, unit_price_ht: 1000 }],
      20,
    )
    expect(totals.totalHt).toBe(1000)
    expect(totals.tvaAmount).toBe(200)
    expect(totals.totalTtc).toBe(1200)
  })

  it('returns the HT amount as TTC when VAT is 0 (exonération)', () => {
    const totals = computeInvoiceTotals(
      [{ quantity: 3, unit_price_ht: 500 }],
      0,
    )
    expect(totals.totalHt).toBe(1500)
    expect(totals.tvaAmount).toBe(0)
    expect(totals.totalTtc).toBe(1500)
  })

  it('treats null/undefined quantity or unit_price_ht as zero', () => {
    const totals = computeInvoiceTotals(
      [
        { quantity: null, unit_price_ht: 100 },
        { quantity: 2, unit_price_ht: undefined },
        { quantity: 1, unit_price_ht: 50 },
      ],
      10,
    )
    expect(totals.totalHt).toBe(50)
    expect(totals.tvaAmount).toBe(5)
    expect(totals.totalTtc).toBe(55)
  })

  it('supports fractional quantities and prices', () => {
    const totals = computeInvoiceTotals(
      [{ quantity: 1.5, unit_price_ht: 200 }],
      20,
    )
    expect(totals.totalHt).toBe(300)
    expect(totals.tvaAmount).toBe(60)
    expect(totals.totalTtc).toBe(360)
  })

  it('clamps negative VAT rates to zero', () => {
    const totals = computeInvoiceTotals(
      [{ quantity: 1, unit_price_ht: 100 }],
      -5,
    )
    expect(totals.tvaAmount).toBe(0)
    expect(totals.totalTtc).toBe(100)
  })

  it('handles a null VAT rate as zero', () => {
    const totals = computeInvoiceTotals(
      [{ quantity: 1, unit_price_ht: 100 }],
      null,
    )
    expect(totals.tvaAmount).toBe(0)
    expect(totals.totalTtc).toBe(100)
  })
})

describe('formatEuros', () => {
  it('formats whole numbers with the euro symbol', () => {
    // fr-FR uses non-breaking spaces; normalize for assertion
    const result = formatEuros(1500).replace(/\s/g, ' ')
    expect(result).toMatch(/1\s?500,00\s?€/)
  })

  it('formats decimals with two digits', () => {
    const result = formatEuros(12.5).replace(/\s/g, ' ')
    expect(result).toContain('12,50')
  })

  it('formats zero', () => {
    const result = formatEuros(0).replace(/\s/g, ' ')
    expect(result).toContain('0,00')
  })
})
