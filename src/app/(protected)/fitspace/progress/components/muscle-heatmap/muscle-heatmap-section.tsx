'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import { useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/context/user-context'

import { HeatmapBodyView } from './heatmap-body-view'
import { MuscleHeatmapEmpty } from './muscle-heatmap-empty'
import { MuscleHeatmapLoading } from './muscle-heatmap-loading'
import { QuickStats } from './quick-stats'
import { SelectedMuscleDetails } from './selected-muscle-details'
import { useMuscleHeatmap } from './use-muscle-heatmap'

export function MuscleHeatmapSection() {
  const { user } = useUser()
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)

  const {
    muscleIntensity,
    totalSets,
    individualMuscleData,
    rawMuscleData,
    isLoading,
    error,
  } = useMuscleHeatmap()

  const handleMuscleClick = (muscle: string) => {
    setSelectedMuscle(selectedMuscle === muscle ? null : muscle)
  }

  if (!user) {
    return null
  }

  if (isLoading) {
    return <MuscleHeatmapLoading />
  }

  if (error || totalSets === 0) {
    return <MuscleHeatmapEmpty />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-orange-500" />
          Muscle Focus Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          {/* Body Heatmap View */}
          <div className="flex justify-center">
            <HeatmapBodyView
              muscleIntensity={muscleIntensity}
              selectedMuscle={selectedMuscle}
              onMuscleClick={handleMuscleClick}
              rawMuscleData={rawMuscleData}
              disableEmptyLabels={true}
            />
          </div>

          {/* Selected Muscle Details */}
          <AnimatePresence>
            {selectedMuscle && (
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
                    muscleIntensity={muscleIntensity}
                    individualMuscleData={individualMuscleData}
                    rawMuscleData={rawMuscleData}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Stats */}
          <div className="pt-6">
            <QuickStats
              muscleIntensity={muscleIntensity}
              rawMuscleData={rawMuscleData}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
