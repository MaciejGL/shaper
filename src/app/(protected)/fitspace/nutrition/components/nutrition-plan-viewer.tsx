'use client'

import { Download, Salad } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Divider } from '@/components/divider'
import { EmptyStateCard } from '@/components/empty-state-card'
import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  PrimaryTabList,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useGetMyNutritionPlanQuery } from '@/generated/graphql-client'
import { downloadPDF, generateFilename } from '@/lib/pdf/pdf-generator'

import { DayMealsAccordion, DayMealsHeader } from './day-meals-accordion'
import { NutritionPlanPDF } from './pdf/nutrition-plan-pdf'
import { ShoppingList } from './shopping-list'

interface NutritionPlanViewerProps {
  planId: string
}

export function NutritionPlanViewer({ planId }: NutritionPlanViewerProps) {
  const { data, isLoading } = useGetMyNutritionPlanQuery(
    { id: planId },
    {
      enabled: !!planId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  )

  const [activeDay, setActiveDay] = useState<string>('')
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const nutritionPlan = data?.nutritionPlan
  const days = useMemo(() => nutritionPlan?.days || [], [nutritionPlan])

  const handleExportPDF = async () => {
    if (!nutritionPlan) return

    setIsGeneratingPDF(true)
    try {
      const filename = generateFilename({
        prefix: `Nutrition Plan - ${nutritionPlan.name}`,
        skipTimestamp: true,
      })

      await downloadPDF(
        <NutritionPlanPDF nutritionPlan={nutritionPlan} />,
        filename,
      )
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }
  useEffect(() => {
    if (days.length > 0 && !activeDay) {
      setActiveDay(days[0].dayNumber.toString())
    }
  }, [days, activeDay])

  if (isLoading || (days.length > 0 && !activeDay)) {
    return <NutritionPlanViewerLoading />
  }

  if (!nutritionPlan || days.length === 0) {
    return (
      <div className="p-4">
        <EmptyStateCard
          icon={Salad}
          description="This nutrition plan doesn't have any days configured yet."
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeDay} onValueChange={setActiveDay}>
        <div className="flex items-center gap-2 max-w-screen overflow-x-auto hide-scrollbar mb-4">
          <PrimaryTabList
            size="lg"
            options={days.map((day) => ({
              label: day.name,
              value: day.dayNumber.toString(),
            }))}
            onClick={setActiveDay}
            active={activeDay}
            className="text-sm"
            classNameButton="text-sm px-3 grow"
          />
        </div>

        {days.map((day) => (
          <TabsContent
            key={day.id}
            value={day.dayNumber.toString()}
            className="px-4"
          >
            <div className="space-y-6">
              <DayMealsAccordion day={day} />
              <Button
                variant="tertiary"
                iconStart={<Download />}
                onClick={handleExportPDF}
                loading={isGeneratingPDF}
                disabled={isGeneratingPDF}
                className="w-full"
              >
                Export to PDF
              </Button>

              {/* Shopping List */}
              <Divider className="my-8" />
              <ShoppingList day={day} planId={planId} />
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {nutritionPlan?.description && (
        <p className="text-sm text-muted-foreground mt-4 px-4 whitespace-pre-wrap">
          {nutritionPlan.description}
        </p>
      )}
    </div>
  )
}

export function NutritionPlanViewerLoading() {
  return (
    <div className="space-y-4 ">
      <Tabs value="0">
        <div className="flex items-center gap-2 max-w-screen overflow-x-auto hide-scrollbar mb-4">
          <PrimaryTabList
            options={Array.from({ length: 7 }).map((_, index) => ({
              label: `Day ${index + 1}`,
              value: index.toString(),
            }))}
            onClick={() => {}}
            active="0"
            size="lg"
            className="text-sm"
            classNameButton="text-sm px-3"
          />
        </div>
        <TabsContent value="0" className="px-4">
          <Card className="p-4">
            <DayMealsHeader loading />
            <div className="space-y-2">
              <LoadingSkeleton variant="sm" count={3} cardVariant="tertiary" />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
