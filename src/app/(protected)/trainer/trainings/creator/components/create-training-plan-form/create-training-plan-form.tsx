'use client'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { Loader } from '@/components/loader'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { DaysSetup } from '../days-setup/days-setup'
import { ExercisesSetup } from '../exercises-setup/exercises-setup'
import { PlanDetailsForm } from '../plan-details-form'
import { ReviewPlan } from '../review-plan'
import { WeeksSetup } from '../weeks-setup/weeks-setup'

import { FormActions } from './form-actions'
import { FormNavigation } from './form-navigation'
import { useTrainingPlanForm } from './use-training-plan-form'

export const STEPS = ['details', 'weeks', 'days', 'exercises', 'review']

type CreateTrainingPlanFormProps = {
  trainingId?: string
}

export function CreateTrainingPlanForm({
  trainingId,
}: CreateTrainingPlanFormProps) {
  const {
    formData,
    isDirty,
    currentStep,
    activeWeek,
    activeDay,
    isLoadingInitialData,
    isPending,
    isUpdating,
    isDeleting,
    isDuplicating,
    setCurrentStep,
    setActiveWeek,
    setActiveDay,
    updateFormData,
    clearDraft,
    handleSubmit,
    handleDelete,
    handleDuplicate,
  } = useTrainingPlanForm(trainingId)

  if (isLoadingInitialData) {
    return <Loader size="lg" />
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <AnimatedPageTransition id="create-training-plan-form">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Create New Training Plan
        </h1>
        <FormActions
          isDirty={isDirty}
          trainingId={trainingId}
          isPending={isPending}
          isUpdating={isUpdating}
          isDuplicating={isDuplicating}
          isDeleting={isDeleting}
          onDelete={handleDelete}
          onClearDraft={clearDraft}
          onDuplicate={handleDuplicate}
          onSubmit={handleSubmit}
        />
      </div>

      <Card className="p-6">
        <Tabs
          value={STEPS[currentStep]}
          className="w-full"
          onValueChange={(value) => {
            const newStep = STEPS.indexOf(value)
            if (newStep >= 0) {
              setCurrentStep(newStep)
            }
          }}
        >
          <TabsList className="grid w-full grid-cols-5 dark:bg-primary-foreground">
            {STEPS.map((step) => (
              <TabsTrigger key={step} value={step}>
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="details" className="py-4">
            <AnimatedPageTransition id="plan-details">
              <PlanDetailsForm
                data={formData.details}
                updateData={(details) => updateFormData({ details })}
              />
            </AnimatedPageTransition>
          </TabsContent>

          <TabsContent value="weeks" className="py-4">
            <AnimatedPageTransition id="weeks">
              <WeeksSetup
                weeks={formData.weeks}
                updateWeeks={(weeks) => updateFormData({ weeks })}
              />
            </AnimatedPageTransition>
          </TabsContent>

          <TabsContent value="days" className="py-4">
            <AnimatedPageTransition id="days">
              <DaysSetup
                weeks={formData.weeks}
                activeWeek={activeWeek}
                setActiveWeek={setActiveWeek}
                updateWeeks={(weeks) => updateFormData({ weeks })}
              />
            </AnimatedPageTransition>
          </TabsContent>

          <TabsContent value="exercises" className="py-4">
            <AnimatedPageTransition id="exercises">
              <ExercisesSetup
                weeks={formData.weeks}
                activeWeek={activeWeek}
                setActiveWeek={setActiveWeek}
                activeDay={activeDay}
                setActiveDay={setActiveDay}
                updateWeeks={(weeks) => updateFormData({ weeks })}
              />
            </AnimatedPageTransition>
          </TabsContent>

          <TabsContent value="review" className="py-4">
            <AnimatedPageTransition id="review">
              <ReviewPlan formData={formData} />
            </AnimatedPageTransition>
          </TabsContent>
        </Tabs>

        <FormNavigation
          currentStep={currentStep}
          onBack={handleBack}
          onNext={handleNext}
        />
      </Card>
    </AnimatedPageTransition>
  )
}
