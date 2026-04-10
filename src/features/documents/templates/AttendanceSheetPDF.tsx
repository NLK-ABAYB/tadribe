import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 9, fontFamily: 'Helvetica' },
  header: { marginBottom: 15 },
  title: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 10, textAlign: 'center', marginBottom: 15, color: '#555' },
  infoGrid: { flexDirection: 'row', marginBottom: 15 },
  infoColumn: { width: '50%' },
  infoRow: { flexDirection: 'row', marginBottom: 2 },
  infoLabel: { fontWeight: 'bold', width: 80 },
  infoValue: {},
  table: { marginTop: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderBottom: '1 solid #333' },
  tableRow: { flexDirection: 'row', borderBottom: '0.5 solid #ccc', minHeight: 35, alignItems: 'center' },
  colName: { width: '25%', padding: 4 },
  colSignMorning: { width: '18.75%', padding: 4, borderLeft: '0.5 solid #ccc', textAlign: 'center' },
  colSignAfternoon: { width: '18.75%', padding: 4, borderLeft: '0.5 solid #ccc', textAlign: 'center' },
  colSignMorningTrainer: { width: '18.75%', padding: 4, borderLeft: '0.5 solid #ccc', textAlign: 'center' },
  colSignAfternoonTrainer: { width: '18.75%', padding: 4, borderLeft: '0.5 solid #ccc', textAlign: 'center' },
  thText: { fontWeight: 'bold', fontSize: 8, textAlign: 'center' },
  signatureImg: { width: 60, height: 25, objectFit: 'contain' },
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, fontSize: 7, color: '#666', textAlign: 'center' },
  dateHeader: { backgroundColor: '#e8e8e8', padding: 6, fontWeight: 'bold', fontSize: 10, borderBottom: '1 solid #333' },
})

interface AttendanceEntry {
  beneficiary_name: string
  morning_present: boolean | null
  afternoon_present: boolean | null
  morning_signature: string | null
  afternoon_signature: string | null
}

interface SlotDay {
  date: string
  topic: string | null
  entries: AttendanceEntry[]
}

interface AttendanceSheetData {
  organization: {
    name: string
    siret: string
    nda: string | null
  }
  formation: {
    title: string
    duration_hours: number | null
  }
  session: {
    code: string | null
    start_date: string
    end_date: string
    location: string
  }
  trainer: {
    first_name: string
    last_name: string
  } | null
  days: SlotDay[]
}

export function AttendanceSheetPDF({ data }: { data: AttendanceSheetData }) {
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>FEUILLE D'ÉMARGEMENT</Text>
          <Text style={styles.subtitle}>{data.formation.title}</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoColumn}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Organisme :</Text>
              <Text style={styles.infoValue}>{data.organization.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Session :</Text>
              <Text style={styles.infoValue}>{data.session.code ?? '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Lieu :</Text>
              <Text style={styles.infoValue}>{data.session.location}</Text>
            </View>
          </View>
          <View style={styles.infoColumn}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Formateur :</Text>
              <Text style={styles.infoValue}>
                {data.trainer ? `${data.trainer.first_name} ${data.trainer.last_name}` : '—'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Durée :</Text>
              <Text style={styles.infoValue}>{data.formation.duration_hours ?? '—'}h</Text>
            </View>
          </View>
        </View>

        {data.days.map((day, dayIndex) => (
          <View key={dayIndex} style={styles.table} wrap={false}>
            <Text style={styles.dateHeader}>
              {fmtDate(day.date)}{day.topic ? ` — ${day.topic}` : ''}
            </Text>
            <View style={styles.tableHeader}>
              <View style={styles.colName}>
                <Text style={styles.thText}>Nom / Prénom</Text>
              </View>
              <View style={styles.colSignMorning}>
                <Text style={styles.thText}>Matin{'\n'}Stagiaire</Text>
              </View>
              <View style={styles.colSignAfternoon}>
                <Text style={styles.thText}>Après-midi{'\n'}Stagiaire</Text>
              </View>
              <View style={styles.colSignMorningTrainer}>
                <Text style={styles.thText}>Matin{'\n'}Formateur</Text>
              </View>
              <View style={styles.colSignAfternoonTrainer}>
                <Text style={styles.thText}>Après-midi{'\n'}Formateur</Text>
              </View>
            </View>
            {day.entries.map((entry, entryIndex) => (
              <View key={entryIndex} style={styles.tableRow}>
                <View style={styles.colName}>
                  <Text>{entry.beneficiary_name}</Text>
                </View>
                <View style={styles.colSignMorning}>
                  {entry.morning_signature ? (
                    <Image src={entry.morning_signature} style={styles.signatureImg} />
                  ) : entry.morning_present === false ? (
                    <Text style={{ color: 'red' }}>Absent</Text>
                  ) : null}
                </View>
                <View style={styles.colSignAfternoon}>
                  {entry.afternoon_signature ? (
                    <Image src={entry.afternoon_signature} style={styles.signatureImg} />
                  ) : entry.afternoon_present === false ? (
                    <Text style={{ color: 'red' }}>Absent</Text>
                  ) : null}
                </View>
                <View style={styles.colSignMorningTrainer}>
                  <Text> </Text>
                </View>
                <View style={styles.colSignAfternoonTrainer}>
                  <Text> </Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.footer}>
          {data.organization.name} — SIRET : {data.organization.siret}
          {data.organization.nda ? ` — NDA : ${data.organization.nda}` : ''}
          {' — Ind. 12 Qualiopi : émargement et assiduité'}
        </Text>
      </Page>
    </Document>
  )
}
