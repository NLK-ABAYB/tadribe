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
  paymentSection: { marginTop: 15, padding: 10, backgroundColor: '#f5f5f5', borderRadius: 4 },
  paymentTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', fontSize: 9, padding: 2 },
  mentions: { marginTop: 20, fontSize: 8, color: '#555', lineHeight: 1.4 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#666', textAlign: 'center' },
})

interface InvoicePDFProps {
  invoice: {
    invoice_number: string
    issue_date: string
    due_date: string
    total_ht: number
    tva_rate: number | null
    tva_amount: number | null
    total_ttc: number
    amount_paid: number | null
    nda_mention: string | null
    tva_mention: string | null
    recipient_name: string
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
}

export function InvoicePDF({ invoice, lines, organization }: InvoicePDFProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR')

  const amountPaid = invoice.amount_paid ?? 0
  const remaining = invoice.total_ttc - amountPaid

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>FACTURE</Text>
            <Text style={{ color: '#666', marginTop: 4 }}>N° {invoice.invoice_number}</Text>
          </View>
          <View style={styles.meta}>
            <Text>Date d'émission : {fmtDate(invoice.issue_date)}</Text>
            <Text>Échéance : {fmtDate(invoice.due_date)}</Text>
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
            <Text style={styles.partyName}>{invoice.recipient_name}</Text>
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
            <Text>{fmt(invoice.total_ht)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text>TVA ({invoice.tva_rate ?? 0}%)</Text>
            <Text>{fmt(invoice.tva_amount ?? 0)}</Text>
          </View>
          <View style={styles.totalsRowStrong}>
            <Text>Total TTC</Text>
            <Text>{fmt(invoice.total_ttc)}</Text>
          </View>
        </View>

        {amountPaid > 0 && (
          <View style={styles.paymentSection}>
            <Text style={styles.paymentTitle}>Paiements</Text>
            <View style={styles.paymentRow}>
              <Text>Montant payé</Text>
              <Text>{fmt(amountPaid)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={{ fontWeight: 'bold' }}>Reste dû</Text>
              <Text style={{ fontWeight: 'bold' }}>{fmt(remaining)}</Text>
            </View>
          </View>
        )}

        {(invoice.nda_mention || invoice.tva_mention) && (
          <View style={styles.mentions}>
            {invoice.nda_mention && <Text>{invoice.nda_mention}</Text>}
            {invoice.tva_mention && <Text>{invoice.tva_mention}</Text>}
          </View>
        )}

        {organization.tva_exempt && (
          <Text style={{ ...styles.mentions, marginTop: 8 }}>
            TVA non applicable, art. 261 du CGI (organisme de formation exonéré).
          </Text>
        )}

        <Text style={styles.footer}>
          {organization.name} — SIRET : {organization.siret}
          {organization.nda ? ` — NDA : ${organization.nda}` : ''}
        </Text>
      </Page>
    </Document>
  )
}
