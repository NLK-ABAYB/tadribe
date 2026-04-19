import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { PDFHeader, type PDFOrgInfo } from '@/features/shared/pdf/PDFHeader'
import { PDFFooter } from '@/features/shared/pdf/PDFFooter'

const styles = StyleSheet.create({
  page: { padding: 40, paddingBottom: 90, fontSize: 10, fontFamily: 'Helvetica' },
  subtitle: { fontSize: 11, textAlign: 'center', marginBottom: 20, color: '#555' },
  greeting: { fontSize: 11, marginBottom: 10 },
  paragraph: { fontSize: 10, lineHeight: 1.5, marginBottom: 8 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 6, color: '#1E3A5F' },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { width: '30%', fontWeight: 'bold' },
  value: { width: '70%' },
  list: { marginLeft: 10, marginTop: 4 },
  listItem: { marginBottom: 3, fontSize: 10 },
  bold: { fontWeight: 'bold' },
  signatureBlock: { marginTop: 30, alignItems: 'flex-end' },
  signatureLine: { borderBottom: '1 solid #333', width: 200, marginTop: 30, marginBottom: 5 },
})

interface ConvocationData {
  organization: PDFOrgInfo
  beneficiary: {
    first_name: string
    last_name: string
  }
  formation: {
    title: string
    objectives: string[]
    prerequisites: string | null
    duration_hours: number | null
    accessibility: string | null
  }
  session: {
    start_date: string
    end_date: string
    location: string
    is_remote: boolean
    remote_url: string | null
    code: string | null
  }
  trainer: { first_name: string; last_name: string } | null
  issued_date: string
  reference?: string
  legalMentions?: string | null
}

export function ConvocationPDF({ data }: { data: ConvocationData }) {
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const fmtShort = (d: string) => new Date(d).toLocaleDateString('fr-FR')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader
          organization={data.organization}
          documentTitle="CONVOCATION"
          documentRef={data.reference ?? data.session.code ?? undefined}
        />
        <Text style={styles.subtitle}>Invitation à une action de formation professionnelle</Text>

        <Text style={styles.greeting}>
          Madame, Monsieur <Text style={styles.bold}>{data.beneficiary.first_name} {data.beneficiary.last_name}</Text>,
        </Text>
        <Text style={styles.paragraph}>
          Nous avons le plaisir de vous convier à l'action de formation dont les modalités sont précisées ci-après.
          Merci de bien vouloir vous présenter à l'heure indiquée, muni de ce document.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Formation</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Intitulé :</Text>
            <Text style={styles.value}>{data.formation.title}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Durée :</Text>
            <Text style={styles.value}>{data.formation.duration_hours ?? '—'} heures</Text>
          </View>
          {data.trainer && (
            <View style={styles.row}>
              <Text style={styles.label}>Formateur :</Text>
              <Text style={styles.value}>{data.trainer.first_name} {data.trainer.last_name}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dates et lieu</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Du :</Text>
            <Text style={styles.value}>{fmtDate(data.session.start_date)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Au :</Text>
            <Text style={styles.value}>{fmtDate(data.session.end_date)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Modalité :</Text>
            <Text style={styles.value}>{data.session.is_remote ? 'Distanciel' : 'Présentiel'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Lieu :</Text>
            <Text style={styles.value}>
              {data.session.is_remote
                ? data.session.remote_url
                  ? `En ligne — ${data.session.remote_url}`
                  : 'Lien de connexion envoyé séparément'
                : data.session.location}
            </Text>
          </View>
        </View>

        {data.formation.objectives?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Objectifs pédagogiques</Text>
            <View style={styles.list}>
              {data.formation.objectives.map((obj, i) => (
                <Text key={i} style={styles.listItem}>• {obj}</Text>
              ))}
            </View>
          </View>
        )}

        {data.formation.prerequisites && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prérequis</Text>
            <Text style={styles.paragraph}>{data.formation.prerequisites}</Text>
          </View>
        )}

        {data.formation.accessibility && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accessibilité PSH (Qualiopi ind. 26)</Text>
            <Text style={styles.paragraph}>{data.formation.accessibility}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Règlement intérieur</Text>
          <Text style={styles.paragraph}>
            Par votre présence, vous acceptez le règlement intérieur de l'organisme de formation, disponible sur simple
            demande. Toute absence doit être justifiée auprès de {data.organization.name}
            {data.organization.email ? ` (${data.organization.email})` : ''}.
          </Text>
        </View>

        <View style={styles.signatureBlock}>
          <Text>Fait le {fmtShort(data.issued_date)}</Text>
          <Text style={{ marginTop: 5 }}>Pour l'organisme de formation,</Text>
          <View style={styles.signatureLine} />
          <Text>Cachet et signature</Text>
        </View>

        <PDFFooter organization={data.organization} docType="convocation" legalMentions={data.legalMentions ?? null} />
      </Page>
    </Document>
  )
}
