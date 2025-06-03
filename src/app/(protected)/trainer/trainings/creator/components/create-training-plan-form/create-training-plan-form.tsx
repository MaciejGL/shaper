'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useParams } from 'next/navigation'

import { DashboardHeader } from '@/app/(protected)/trainer/components/dashboard-header'
import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { Loader } from '@/components/loader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useTrainingPlan } from '../../../../../../../context/training-plan-context/training-plan-context'
import { DaysSetup } from '../days-setup/days-setup'
import { ExercisesSetup } from '../exercises-setup/exercises-setup'
import { PlanDetailsForm } from '../plan-details-form'
import { ReviewPlan } from '../review-plan'
import { WeeksSetup } from '../weeks-setup/weeks-setup'

import { FormActions } from './form-actions'
import { FormNavigation } from './form-navigation'

export const STEPS = ['details', 'weeks', 'days', 'exercises', 'review']

export function CreateTrainingPlanForm() {
  const {
    formData,
    isDirty,
    currentStep,
    isLoadingInitialData,
    isPending,
    isUpdating,
    isDeleting,
    isDuplicating,
    setCurrentStep,
    updateDetails,
    clearDraft,
    handleSubmit,
    handleDelete,
    handleDuplicate,
  } = useTrainingPlan()
  const { trainingId } = useParams<{ trainingId: string }>()

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
      <div className="flex justify-between items-baseline">
        <DashboardHeader
          title="Training Plan Creator"
          description={
            trainingId
              ? `Editing - ${formData.details.title}`
              : 'Create a new training plan for your clients'
          }
          prevSegment={{
            label: 'Training Plans',
            href: '/trainer/trainings',
          }}
        />
        <div className="">
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
          <AnimatePresence>
            {isDirty && (
              <motion.p
                key="unsaved-changes"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="text-sm text-muted-foreground text-right mt-2"
              >
                Unsaved changes
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

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
        <TabsList className="grid w-full grid-cols-5">
          {STEPS.map((step) => (
            <TabsTrigger key={step} value={step}>
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="@container/section py-6">
          <TabsContent value="details">
            <AnimatedPageTransition id="plan-details">
              <PlanDetailsForm
                data={formData.details}
                updateData={updateDetails}
              />
            </AnimatedPageTransition>
          </TabsContent>

          <TabsContent value="weeks">
            <AnimatedPageTransition id="weeks">
              <WeeksSetup />
            </AnimatedPageTransition>
          </TabsContent>

          <TabsContent value="days">
            <AnimatedPageTransition id="days">
              <DaysSetup />
            </AnimatedPageTransition>
          </TabsContent>

          <TabsContent value="exercises">
            <AnimatedPageTransition id="exercises">
              <ExercisesSetup />
            </AnimatedPageTransition>
          </TabsContent>

          <TabsContent value="review">
            <AnimatedPageTransition id="review">
              <ReviewPlan formData={formData} />
            </AnimatedPageTransition>
          </TabsContent>

          <FormNavigation
            currentStep={currentStep}
            onBack={handleBack}
            onNext={handleNext}
            onSave={handleSubmit}
            isSaving={isPending || isUpdating}
          />
        </div>
      </Tabs>
    </AnimatedPageTransition>
  )
}
