'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

import { PremiumGate } from '@/components/premium-gate'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useUser } from '@/context/user-context'

import { HeatmapBodyView } from './heatmap-body-view'
import { MuscleProgressList } from './muscle-progress-list'
import { OverallProgress } from './overall-progress'
import { SelectedMuscleDetails } from './selected-muscle-details'
import { useMuscleHeatmap } from './use-muscle-heatmap'
import { WeekNavigator } from './week-navigator'

export function MuscleHeatmapSection() {
  const { user } = useUser()
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)

  const {
    muscleIntensity,
    muscleProgress,
    overallPercentage,
    streakWeeks,
    weekStartDate,
    weekEndDate,
    weekOffset,
    isCurrentWeek,
    goToPreviousWeek,
    goToNextWeek,
    isLoading,
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
        <div className="flex items-center justify-between">
          <WeekNavigator
            weekStartDate={weekStartDate}
            weekEndDate={weekEndDate}
            weekOffset={weekOffset}
            onPrevious={goToPreviousWeek}
            onNext={goToNextWeek}
          />
          {streakWeeks > 0 && isCurrentWeek && (
            <div className="flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700 dark:bg-orange-950 dark:text-orange-300">
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
          <div className="space-y-6">
            {/* Overall Progress */}
            <OverallProgress
              percentage={overallPercentage}
              isLoading={isLoading}
            />

            {/* Body Heatmap View */}
            <HeatmapBodyView
              muscleIntensity={muscleIntensity}
              muscleProgress={muscleProgress}
              selectedMuscle={selectedMuscle}
              onMuscleClick={handleMuscleClick}
            />

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
                  <SelectedMuscleDetails
                    selectedMuscle={selectedMuscle}
                    muscleProgress={muscleProgress}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Muscle Progress List */}
            <MuscleProgressList
              muscleProgress={muscleProgress}
              onMuscleClick={handleMuscleClick}
              selectedMuscle={selectedMuscle}
            />
          </div>
        </PremiumGate>
      </CardContent>
    </Card>
  )
}
