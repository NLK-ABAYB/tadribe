import { View, Text, Image, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '1 solid #e5e5e5',
  },
  logoBlock: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  logo: {
    height: 60,
    maxWidth: 150,
    objectFit: 'contain',
    marginBottom: 4,
  },
  orgInfo: {
    textAlign: 'right',
    fontSize: 9,
    color: '#444',
  },
  orgName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 3,
  },
  orgDetail: {
    lineHeight: 1.35,
  },
  docTitleBlock: {
    marginTop: 14,
    marginBottom: 14,
  },
  docTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A5F',
  },
  docRef: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
})

export interface PDFOrgInfo {
  name: string
  siret: string
  nda: string | null
  email: string | null
  phone: string | null
  website: string | null
  address: string | null
  logo_url: string | null
  tva_exempt: boolean
}

interface PDFHeaderProps {
  organization: PDFOrgInfo
  documentTitle: string
  documentRef?: string
}

export function PDFHeader({ organization, documentTitle, documentRef }: PDFHeaderProps) {
  return (
    <View>
      <View style={styles.header}>
        <View style={styles.logoBlock}>
          {organization.logo_url ? (
            <Image src={organization.logo_url} style={styles.logo} />
          ) : (
            <Text style={styles.orgName}>{organization.name}</Text>
          )}
        </View>
        <View style={styles.orgInfo}>
          <Text style={styles.orgName}>{organization.name}</Text>
          <Text style={styles.orgDetail}>SIRET : {organization.siret}</Text>
          {organization.nda && <Text style={styles.orgDetail}>NDA : {organization.nda}</Text>}
          {organization.address && <Text style={styles.orgDetail}>{organization.address}</Text>}
          {organization.phone && <Text style={styles.orgDetail}>Tél : {organization.phone}</Text>}
          {organization.email && <Text style={styles.orgDetail}>{organization.email}</Text>}
          {organization.website && <Text style={styles.orgDetail}>{organization.website}</Text>}
        </View>
      </View>
      <View style={styles.docTitleBlock}>
        <Text style={styles.docTitle}>{documentTitle}</Text>
        {documentRef && <Text style={styles.docRef}>N° {documentRef}</Text>}
      </View>
    </View>
  )
}
