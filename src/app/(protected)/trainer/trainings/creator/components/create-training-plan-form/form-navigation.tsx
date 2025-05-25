import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { STEPS } from './create-training-plan-form'

type FormNavigationProps = {
  currentStep: number
  onBack: () => void
  onNext: () => void
}

export function FormNavigation({
  currentStep,
  onBack,
  onNext,
}: FormNavigationProps) {
  return (
    <div className="flex mt-6">
      {currentStep > 0 && (
        <Button
          variant="outline"
          onClick={onBack}
          disabled={currentStep === 0}
          iconStart={<ChevronLeft className="h-4 w-4" />}
        >
          Back
        </Button>
      )}
      {currentStep < STEPS.length - 1 && (
        <Button
          onClick={onNext}
          iconEnd={<ChevronRight className="h-4 w-4" />}
          className="ml-auto"
        >
          Next
        </Button>
      )}
    </div>
  )
}
