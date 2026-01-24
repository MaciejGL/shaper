'use client'

import { useState } from 'react'

import { TrainerDetailsDrawer } from '@/components/trainer/trainer-details-drawer'
import { createTrainerDataFromUser } from '@/components/trainer/utils'
import { PrimaryTabList, Tabs, TabsContent } from '@/components/ui/tabs'

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
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null)
  const [isTrainerDrawerOpen, setIsTrainerDrawerOpen] = useState(false)

  const handleWeekClick = (weekId: string) => {
    setSelectedWeekId(weekId)
    setActiveTab('preview')
  }

  const handleCreatorClick = () => {
    setIsTrainerDrawerOpen(true)
  }

  const trainerData = createTrainerDataFromUser(plan.createdBy)

  return (
    <>
      <div className="flex flex-col h-full min-h-0">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <TrainingPlanPreviewHeader plan={plan} />
          <div className="p-4">
            <Tabs
              value={activeTab}
              // onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="mb-2 -mt-10 relative">
                <PrimaryTabList
                  options={[
                    { label: 'Info', value: 'info' },
                    { label: 'Preview', value: 'preview' },
                  ]}
                  onClick={setActiveTab}
                  active={activeTab}
                  className="grid grid-cols-2"
                  size="lg"
                />
              </div>

              <TabsContent value="info" className="space-y-6 mt-2">
                <TrainingPlanPreviewInfoTab
                  plan={plan}
                  weeksData={weeksData}
                  onWeekClick={handleWeekClick}
                  onCreatorClick={handleCreatorClick}
                />
              </TabsContent>

              <TabsContent value="preview" className="">
                <PlanPreviewTab
                  weeks={weeksData?.weeks || null}
                  avgSessionTime={plan.avgSessionTime ?? null}
                  selectedWeekId={selectedWeekId}
                />
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
