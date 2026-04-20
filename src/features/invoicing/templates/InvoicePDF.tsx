import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { PDFHeader, type PDFOrgInfo } from '@/features/shared/pdf/PDFHeader'
import { PDFFooter } from '@/features/shared/pdf/PDFFooter'

const styles = StyleSheet.create({
  page: { padding: 40, paddingBottom: 90, fontSize: 10, fontFamily: 'Helvetica' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, fontSize: 9, color: '#666' },
  partyBlock: { marginBottom: 16 },
  partyTitle: { fontSize: 9, color: '#666', marginBottom: 3, textTransform: 'uppercase' },
  partyName: { fontSize: 11, fontWeight: 'bold', marginBottom: 3 },
  table: { marginTop: 10, marginBottom: 15 },
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
  lines: { description: string; quantity: number; unit_price_ht: number; total_ht: number }[]
  organization: PDFOrgInfo
  legalMentions?: string | null
}

export function InvoicePDF({ invoice, lines, organization, legalMentions }: InvoicePDFProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n).replace(/\u00A0/g, ' ').replace(/\u202F/g, ' ')
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR')

  const amountPaid = invoice.amount_paid ?? 0
  const remaining = invoice.total_ttc - amountPaid

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader organization={organization} documentTitle="FACTURE" documentRef={invoice.invoice_number} />

        <View style={styles.metaRow}>
          <Text>Date d'émission : {fmtDate(invoice.issue_date)}</Text>
          <Text>Échéance : {fmtDate(invoice.due_date)}</Text>
        </View>

        <View style={styles.partyBlock}>
          <Text style={styles.partyTitle}>Destinataire</Text>
          <Text style={styles.partyName}>{invoice.recipient_name}</Text>
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
              <Text style={styles.colDesc}>{line.description ?? ''}</Text>
              <Text style={styles.colQty}>{line.quantity ?? 0}</Text>
              <Text style={styles.colPrice}>{fmt(line.unit_price_ht ?? 0)}</Text>
              <Text style={styles.colTotal}>{fmt(line.total_ht ?? 0)}</Text>
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

        <PDFFooter
          organization={organization}
          docType="facture"
          tvaMention={invoice.tva_mention}
          legalMentions={legalMentions ?? null}
        />
      </Page>
    </Document>
  )
}
