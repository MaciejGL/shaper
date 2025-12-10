'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

import { PremiumGate } from '@/components/premium-gate'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/context/user-context'

import { ActivityHeatmap } from './activity-heatmap'
import { HeatmapBodyView } from './heatmap-body-view'
import { HeatmapLegend } from './heatmap-legend'
import { SelectedMuscleDetails } from './selected-muscle-details'
import { useMuscleHeatmap } from './use-muscle-heatmap'

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
  } = useMuscleHeatmap()

  const handleMuscleClick = (muscle: string) => {
    setSelectedMuscle(selectedMuscle === muscle ? null : muscle)
  }

  if (!user) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Muscle Heatmap</CardTitle>
        <div className="flex flex-col gap-2 items-center justify-center">
          {/* <WeekNavigator
            weekStartDate={weekStartDate}
            weekEndDate={weekEndDate}
            weekOffset={weekOffset}
            onPrevious={goToPreviousWeek}
            onNext={goToNextWeek}
          /> */}
          {streakWeeks > 0 && isCurrentWeek && (
            <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
              <span className="font-semibold">{streakWeeks}</span>
              <span>week streak</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <PremiumGate
          feature="Weekly Muscle Progress"
          compact
          showPartialContent
        >
          <div>
            {/* Body Heatmap View */}
            <div className="mb-10">
              <HeatmapBodyView
                muscleIntensity={muscleIntensity}
                muscleProgress={muscleProgress}
                selectedMuscle={selectedMuscle}
                onMuscleClick={handleMuscleClick}
              />
            </div>

            {/* Color Legend */}
            <div className="mb-6">
              <HeatmapLegend />
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
                  <div className="pt-6">
                    <SelectedMuscleDetails
                      selectedMuscle={selectedMuscle}
                      muscleProgress={muscleProgress}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Activity Heatmap */}
            <ActivityHeatmap
              weekOffset={weekOffset}
              onWeekOffsetChange={setWeekOffset}
            />
          </div>
        </PremiumGate>
      </CardContent>
    </Card>
  )
}
