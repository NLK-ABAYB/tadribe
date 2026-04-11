import { useState } from 'react'
import { Loader2, Star, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EVAL_TYPES } from '@/lib/constants'
import { useAuthContext } from '@/features/auth/auth-context'
import { useMyBeneficiaryProfile, useMyEvaluations } from '../hooks/use-my-enrollments'
import { useSubmitResponse } from '@/features/evaluations/hooks/use-evaluations'
import type { EvalType } from '@/lib/types/database'

export function LearnerEvaluationsPage() {
  const { user } = useAuthContext()
  const { data: beneficiary, isLoading: benefLoading } = useMyBeneficiaryProfile(user?.id)
  const { data: evaluations, isLoading: evalsLoading } = useMyEvaluations(beneficiary?.id)
  const submitResponse = useSubmitResponse()
  const [activeEvalId, setActiveEvalId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const isLoading = benefLoading || evalsLoading

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  async function handleSubmit(evaluationId: string) {
    if (!beneficiary) return
    // Compute a simple average score from numeric answers
    const numericAnswers = Object.values(answers).map(Number).filter((n) => !isNaN(n))
    const score = numericAnswers.length > 0
      ? Math.round((numericAnswers.reduce((s, n) => s + n, 0) / numericAnswers.length) * 10) / 10
      : undefined

    await submitResponse.mutateAsync({
      evaluation_id: evaluationId,
      beneficiary_id: beneficiary.id,
      respondent_type: 'beneficiaire',
      answers,
      score,
    })
    toast.success('Évaluation soumise avec succès')
    setActiveEvalId(null)
    setAnswers({})
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mes évaluations</h1>
        <p className="text-muted-foreground">Questionnaires de satisfaction et positionnement</p>
      </div>

      {!evaluations?.length ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Star className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Aucune évaluation</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Les évaluations de vos formations apparaitront ici
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {evaluations.map((evaluation) => {
            const isActive = activeEvalId === evaluation.id
            return (
              <Card key={evaluation.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{evaluation.title}</CardTitle>
                      {evaluation.description && (
                        <p className="text-sm text-muted-foreground mt-1">{evaluation.description}</p>
                      )}
                    </div>
                    <Badge>{EVAL_TYPES[evaluation.eval_type as EvalType]}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const questionList: Record<string, unknown>[] = Array.isArray(evaluation.questions)
                      ? (evaluation.questions as Record<string, unknown>[])
                      : []
                    return (
                  <>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span>{questionList.length} question(s)</span>
                    {evaluation.deadline_date && (
                      <span>Date limite : {new Date(evaluation.deadline_date).toLocaleDateString('fr-FR')}</span>
                    )}
                  </div>

                  {isActive ? (
                    <div className="space-y-4 border-t pt-4">
                      {questionList.map((q, i) => {
                        const questionText = (q.text as string) ?? (q.question as string) ?? `Question ${i + 1}`
                        const key = `q_${i}`
                        return (
                          <div key={i} className="space-y-2">
                            <label className="text-sm font-medium">
                              {i + 1}. {questionText}
                            </label>
                            <textarea
                              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={answers[key] ?? ''}
                              onChange={(e) => setAnswers((prev) => ({ ...prev, [key]: e.target.value }))}
                              placeholder="Votre réponse..."
                            />
                          </div>
                        )
                      })}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSubmit(evaluation.id)}
                          disabled={submitResponse.isPending}
                        >
                          {submitResponse.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Soumettre
                        </Button>
                        <Button variant="outline" onClick={() => { setActiveEvalId(null); setAnswers({}) }}>
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setActiveEvalId(evaluation.id)}>
                      Répondre
                    </Button>
                  )}
                  </>
                    )
                  })()}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
