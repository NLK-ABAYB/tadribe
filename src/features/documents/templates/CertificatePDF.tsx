import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 5, marginTop: 40 },
  subtitle: { fontSize: 12, textAlign: 'center', marginBottom: 30, color: '#555' },
  body: { marginTop: 20, lineHeight: 1.6 },
  bold: { fontWeight: 'bold' },
  section: { marginBottom: 15 },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { width: '35%', fontWeight: 'bold' },
  value: { width: '65%' },
  certify: { fontSize: 11, textAlign: 'center', marginTop: 30, marginBottom: 30, lineHeight: 1.8 },
  signatureBlock: { marginTop: 50, alignItems: 'flex-end' },
  signatureLine: { borderBottom: '1 solid #333', width: 200, marginTop: 40, marginBottom: 5 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#666', textAlign: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  orgName: { fontSize: 14, fontWeight: 'bold' },
  objectivesList: { marginLeft: 15, marginTop: 5 },
})

interface CertificateData {
  organization: {
    name: string
    siret: string
    nda: string | null
  }
  beneficiary: {
    first_name: string
    last_name: string
  }
  formation: {
    title: string
    objectives: string[]
    duration_hours: number | null
  }
  session: {
    start_date: string
    end_date: string
    code: string | null
  }
  issued_date: string
  objectives_achieved: string[]
}

export function CertificatePDF({ data }: { data: CertificateData }) {
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.orgName}>{data.organization.name}</Text>
            <Text>SIRET : {data.organization.siret}</Text>
            {data.organization.nda && <Text>NDA : {data.organization.nda}</Text>}
          </View>
        </View>

        <Text style={styles.title}>CERTIFICAT DE RÉALISATION</Text>
        <Text style={styles.subtitle}>
          Article L. 6353-1 du Code du travail
        </Text>

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

        <Text style={styles.footer}>
          {data.organization.name} — SIRET : {data.organization.siret}
          {data.organization.nda ? ` — NDA : ${data.organization.nda}` : ''}
        </Text>
      </Page>
    </Document>
  )
}
