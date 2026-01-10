'use client'

import { ArrowRight, Salad } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { ComingSoonCard } from '@/components/coming-soon-card'
import { EmptyStateCard } from '@/components/empty-state-card'
import { ExtendHeader } from '@/components/extend-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useUser } from '@/context/user-context'
import {
  useGetMyMacroTargetsQuery,
  useGetMyNutritionPlanQuery,
  useGetMyNutritionPlansQuery,
} from '@/generated/graphql-client'
import { useTrainerServiceAccess } from '@/hooks/use-trainer-service-access'

import { DaySelector } from './components/day-selector'
import { MacroSummaryCard } from './components/macro-summary-card'
import { NutritionPlanSelector } from './components/nutrition-plan-selector'
import { NutritionPlanViewer } from './components/nutrition-plan-viewer'

export default function NutritionPage() {
  const router = useRouter()
  const { user } = useUser()
  const {
    canAccessTrainerFeatures,
    isTrainerServiceEnabled,
    isLoading: isAccessLoading,
  } = useTrainerServiceAccess()

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [activeDay, setActiveDay] = useState<string>('')

  const { data: macroData, isLoading: isMacroLoading } =
    useGetMyMacroTargetsQuery()
  const { data: nutritionPlansData, isLoading: isNutritionPlansLoading } =
    useGetMyNutritionPlansQuery()

  const { data: nutritionPlanData, isLoading: isNutritionPlanLoading } =
    useGetMyNutritionPlanQuery(
      { id: selectedPlanId! },
      {
        enabled: !!selectedPlanId,
        staleTime: 5 * 60 * 1000,
      },
    )

  const macroTargets = macroData?.getMyMacroTargets
  const nutritionPlan = nutritionPlanData?.nutritionPlan
  const days = useMemo(() => nutritionPlan?.days || [], [nutritionPlan])

  const effectiveActiveDay = useMemo(() => {
    if (days.length === 0) return ''

    if (activeDay && days.some((d) => d.dayNumber.toString() === activeDay)) {
      return activeDay
    }

    return days[0]?.dayNumber.toString() ?? ''
  }, [activeDay, days])

  const selectedDay = useMemo(() => {
    if (!effectiveActiveDay || days.length === 0) return null
    return (
      days.find((d) => d.dayNumber.toString() === effectiveActiveDay) ?? null
    )
  }, [days, effectiveActiveDay])

  useEffect(() => {
    if (selectedPlanId) {
      setActiveDay('')
    }
  }, [selectedPlanId])

  const handlePlanSelect = useCallback((planId: string | null) => {
    setSelectedPlanId(planId)
  }, [])

  const handleFindTrainer = () => {
    if (!isTrainerServiceEnabled) {
      toast.info('Trainer services are coming soon to your region.')
      return
    }
    router.push('/fitspace/explore?tab=trainers')
  }

  const hasPlans = (nutritionPlansData?.nutritionPlans.length ?? 0) > 0
  const hasMacroTargets =
    macroTargets?.calories ||
    macroTargets?.protein ||
    macroTargets?.carbs ||
    macroTargets?.fat

  const isLoadingAll =
    isMacroLoading ||
    isNutritionPlansLoading ||
    isNutritionPlanLoading ||
    isAccessLoading

  if (!isLoadingAll && !canAccessTrainerFeatures) {
    return (
      <div className="pt-4 px-4">
        <ComingSoonCard
          title="Nutrition Plans Coming Soon"
          description="Nutrition planning services are not yet available in your region. We're working to bring this feature to you soon."
          icon={Salad}
        />
      </div>
    )
  }

  const showEmptyState = !hasMacroTargets && !hasPlans && !isLoadingAll

  return (
    <ExtendHeader
      classNameHeaderWrapper="w-full"
      headerChildren={
        <div className="dark space-y-4 pt-4 w-full">
          {!isLoadingAll ? (
            <NutritionPlanSelector
              onPlanSelect={handlePlanSelect}
              selectedPlanId={selectedPlanId}
              nutritionPlans={nutritionPlansData?.nutritionPlans || []}
              isLoading={isNutritionPlansLoading}
              nutritionPlan={nutritionPlanData?.nutritionPlan}
            />
          ) : (
            <Skeleton className="h-[72px] rounded-2xl mb-4" />
          )}

          {days.length > 0 && (
            <DaySelector
              days={days}
              activeDay={effectiveActiveDay}
              onDayChange={setActiveDay}
            />
          )}
          {isNutritionPlanLoading && selectedPlanId && (
            <Skeleton className="h-10 w-full rounded-xl mb-4" />
          )}
        </div>
      }
      classNameContent="pt-4 px-0 rounded-t-none"
    >
      <div className="space-y-4">
        {showEmptyState && (
          <div className="px-4">
            <EmptyStateCard
              title="Request Macro Targets and Nutrition Plan"
              description={`${user?.trainerId ? 'Your trainer is working on your personalized macro targets' : 'You can request a trainer to set your macro targets'}`}
              icon={Salad}
              cta={
                !user?.trainerId && (
                  <Button iconEnd={<ArrowRight />} onClick={handleFindTrainer}>
                    Find a Trainer
                  </Button>
                )
              }
            />
          </div>
        )}

        {(hasMacroTargets || isMacroLoading) && (
          <div className="px-4">
            <MacroSummaryCard
              macroTargets={macroTargets}
              isLoading={isMacroLoading}
            />
          </div>
        )}

        {(selectedPlanId || isNutritionPlanLoading) && (
          <NutritionPlanViewer
            isLoading={
              isNutritionPlanLoading || (days.length > 0 && !effectiveActiveDay)
            }
            nutritionPlan={nutritionPlan}
            activeDay={selectedDay}
          />
        )}
      </div>
    </ExtendHeader>
  )
}
