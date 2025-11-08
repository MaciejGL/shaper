'use client'

import { Download } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          This nutrition plan doesn't have any days configured yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 mt-4">
      {nutritionPlan?.description && (
        <p className="text-sm text-muted-foreground mt-1">
          {nutritionPlan.description}
        </p>
      )}

      <Tabs value={activeDay} onValueChange={setActiveDay}>
        <div className="flex items-center gap-2 max-w-screen -mx-2 px-2 overflow-x-auto hide-scrollbar mb-2">
          <TabsList size="lg">
            {days.map((day) => (
              <TabsTrigger
                size="lg"
                key={day.id}
                value={day.dayNumber.toString()}
                className="flex-shrink-0"
              >
                {day.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {days.map((day) => (
          <TabsContent key={day.id} value={day.dayNumber.toString()}>
            <div className="space-y-8">
              {/* Meals Accordion */}
              <Card>
                <DayMealsAccordion day={day} />
                <CardFooter>
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
                </CardFooter>
              </Card>
              {/* Shopping List */}
              <ShoppingList day={day} planId={planId} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export function NutritionPlanViewerLoading() {
  return (
    <div className="space-y-4 mt-4">
      <Tabs value="0">
        <div className="flex items-center gap-2 max-w-screen -mx-2 px-2 mb-2 overflow-x-auto hide-scrollbar">
          <TabsList size="lg">
            {Array.from({ length: 7 }).map((_, index) => (
              <TabsTrigger
                size="lg"
                key={index}
                value={index.toString()}
                className="flex-shrink-0"
              >
                Day {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="0">
          <Card className="p-4">
            <DayMealsHeader loading />
            <div className="space-y-2">
              <LoadingSkeleton variant="sm" count={3} />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
