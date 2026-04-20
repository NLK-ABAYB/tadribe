import { View, Text, StyleSheet } from '@react-pdf/renderer'
import type { PDFOrgInfo } from './PDFHeader'

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    borderTopStyle: 'solid',
    fontSize: 7,
    color: '#666',
  },
  line: { marginBottom: 2, textAlign: 'center', lineHeight: 1.35 },
  pageNumber: { marginTop: 4, textAlign: 'center', color: '#999' },
})

export type PDFDocType = 'devis' | 'convention' | 'facture' | 'certificat' | 'convocation' | 'emargement'

const DEFAULT_MENTIONS: Record<PDFDocType, string> = {
  devis: "Devis valable 30 jours à compter de sa date d'émission. Toute acceptation doit être notifiée par retour signé.",
  convention: 'Convention régie par les articles L.6353-1 et L.6353-2 du Code du travail. Délai de rétractation de 10 jours pour les conventions B2C.',
  facture:
    'En cas de retard de paiement, seront exigibles une indemnité forfaitaire pour frais de recouvrement de 40€ (Art. L.441-10 du Code de commerce) et des pénalités de retard au taux légal.',
  certificat: 'Certificat délivré en application de l\'article L.6353-1 du Code du travail.',
  convocation: 'Document à présenter le premier jour de la formation. Toute absence doit être signalée à l\'avance.',
  emargement: 'Indicateur 12 Qualiopi : preuve d\'émargement et d\'assiduité.',
}

interface PDFFooterProps {
  organization: PDFOrgInfo
  docType: PDFDocType
  tvaMention?: string | null
  legalMentions?: string | null
  showPageNumber?: boolean
}

export function PDFFooter({
  organization,
  docType,
  tvaMention,
  legalMentions,
  showPageNumber = true,
}: PDFFooterProps) {
  const ndaMention = organization.nda
    ? `Enregistré sous le N° de déclaration ${organization.nda}. Cet enregistrement ne vaut pas agrément de l'État.`
    : null

  const fallbackMention = DEFAULT_MENTIONS[docType]
  const mentionText = legalMentions && legalMentions.trim().length > 0 ? legalMentions : fallbackMention

  const tvaText =
    tvaMention && tvaMention.trim().length > 0
      ? tvaMention
      : organization.tva_exempt && (docType === 'facture' || docType === 'devis' || docType === 'convention')
        ? "TVA non applicable, art. 261-4-4°a du CGI (formation professionnelle continue exonérée)."
        : null

  return (
    <View style={styles.footer} fixed>
      {ndaMention && <Text style={styles.line}>{ndaMention}</Text>}
      {tvaText && <Text style={styles.line}>{tvaText}</Text>}
      {mentionText && <Text style={styles.line}>{mentionText}</Text>}
      <Text style={styles.line}>
        {organization.name} — SIRET : {organization.siret}
        {organization.email ? ` — ${organization.email}` : ''}
      </Text>
      {showPageNumber && (
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
        />
      )}
    </View>
  )
}
