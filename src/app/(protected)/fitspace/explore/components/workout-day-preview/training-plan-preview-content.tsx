'use client'

import { useState } from 'react'

import { TrainerDetailsDrawer } from '@/components/trainer/trainer-details-drawer'
import { createTrainerDataFromUser } from '@/components/trainer/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { PlanPreviewTab } from '../plan-preview-tab'
import { TrainingPlanPreviewFooter } from '../training-plan-preview/training-plan-preview-footer'
import { TrainingPlanPreviewHeader } from '../training-plan-preview/training-plan-preview-header'
import { TrainingPlanPreviewInfoTab } from '../training-plan-preview/training-plan-preview-info-tab'

import { PublicPlan } from './types'

interface TrainingPlanPreviewContentProps {
  plan: PublicPlan
  onAssignTemplate: (planId: string) => void
  isAssigning: boolean
  weeksData: PublicPlan
}

export function TrainingPlanPreviewContent({
  plan,
  onAssignTemplate,
  isAssigning,
  weeksData,
}: TrainingPlanPreviewContentProps) {
  const [activeTab, setActiveTab] = useState('info')
  const [isTrainerDrawerOpen, setIsTrainerDrawerOpen] = useState(false)

  const handleWeekClick = () => {
    setActiveTab('preview')
  }

  const handleCreatorClick = () => {
    setIsTrainerDrawerOpen(true)
  }

  const trainerData = createTrainerDataFromUser(plan.createdBy)

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="overflow-y-auto overflow-x-hidden flex-1">
          <TrainingPlanPreviewHeader plan={plan} />
          <div className="p-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList
                className="w-full"
                variant="secondary"
                size="xl"
                rounded="full"
              >
                <TabsTrigger value="info" className="flex-1" rounded="full">
                  Info
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex-1" rounded="full">
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-6 mt-2">
                <TrainingPlanPreviewInfoTab
                  plan={plan}
                  weeksData={weeksData}
                  onWeekClick={handleWeekClick}
                  onCreatorClick={handleCreatorClick}
                />
              </TabsContent>

              <TabsContent value="preview" className="">
                <PlanPreviewTab weeks={weeksData?.weeks || null} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <TrainingPlanPreviewFooter
          plan={plan}
          onAssignTemplate={onAssignTemplate}
          isAssigning={isAssigning}
        />
      </div>

      <TrainerDetailsDrawer
        trainer={trainerData}
        isOpen={isTrainerDrawerOpen}
        onClose={() => setIsTrainerDrawerOpen(false)}
      />
    </>
  )
}
