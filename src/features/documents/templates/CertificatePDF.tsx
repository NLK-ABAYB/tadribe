import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { PDFHeader, type PDFOrgInfo } from '@/features/shared/pdf/PDFHeader'
import { PDFFooter } from '@/features/shared/pdf/PDFFooter'

const styles = StyleSheet.create({
  page: { padding: 40, paddingBottom: 90, fontSize: 10, fontFamily: 'Helvetica' },
  subtitle: { fontSize: 11, textAlign: 'center', marginBottom: 20, color: '#555' },
  body: { marginTop: 10, lineHeight: 1.6 },
  bold: { fontWeight: 'bold' },
  section: { marginBottom: 14 },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { width: '35%', fontWeight: 'bold' },
  value: { width: '65%' },
  certify: { fontSize: 11, textAlign: 'center', marginTop: 20, marginBottom: 20, lineHeight: 1.8 },
  signatureBlock: { marginTop: 30, alignItems: 'flex-end' },
  signatureLine: { borderBottom: '1 solid #333', width: 200, marginTop: 30, marginBottom: 5 },
  objectivesList: { marginLeft: 15, marginTop: 5 },
})

interface CertificateData {
  organization: PDFOrgInfo
  beneficiary: { first_name: string; last_name: string }
  formation: { title: string; objectives: string[]; duration_hours: number | null }
  session: { start_date: string; end_date: string; code: string | null }
  issued_date: string
  objectives_achieved: string[]
  reference?: string
  legalMentions?: string | null
}

export function CertificatePDF({ data }: { data: CertificateData }) {
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader
          organization={data.organization}
          documentTitle="CERTIFICAT DE RÉALISATION"
          documentRef={data.reference}
        />
        <Text style={styles.subtitle}>Article L. 6353-1 du Code du travail</Text>

        <View style={styles.body}>
          <Text style={styles.certify}>
            Je soussigné(e), représentant de l'organisme de formation{'\n'}
            <Text style={styles.bold}>{data.organization.name}</Text>{'\n'}
            atteste que
          </Text>

          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.label}>Bénéficiaire :</Text>
              <Text style={styles.value}>{data.beneficiary.first_name} {data.beneficiary.last_name}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={{ marginBottom: 5 }}>a suivi l'action de formation suivante :</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Intitulé :</Text>
              <Text style={styles.value}>{data.formation.title}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Durée :</Text>
              <Text style={styles.value}>{data.formation.duration_hours ?? '—'} heures</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Du :</Text>
              <Text style={styles.value}>{fmtDate(data.session.start_date)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Au :</Text>
              <Text style={styles.value}>{fmtDate(data.session.end_date)}</Text>
            </View>
          </View>

          {data.objectives_achieved?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.bold}>Objectifs atteints :</Text>
              <View style={styles.objectivesList}>
                {data.objectives_achieved.map((obj, i) => (
                  <Text key={i}>• {obj}</Text>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.signatureBlock}>
          <Text>Fait le {fmtDate(data.issued_date)}</Text>
          <Text style={{ marginTop: 5 }}>Pour l'organisme de formation,</Text>
          <View style={styles.signatureLine} />
          <Text>Cachet et signature</Text>
        </View>

        <PDFFooter organization={data.organization} docType="certificat" legalMentions={data.legalMentions ?? null} />
      </Page>
    </Document>
  )
}
