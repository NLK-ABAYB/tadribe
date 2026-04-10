import { Loader2, FileDown, FileText } from 'lucide-react'
import { pdf } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useEnrollments } from '@/features/enrollments/hooks/use-enrollments'
import { useAuthContext } from '@/features/auth/auth-context'
import { ConventionPDF } from '../templates/ConventionPDF'

export function ConventionsPage() {
  const { organization } = useAuthContext()
  const { data: enrollments, isLoading } = useEnrollments()

  // Only enrollments with a company (inter-entreprise conventions)
  const enrollmentsWithCompany = enrollments?.filter((e) => e.companies?.name)

  async function handleDownloadConvention(enrollmentId: string) {
    if (!organization) return
    const enrollment = enrollmentsWithCompany?.find((e) => e.id === enrollmentId)
    if (!enrollment) return

    const blob = await pdf(
      <ConventionPDF
        data={{
          organization: {
            name: organization.name,
            siret: organization.siret,
            nda: organization.nda,
            address: '',
            phone: organization.phone,
            email: organization.email,
          },
          company: {
            name: enrollment.companies?.name ?? '',
            siret: null,
            address: '',
          },
          formation: {
            title: enrollment.sessions?.formations?.title ?? 'Formation',
            objectives: [],
            duration_hours: null,
            teaching_methods: null,
            assessment_methods: null,
            prerequisites: null,
          },
          session: {
            start_date: enrollment.sessions?.start_date ?? '',
            end_date: enrollment.sessions?.end_date ?? '',
            location: '—',
            code: enrollment.sessions?.code ?? null,
          },
          beneficiaries: enrollment.beneficiaries
            ? [{ first_name: enrollment.beneficiaries.first_name, last_name: enrollment.beneficiaries.last_name }]
            : [],
          price_ht: 0,
          price_ttc: null,
          tva_exempt: organization.tva_exempt ?? false,
          convention_date: new Date().toISOString().slice(0, 10),
        }}
      />
    ).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `convention-${enrollment.sessions?.code ?? enrollmentId}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Conventions de formation</h1>
        <p className="text-muted-foreground">
          Génération des conventions inter/intra entreprise
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !enrollmentsWithCompany?.length ? (
        <div className="flex flex-col items-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Aucune convention</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Les conventions sont générées pour les inscriptions liées à une entreprise
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Entreprise</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Bénéficiaire</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Formation</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Session</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Convention</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollmentsWithCompany.map((e) => (
                <tr key={e.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium">
                    {e.companies?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {e.beneficiaries
                      ? `${e.beneficiaries.last_name} ${e.beneficiaries.first_name}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {e.sessions?.formations?.title ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {e.sessions?.code ?? '—'}
                    {e.sessions && (
                      <span className="block text-xs">
                        {new Date(e.sessions.start_date).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={e.convention_signed ? 'success' : 'outline'}>
                      {e.convention_signed ? 'Signée' : 'Non signée'}
                    </Badge>
                    {e.convention_date && (
                      <span className="block text-xs text-muted-foreground mt-1">
                        {new Date(e.convention_date).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="outline" size="sm" onClick={() => handleDownloadConvention(e.id)}>
                      <FileDown className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
