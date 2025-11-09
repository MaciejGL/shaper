import { useState } from 'react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { TrainerData } from '@/components/trainer/trainer-card'
import { TrainerDetailsDrawer } from '@/components/trainer/trainer-details-drawer'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  GQLGetMySubscriptionStatusQuery,
  GQLGetPublicTrainingPlansQuery,
  useGetPublicTrainingPlanWeeksQuery,
} from '@/generated/graphql-client'

import { PlanPreviewTab } from '../plan-preview-tab'

import { TrainingPlanPreviewFooter } from './training-plan-preview-footer'
import { TrainingPlanPreviewHeader } from './training-plan-preview-header'
import { TrainingPlanPreviewInfoTab } from './training-plan-preview-info-tab'

interface TrainingPlanPreviewProps {
  plan: GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number] | null
  isOpen: boolean
  onClose: () => void
  onAssignTemplate: (planId: string) => void
  isAssigning: boolean
}

export function TrainingPlanPreview({
  plan,
  isOpen,
  onClose,
  onAssignTemplate,
  isAssigning,
}: TrainingPlanPreviewProps) {
  const [activeTab, setActiveTab] = useState('info')
  const [isTrainerDrawerOpen, setIsTrainerDrawerOpen] = useState(false)

  // Lazy load weeks data only when preview tab is active
  const { data: weeksData, isLoading: isLoadingWeeks } =
    useGetPublicTrainingPlanWeeksQuery(
      { planId: plan?.id || '' },
      {
        enabled: Boolean(isOpen && plan?.id),
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    )

  const handleWeekClick = (weekId: string) => {
    setActiveTab('preview')
  }

  const handleCreatorClick = () => {
    setIsTrainerDrawerOpen(true)
  }

  if (!plan) return null

  // Map creator data to TrainerData format
  const trainerData: TrainerData | null = plan.createdBy
    ? {
        id: plan.createdBy.id,
        name: null,
        email: '',
        role: 'TRAINER',
        profile: {
          firstName: plan.createdBy.firstName,
          lastName: plan.createdBy.lastName,
          avatarUrl: plan.createdBy.image,
          bio: null,
          specialization: null,
          credentials: null,
          successStories: null,
          trainerSince: null,
        },
      }
    : null

  return (
    <>
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent dialogTitle={plan.title} grabber={false}>
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Tabs Content */}
            <TrainingPlanPreviewHeader plan={plan} />
            <div className="flex-1  p-4">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList
                  className="w-full"
                  variant="secondary"
                  size="lg"
                  rounded="2xl"
                >
                  <TabsTrigger value="info" className="flex-1" rounded="2xl">
                    Info
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex-1" rounded="2xl">
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
                  {isLoadingWeeks ? (
                    <div className="py-8 text-center space-y-3">
                      <LoadingSkeleton count={4} />
                    </div>
                  ) : (
                    <PlanPreviewTab
                      weeks={weeksData?.getTrainingPlanById?.weeks || null}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <TrainingPlanPreviewFooter
              plan={plan}
              onAssignTemplate={onAssignTemplate}
              isAssigning={isAssigning}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Trainer Details Drawer - rendered outside to avoid nesting issues */}
      <TrainerDetailsDrawer
        trainer={trainerData}
        isOpen={isTrainerDrawerOpen}
        onClose={() => setIsTrainerDrawerOpen(false)}
      />
    </>
  )
}
