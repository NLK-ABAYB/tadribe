import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { PDFHeader, type PDFOrgInfo } from '@/features/shared/pdf/PDFHeader'
import { PDFFooter } from '@/features/shared/pdf/PDFFooter'

const styles = StyleSheet.create({
  page: { padding: 40, paddingBottom: 90, fontSize: 10, fontFamily: 'Helvetica' },
  subtitle: { fontSize: 11, textAlign: 'center', marginBottom: 18, color: '#555' },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 5, borderBottom: '1 solid #333', paddingBottom: 3 },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { width: '35%', fontWeight: 'bold' },
  value: { width: '65%' },
  article: { marginBottom: 10 },
  articleTitle: { fontWeight: 'bold', marginBottom: 3 },
  paragraph: { lineHeight: 1.4, marginBottom: 5 },
  signatureBlock: { flexDirection: 'row', marginTop: 30 },
  signatureColumn: { width: '50%', padding: 10 },
  signatureLine: { borderBottom: '1 solid #333', marginTop: 40, marginBottom: 5 },
})

interface ConventionData {
  organization: PDFOrgInfo
  company: {
    name: string
    siret: string | null
    address: string
  }
  formation: {
    title: string
    objectives: string[]
    duration_hours: number | null
    teaching_methods: string | null
    assessment_methods: string | null
    prerequisites: string | null
  }
  session: {
    start_date: string
    end_date: string
    location: string
    code: string | null
  }
  beneficiaries: { first_name: string; last_name: string }[]
  price_ht: number
  price_ttc: number | null
  tva_exempt: boolean
  convention_date: string
  reference?: string
  legalMentions?: string | null
}

export function ConventionPDF({ data }: { data: ConventionData }) {
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR')
  const fmtMoney = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n).replace(/\u00A0/g, ' ').replace(/\u202F/g, ' ')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader
          organization={data.organization}
          documentTitle="CONVENTION DE FORMATION PROFESSIONNELLE"
          documentRef={data.reference}
        />
        <Text style={styles.subtitle}>Articles L.6353-1 et L.6353-2 du Code du travail</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ENTRE LES SOUSSIGNÉS</Text>
          <View style={styles.article}>
            <Text style={styles.paragraph}>L'organisme de formation : {data.organization.name}</Text>
            <View style={styles.row}>
              <Text style={styles.label}>SIRET :</Text>
              <Text style={styles.value}>{data.organization.siret}</Text>
            </View>
            {data.organization.nda && (
              <View style={styles.row}>
                <Text style={styles.label}>N° déclaration d'activité :</Text>
                <Text style={styles.value}>{data.organization.nda}</Text>
              </View>
            )}
          </View>
          <View style={styles.article}>
            <Text style={styles.paragraph}>Et l'entreprise : {data.company.name}</Text>
            {data.company.siret && (
              <View style={styles.row}>
                <Text style={styles.label}>SIRET :</Text>
                <Text style={styles.value}>{data.company.siret}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.articleTitle}>Article 1 — Objet</Text>
          <Text style={styles.paragraph}>
            L'organisme de formation s'engage à organiser l'action de formation suivante :
          </Text>
          <View style={styles.row}>
            <Text style={styles.label}>Intitulé :</Text>
            <Text style={styles.value}>{data.formation.title}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.articleTitle}>Article 2 — Objectifs</Text>
          {data.formation.objectives?.map((obj, i) => (
            <Text key={i} style={styles.paragraph}>• {obj}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.articleTitle}>Article 3 — Organisation</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Durée :</Text>
            <Text style={styles.value}>{data.formation.duration_hours ?? '—'}h</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dates :</Text>
            <Text style={styles.value}>Du {fmtDate(data.session.start_date)} au {fmtDate(data.session.end_date)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Lieu :</Text>
            <Text style={styles.value}>{data.session.location}</Text>
          </View>
          {data.formation.prerequisites && (
            <View style={styles.row}>
              <Text style={styles.label}>Prérequis :</Text>
              <Text style={styles.value}>{data.formation.prerequisites}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.articleTitle}>Article 4 — Bénéficiaires</Text>
          {data.beneficiaries.map((b, i) => (
            <Text key={i} style={styles.paragraph}>• {b.first_name} {b.last_name}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.articleTitle}>Article 5 — Prix</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Montant HT :</Text>
            <Text style={styles.value}>{fmtMoney(data.price_ht)}</Text>
          </View>
          {data.tva_exempt ? (
            <Text style={styles.paragraph}>
              TVA non applicable, art. 261 du Code général des impôts.
            </Text>
          ) : data.price_ttc != null ? (
            <View style={styles.row}>
              <Text style={styles.label}>Montant TTC :</Text>
              <Text style={styles.value}>{fmtMoney(data.price_ttc)}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.signatureBlock}>
          <View style={styles.signatureColumn}>
            <Text>Fait à __________, le {fmtDate(data.convention_date)}</Text>
            <Text style={{ marginTop: 5 }}>Pour l'organisme de formation</Text>
            <View style={styles.signatureLine} />
            <Text>{data.organization.name}</Text>
          </View>
          <View style={styles.signatureColumn}>
            <Text>Fait à __________, le {fmtDate(data.convention_date)}</Text>
            <Text style={{ marginTop: 5 }}>Pour l'entreprise</Text>
            <View style={styles.signatureLine} />
            <Text>{data.company.name}</Text>
          </View>
        </View>

        <PDFFooter organization={data.organization} docType="convention" legalMentions={data.legalMentions ?? null} />
      </Page>
    </Document>
  )
}
