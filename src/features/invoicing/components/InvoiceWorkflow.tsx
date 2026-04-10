import { CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkflowStep {
  key: string
  label: string
  description: string
}

const STEPS: WorkflowStep[] = [
  { key: 'devis', label: 'Devis', description: 'Proposition commerciale' },
  { key: 'convention', label: 'Convention', description: 'Convention de formation signée' },
  { key: 'facture', label: 'Facture', description: 'Facture émise' },
  { key: 'paiement', label: 'Paiement', description: 'Paiement reçu' },
]

interface InvoiceWorkflowProps {
  currentStep: string
  onStepClick?: (step: string) => void
}

export function InvoiceWorkflow({ currentStep, onStepClick }: InvoiceWorkflowProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep)

  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, index) => {
        const isComplete = index < currentIndex
        const isCurrent = index === currentIndex
        return (
          <div key={step.key} className="flex items-center gap-2">
            <button
              onClick={() => onStepClick?.(step.key)}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-4 py-2 text-left transition-colors',
                isComplete && 'border-green-200 bg-green-50',
                isCurrent && 'border-primary bg-primary/5 ring-2 ring-primary/20',
                !isComplete && !isCurrent && 'border-border bg-background opacity-50'
              )}
            >
              {isComplete ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              ) : (
                <Circle className={cn('h-5 w-5 shrink-0', isCurrent ? 'text-primary' : 'text-muted-foreground')} />
              )}
              <div>
                <p className={cn('text-sm font-medium', isCurrent && 'text-primary')}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </button>
            {index < STEPS.length - 1 && (
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
          </div>
        )
      })}
    </div>
  )
}
