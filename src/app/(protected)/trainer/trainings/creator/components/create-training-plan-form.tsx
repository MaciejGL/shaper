'use client'

import { ChevronLeft, ChevronRight, Save } from 'lucide-react'
import { useEffect, useState } from 'react'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { DaysSetup } from './days-setup'
import { ExercisesSetup } from './exercises-setup'
import { PlanDetailsForm } from './plan-details-form'
import { ReviewPlan } from './review-plan'
import { TrainingPlanFormData } from './types'
import { WeeksSetup } from './weeks-setup'

const initialFormData: TrainingPlanFormData = {
  details: {
    title: '',
    description: '',
    isPublic: false,
    isTemplate: false,
  },
  weeks: [
    {
      id: 'week-1',
      weekNumber: 1,
      name: 'Week 1',
      description: '',
      days: Array.from({ length: 7 }, (_, i) => ({
        id: `week-1-day-${i}`,
        dayOfWeek: i,
        isRestDay: [0, 6].includes(i), // Default rest days on Sunday and Saturday
        exercises: [],
      })),
    },
  ],
}

const steps = ['details', 'weeks', 'days', 'exercises', 'review']

const getInitialFormData = () => {
  // Initialize state with localStorage data if available
  if (typeof window !== 'undefined') {
    const savedDraft = localStorage.getItem('trainingPlanDraft')
    if (savedDraft) {
      try {
        return JSON.parse(savedDraft)
      } catch (error) {
        console.error('Failed to parse saved draft', error)
      }
    }
  }
  return initialFormData
}

export function CreateTrainingPlanForm() {
  const [formData, setFormData] =
    useState<TrainingPlanFormData>(getInitialFormData())
  const [isDirty, setIsDirty] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [activeWeek, setActiveWeek] = useState(0)
  const [activeDay, setActiveDay] = useState(1) // Monday by default

  // Load draft from localStorage on initial render
  useEffect(() => {
    const savedDraft = localStorage.getItem('trainingPlanDraft')
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft)
        setFormData(parsedDraft)
      } catch (error) {
        console.error('Failed to parse saved draft', error)
      }
    }
  }, [])

  // Save draft to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem('trainingPlanDraft', JSON.stringify(formData))
  }, [formData])

  // Clear draft from localStorage
  const clearDraft = () => {
    localStorage.removeItem('trainingPlanDraft')
    setFormData(initialFormData)
    setIsDirty(false)
  }

  const updateFormData = (newData: Partial<TrainingPlanFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }))
    setIsDirty(true)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    // Here you would submit the form data to your API
    console.log('Submitting form data:', formData)
    // Clear the draft after successful submission
    clearDraft()
    // Redirect to the training plans page after successful submission
  }

  return (
    <AnimatedPageTransition id="create-training-plan-form">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Create New Training Plan
        </h1>
        <div className="flex justify-end gap-2 items-center">
          {isDirty && (
            <p className="text-sm text-muted-foreground">Unsaved changes</p>
          )}
          <Button variant="ghost" onClick={clearDraft} className="ml-2">
            Clear Draft
          </Button>
          <Button
            variant="ghost"
            onClick={handleSubmit}
            iconStart={<Save className="h-4 w-4" />}
          >
            Save Plan
          </Button>
        </div>
      </div>
      <Card className="p-6">
        <Tabs
          value={steps[currentStep]}
          className="w-full"
          onValueChange={(value) => {
            const newStep = steps.indexOf(value)
            if (newStep >= 0) {
              setCurrentStep(newStep)
            }
          }}
        >
          <TabsList className="grid w-full grid-cols-5 dark:bg-primary-foreground">
            <TabsTrigger value="details">Plan Details</TabsTrigger>
            <TabsTrigger value="weeks">Weeks</TabsTrigger>
            <TabsTrigger value="days">Days</TabsTrigger>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
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

        <div className="flex mt-6">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              iconStart={<ChevronLeft className="h-4 w-4" />}
            >
              Back
            </Button>
          )}

          {currentStep === steps.length - 1 ? null : (
            <Button
              onClick={handleNext}
              iconEnd={<ChevronRight className="h-4 w-4" />}
              className="ml-auto"
            >
              Next
            </Button>
          )}
        </div>
      </Card>
    </AnimatedPageTransition>
  )
}
