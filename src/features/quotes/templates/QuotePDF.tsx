import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1E3A5F' },
  meta: { textAlign: 'right', fontSize: 9 },
  partiesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  partyBlock: { width: '48%' },
  partyTitle: { fontSize: 9, color: '#666', marginBottom: 3, textTransform: 'uppercase' },
  partyName: { fontSize: 11, fontWeight: 'bold', marginBottom: 3 },
  partyDetail: { fontSize: 9, color: '#444', lineHeight: 1.4 },
  table: { marginTop: 15, marginBottom: 15 },
  tableHead: { flexDirection: 'row', backgroundColor: '#1E3A5F', color: 'white', padding: 6, fontSize: 9, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', padding: 6, borderBottom: '1 solid #eee', fontSize: 9 },
  colDesc: { flex: 3 },
  colQty: { flex: 0.6, textAlign: 'center' },
  colPrice: { flex: 1, textAlign: 'right' },
  colTotal: { flex: 1, textAlign: 'right', fontWeight: 'bold' },
  totals: { marginTop: 10, alignSelf: 'flex-end', width: '40%' },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 4, fontSize: 10 },
  totalsRowStrong: { flexDirection: 'row', justifyContent: 'space-between', padding: 6, fontSize: 12, fontWeight: 'bold', borderTop: '1 solid #333', marginTop: 4 },
  terms: { marginTop: 20, fontSize: 9, color: '#555', lineHeight: 1.4 },
  termsTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#666', textAlign: 'center' },
})

interface QuotePDFProps {
  quote: {
    quote_number: string
    created_at: string
    valid_until: string | null
    subtotal_ht: number
    tax_rate: number
    tax_amount: number
    total_ttc: number
    terms: string | null
  }
  lines: {
    description: string
    quantity: number
    unit_price_ht: number
    total_ht: number
  }[]
  organization: {
    name: string
    siret: string
    nda: string | null
    email: string | null
    phone: string | null
    tva_exempt: boolean
  }
  company: {
    name: string
    siret: string | null
  }
}

export function QuotePDF({ quote, lines, organization, company }: QuotePDFProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>DEVIS</Text>
            <Text style={{ color: '#666', marginTop: 4 }}>N° {quote.quote_number}</Text>
          </View>
          <View style={styles.meta}>
            <Text>Date : {fmtDate(quote.created_at)}</Text>
            {quote.valid_until && <Text>Valide jusqu'au : {fmtDate(quote.valid_until)}</Text>}
          </View>
        </View>

        <View style={styles.partiesRow}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyTitle}>Émetteur</Text>
            <Text style={styles.partyName}>{organization.name}</Text>
            <Text style={styles.partyDetail}>SIRET : {organization.siret}</Text>
            {organization.nda && <Text style={styles.partyDetail}>NDA : {organization.nda}</Text>}
            {organization.email && <Text style={styles.partyDetail}>{organization.email}</Text>}
            {organization.phone && <Text style={styles.partyDetail}>{organization.phone}</Text>}
          </View>
          <View style={styles.partyBlock}>
            <Text style={styles.partyTitle}>Destinataire</Text>
            <Text style={styles.partyName}>{company.name}</Text>
            {company.siret && <Text style={styles.partyDetail}>SIRET : {company.siret}</Text>}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQty}>Qté</Text>
            <Text style={styles.colPrice}>PU HT</Text>
            <Text style={styles.colTotal}>Total HT</Text>
          </View>
          {lines.map((line, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDesc}>{line.description}</Text>
              <Text style={styles.colQty}>{line.quantity}</Text>
              <Text style={styles.colPrice}>{fmt(line.unit_price_ht)}</Text>
              <Text style={styles.colTotal}>{fmt(line.total_ht)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <Text>Total HT</Text>
            <Text>{fmt(quote.subtotal_ht)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text>TVA ({quote.tax_rate}%)</Text>
            <Text>{fmt(quote.tax_amount)}</Text>
          </View>
          <View style={styles.totalsRowStrong}>
            <Text>Total TTC</Text>
            <Text>{fmt(quote.total_ttc)}</Text>
          </View>
        </View>

        {organization.tva_exempt && (
          <Text style={{ ...styles.terms, marginTop: 8 }}>
            TVA non applicable, art. 261 du CGI (organisme de formation exonéré).
          </Text>
        )}

        {quote.terms && (
          <View style={styles.terms}>
            <Text style={styles.termsTitle}>Conditions</Text>
            <Text>{quote.terms}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          {organization.name} — SIRET : {organization.siret}
          {organization.nda ? ` — NDA : ${organization.nda}` : ''}
        </Text>
      </Page>
    </Document>
  )
}
