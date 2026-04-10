import { Loader2, Award, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthContext } from '@/features/auth/auth-context'
import { useMyBeneficiaryProfile, useMyCertificates } from '../hooks/use-my-enrollments'

export function LearnerCertificatesPage() {
  const { user } = useAuthContext()
  const { data: beneficiary, isLoading: benefLoading } = useMyBeneficiaryProfile(user?.id)
  const { data: certificates, isLoading: certsLoading } = useMyCertificates(beneficiary?.id)

  const isLoading = benefLoading || certsLoading

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
        <h1 className="text-3xl font-bold tracking-tight">Mes certificats</h1>
        <p className="text-muted-foreground">Attestations de formation et certificats de réalisation</p>
      </div>

      {!certificates?.length ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Award className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Aucun certificat</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Vos certificats seront disponibles à la fin de vos formations
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certificates.map((cert) => (
            <Card key={cert.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{cert.title}</CardTitle>
                  <Badge variant="outline">{cert.certificate_type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {cert.enrollments?.sessions?.formations?.title && (
                    <p>{cert.enrollments.sessions.formations.title}</p>
                  )}
                  <p>Délivré le {new Date(cert.issued_date).toLocaleDateString('fr-FR')}</p>
                </div>
                {cert.pdf_url && (
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
