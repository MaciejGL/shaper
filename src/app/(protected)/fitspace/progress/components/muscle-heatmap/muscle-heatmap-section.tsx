'use client'

import { TabsContent } from '@radix-ui/react-tabs'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

import { PremiumGate } from '@/components/premium-gate'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/context/user-context'

import { ActivityHeatmap } from './activity-heatmap'
import { HeatmapBodyView } from './heatmap-body-view'
import { HeatmapLegend } from './heatmap-legend'
import { SelectedMuscleDetails } from './selected-muscle-details'
import { useMuscleHeatmap } from './use-muscle-heatmap'
import { WeekNavigator } from './week-navigator'

export function MuscleHeatmapSection() {
  const { user } = useUser()
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)

  const {
    muscleIntensity,
    muscleProgress,
    streakWeeks,
    weekOffset,
    setWeekOffset,
    isCurrentWeek,
    weekStartDate,
    weekEndDate,
    goToPreviousWeek,
    goToNextWeek,
  } = useMuscleHeatmap()

  const handleMuscleClick = (muscle: string) => {
    setSelectedMuscle(selectedMuscle === muscle ? null : muscle)
  }

  if (!user) {
    return null
  }

  return (
    <Card>
      <Tabs defaultValue="heatmap">
        <CardHeader className="pb-2">
          {streakWeeks > 0 && isCurrentWeek && (
            <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
              <span className="font-semibold">{streakWeeks}</span>
              <span>week streak</span>
            </div>
          )}
          <CardTitle>Muscle Heatmap</CardTitle>
          <div className="flex items-center justify-between gap-2">
            <CardDescription>Weekly sets per muscle.</CardDescription>
            <TabsList>
              <TabsTrigger value="heatmap">By Muscle</TabsTrigger>
              <TabsTrigger value="day">By Day</TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col">
          <TabsContent value="heatmap" className="pt-4 flex flex-col gap-4">
            <PremiumGate
              feature="Weekly Muscle Progress"
              compact
              showPartialContent
            >
              <div>
                <div className="mx-auto mb-6 w-max">
                  <WeekNavigator
                    weekStartDate={weekStartDate}
                    weekEndDate={weekEndDate}
                    weekOffset={weekOffset}
                    onPrevious={goToPreviousWeek}
                    onNext={goToNextWeek}
                  />
                </div>
                <div className="mb-10">
                  <HeatmapBodyView
                    muscleIntensity={muscleIntensity}
                    muscleProgress={muscleProgress}
                    selectedMuscle={selectedMuscle}
                    onMuscleClick={handleMuscleClick}
                  />
                </div>
                {/* Selected Muscle Details */}
                <AnimatePresence>
                  {selectedMuscle && muscleProgress[selectedMuscle] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.32, 0.72, 0, 1],
                      }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6">
                        <SelectedMuscleDetails
                          selectedMuscle={selectedMuscle}
                          muscleProgress={muscleProgress}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Color Legend */}

                <HeatmapLegend />
              </div>
            </PremiumGate>
          </TabsContent>
          <TabsContent value="day">
            <PremiumGate
              feature="Weekly Muscle Progress"
              compact
              showPartialContent
            >
              <div>
                {/* Body Heatmap View */}

                {/* Activity Heatmap */}
                <ActivityHeatmap
                  weekOffset={weekOffset}
                  onWeekOffsetChange={setWeekOffset}
                />
              </div>
            </PremiumGate>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
