import { ChevronLeft, ChevronRight, UploadCloudIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { STEPS } from './create-training-plan-form'

type FormNavigationProps = {
  currentStep: number
  onBack: () => void
  onNext: () => void
  onSave: () => void
  isSaving: boolean
}

export function FormNavigation({
  currentStep,
  onBack,
  onNext,
  onSave,
  isSaving,
}: FormNavigationProps) {
  return (
    <div className="flex mt-6">
      {currentStep > 0 && (
        <Button
          variant="outline"
          onClick={onBack}
          disabled={currentStep === 0}
          iconStart={<ChevronLeft />}
          className="capitalize"
        >
          {STEPS[currentStep - 1]}
        </Button>
      )}
      {currentStep < STEPS.length - 1 && (
        <Button
          onClick={onNext}
          iconEnd={<ChevronRight />}
          className="ml-auto capitalize"
        >
          {STEPS[currentStep + 1]}
        </Button>
      )}
      {currentStep === STEPS.length - 1 && (
        <Button
          variant="default"
          iconStart={<UploadCloudIcon />}
          className="ml-auto"
          onClick={onSave}
          disabled={isSaving}
          loading={isSaving}
        >
          Save Plan
        </Button>
      )}
    </div>
  )
}
