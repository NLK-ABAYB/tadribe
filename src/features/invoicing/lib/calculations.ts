export interface InvoiceLineInput {
  quantity?: number | null
  unit_price_ht?: number | null
}

export interface InvoiceTotals {
  totalHt: number
  tvaAmount: number
  totalTtc: number
}

/**
 * Computes HT / TVA / TTC totals from a list of invoice lines and a VAT rate (in percent).
 * Null/undefined quantity or unit_price_ht are treated as 0.
 * A negative VAT rate is clamped to 0.
 */
export function computeInvoiceTotals(
  lines: InvoiceLineInput[] | null | undefined,
  tvaRate: number | null | undefined,
): InvoiceTotals {
  const totalHt = (lines ?? []).reduce(
    (sum, line) => sum + (line.quantity || 0) * (line.unit_price_ht || 0),
    0,
  )
  const safeRate = Math.max(0, tvaRate || 0)
  const tvaAmount = (totalHt * safeRate) / 100
  const totalTtc = totalHt + tvaAmount
  return { totalHt, tvaAmount, totalTtc }
}

/**
 * Formats a number as French euros.
 */
export function formatEuros(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}
