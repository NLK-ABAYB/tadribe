import { Loader2, FileText, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthContext } from '@/features/auth/auth-context'
import { useMyBeneficiaryProfile, useMyDocuments } from '../hooks/use-my-enrollments'

const DOC_TYPE_LABELS: Record<string, string> = {
  convention: 'Convention',
  convocation: 'Convocation',
  livret_accueil: 'Livret d\'accueil',
  reglement_interieur: 'Règlement intérieur',
  programme: 'Programme',
  attestation: 'Attestation',
  facture: 'Facture',
  autre: 'Autre',
}

export function LearnerDocumentsPage() {
  const { user } = useAuthContext()
  const { data: beneficiary, isLoading: benefLoading } = useMyBeneficiaryProfile(user?.id)
  const { data: documents, isLoading: docsLoading } = useMyDocuments(beneficiary?.id)

  const isLoading = benefLoading || docsLoading

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mes documents</h1>
        <p className="text-muted-foreground">Conventions, convocations, livrets et documents de formation</p>
      </div>

      {!documents?.length ? (
        <div className="flex flex-col items-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Aucun document</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Vos documents de formation apparaitront ici
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documents ({documents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-xs">
                          {DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  {doc.file_url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
