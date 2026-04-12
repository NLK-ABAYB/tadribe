import { useParams, Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EVAL_TYPES } from '@/lib/constants'
import { useEvaluation, useEvaluationResponses } from '../hooks/use-evaluations'

export function EvaluationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: evaluation, isLoading } = useEvaluation(id)
  const { data: responses } = useEvaluationResponses(id)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!evaluation) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Évaluation introuvable</p>
      </div>
    )
  }

  const avgScore = responses?.length
    ? responses.reduce((sum, r) => sum + (r.score ?? 0), 0) / responses.length
    : null

  const questions = Array.isArray(evaluation.questions)
    ? (evaluation.questions as Record<string, unknown>[])
    : []

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Évaluations', href: '/evaluations' }, { label: evaluation.title }]} />
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{evaluation.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge>{EVAL_TYPES[evaluation.eval_type]}</Badge>
            {evaluation.sessions?.formations?.title && (
              <span className="text-sm text-muted-foreground">{evaluation.sessions.formations.title}</span>
            )}
            {!evaluation.is_active && <Badge variant="outline">Inactif</Badge>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase">Réponses</p>
            <p className="text-2xl font-bold">{responses?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase">Score moyen</p>
            <p className="text-2xl font-bold">{avgScore != null ? `${avgScore.toFixed(1)}/10` : '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase">Questions</p>
            <p className="text-2xl font-bold">{questions.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {evaluation.description && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Description</p>
                <p className="text-sm">{evaluation.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Date prévue</p>
                <p className="text-sm">{evaluation.scheduled_date ? new Date(evaluation.scheduled_date).toLocaleDateString('fr-FR') : '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Date limite</p>
                <p className="text-sm">{evaluation.deadline_date ? new Date(evaluation.deadline_date).toLocaleDateString('fr-FR') : '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {questions.length ? (
              <ol className="list-decimal list-inside space-y-2 text-sm">
                {questions.map((q, i) => (
                  <li key={i}>{(q.text as string) ?? (q.question as string) ?? JSON.stringify(q)}</li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">Aucune question définie</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Responses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Réponses ({responses?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {responses?.length ? (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left text-sm font-medium">Répondant</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Type</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Score</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="px-4 py-2 text-sm">
                        {r.is_anonymous
                          ? 'Anonyme'
                          : r.beneficiaries
                            ? `${r.beneficiaries.first_name} ${r.beneficiaries.last_name}`
                            : r.respondent_name ?? '—'}
                      </td>
                      <td className="px-4 py-2 text-sm text-muted-foreground">
                        {r.respondent_type ?? '—'}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium">
                        {r.score != null ? `${r.score}/10` : '—'}
                      </td>
                      <td className="px-4 py-2 text-sm text-muted-foreground">
                        {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('fr-FR') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Aucune réponse reçue</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Liens rapides</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {evaluation.session_id && (
            <Link to={`/sessions/${evaluation.session_id}`}>
              <Button variant="outline" size="sm">Session associée</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
