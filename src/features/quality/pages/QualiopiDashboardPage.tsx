import { Loader2, Shield, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useFormations } from '@/features/catalogue/hooks/use-formations'
import { useTrainers } from '@/features/trainers/hooks/use-trainers'
import { useEnrollments } from '@/features/enrollments/hooks/use-enrollments'
import { useEvaluations } from '@/features/evaluations/hooks/use-evaluations'
import { Breadcrumb } from '@/components/layout/Breadcrumb'

interface Indicator {
  id: number
  title: string
  criterion: number
  status: 'conforme' | 'partiel' | 'non_conforme'
  evidence: string
  details: string
}

export function QualiopiDashboardPage() {
  const { data: formations, isLoading: formationsLoading } = useFormations()
  const { data: trainers } = useTrainers()
  const { data: enrollments } = useEnrollments()
  const { data: evaluations } = useEvaluations()

  const isLoading = formationsLoading

  // Compute conformity based on existing data
  function computeIndicators(): Indicator[] {
    const formationsWithObjectives = formations?.filter((f) => (f.objectives?.length ?? 0) > 0).length ?? 0
    const formationsWithResults = formations?.filter((f) => f.satisfaction_rate != null).length ?? 0
    const totalFormations = formations?.length ?? 0
    const trainersWithCompetencies = trainers?.filter((t) => (t.specialties?.length ?? 0) > 0).length ?? 0
    const enrollmentsWithPositioning = enrollments?.filter((e) => e.positioning_done).length ?? 0
    const enrollmentsWithDocs = enrollments?.filter((e) => e.convocation_sent && e.welcome_booklet_sent).length ?? 0
    const totalEnrollments = enrollments?.length ?? 0
    const totalEvaluations = evaluations?.length ?? 0
    const satisfactionEvals = evaluations?.filter((e) => e.eval_type === 'satisfaction_chaud' || e.eval_type === 'satisfaction_froid').length ?? 0

    const pct = (n: number, total: number) => total > 0 ? Math.round((n / total) * 100) : 0
    const status = (p: number): 'conforme' | 'partiel' | 'non_conforme' =>
      p >= 80 ? 'conforme' : p >= 40 ? 'partiel' : 'non_conforme'

    return [
      {
        id: 1, criterion: 1,
        title: 'Conditions d\'information du public',
        status: status(pct(formationsWithObjectives, totalFormations)),
        evidence: `${formationsWithObjectives}/${totalFormations} formations avec objectifs`,
        details: 'Objectifs, prérequis, durée, modalités, tarifs publiés',
      },
      {
        id: 2, criterion: 1,
        title: 'Indicateurs de résultats',
        status: status(pct(formationsWithResults, totalFormations)),
        evidence: `${formationsWithResults}/${totalFormations} formations avec taux`,
        details: 'Taux de satisfaction, réussite, insertion publiés',
      },
      {
        id: 6, criterion: 2,
        title: 'Conception des formations',
        status: totalFormations > 0 ? 'conforme' : 'non_conforme',
        evidence: `${totalFormations} formations cataloguées`,
        details: 'Programme, scénario pédagogique, méthodes',
      },
      {
        id: 8, criterion: 3,
        title: 'Positionnement des bénéficiaires',
        status: status(pct(enrollmentsWithPositioning, totalEnrollments)),
        evidence: `${enrollmentsWithPositioning}/${totalEnrollments} positionnements réalisés`,
        details: 'Évaluation des acquis à l\'entrée en formation',
      },
      {
        id: 9, criterion: 3,
        title: 'Documents remis aux bénéficiaires',
        status: status(pct(enrollmentsWithDocs, totalEnrollments)),
        evidence: `${enrollmentsWithDocs}/${totalEnrollments} dossiers complets`,
        details: 'Convocation, livret d\'accueil, règlement intérieur',
      },
      {
        id: 12, criterion: 4,
        title: 'Émargement et assiduité',
        status: 'partiel',
        evidence: 'Module émargement disponible',
        details: 'Feuilles de présence signées, suivi absences',
      },
      {
        id: 21, criterion: 5,
        title: 'Compétences des formateurs',
        status: status(pct(trainersWithCompetencies, trainers?.length ?? 0)),
        evidence: `${trainersWithCompetencies}/${trainers?.length ?? 0} formateurs qualifiés`,
        details: 'CV, qualifications, maintien des compétences',
      },
      {
        id: 26, criterion: 6,
        title: 'Accessibilité handicap',
        status: 'partiel',
        evidence: 'Champs handicap dans bénéficiaires',
        details: 'Référent handicap, aménagements, partenariats',
      },
      {
        id: 30, criterion: 7,
        title: 'Mesure de satisfaction',
        status: status(pct(satisfactionEvals, totalEvaluations)),
        evidence: `${satisfactionEvals}/${totalEvaluations} évaluations de satisfaction`,
        details: 'Enquêtes à chaud et à froid, analyse des résultats',
      },
      {
        id: 31, criterion: 7,
        title: 'Traitement des réclamations',
        status: 'partiel',
        evidence: 'Module réclamations à configurer',
        details: 'Recueil, traitement, mesures correctives',
      },
      {
        id: 32, criterion: 7,
        title: 'Amélioration continue',
        status: 'partiel',
        evidence: 'Module amélioration à configurer',
        details: 'Actions correctives, audits internes, revue qualité',
      },
    ]
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const indicators = computeIndicators()
  const conformeCount = indicators.filter((i) => i.status === 'conforme').length
  const partielCount = indicators.filter((i) => i.status === 'partiel').length
  const nonConformeCount = indicators.filter((i) => i.status === 'non_conforme').length

  const STATUS_CONFIG = {
    conforme: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', badge: 'success' as const, label: 'Conforme' },
    partiel: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', badge: 'warning' as const, label: 'Partiel' },
    non_conforme: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', badge: 'destructive' as const, label: 'Non conforme' },
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Qualiopi' }]} />
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Tableau de bord Qualiopi
        </h1>
        <p className="text-muted-foreground">
          Conformité au Référentiel National Qualité (7 critères, 32 indicateurs)
        </p>
      </div>

      {/* Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-green-200">
          <CardContent className="pt-6 flex items-center gap-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Conforme</p>
              <p className="text-3xl font-bold text-green-600">{conformeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardContent className="pt-6 flex items-center gap-4">
            <AlertTriangle className="h-10 w-10 text-orange-600" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Partiel</p>
              <p className="text-3xl font-bold text-orange-600">{partielCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="pt-6 flex items-center gap-4">
            <XCircle className="h-10 w-10 text-red-600" />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Non conforme</p>
              <p className="text-3xl font-bold text-red-600">{nonConformeCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indicators list */}
      <div className="space-y-3">
        {indicators.map((indicator) => {
          const config = STATUS_CONFIG[indicator.status]
          const Icon = config.icon
          return (
            <Card key={indicator.id} className={config.bg}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-4">
                  <Icon className={`h-6 w-6 mt-0.5 shrink-0 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-muted-foreground">Ind. {indicator.id}</span>
                      <span className="text-sm font-semibold">{indicator.title}</span>
                      <Badge variant={config.badge}>{config.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{indicator.details}</p>
                    <p className="text-xs font-mono mt-1">{indicator.evidence}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
