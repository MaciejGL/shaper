'use client'

import { Activity, Target } from 'lucide-react'
import { useState } from 'react'

import { MuscleGroupRadarChart } from '@/components/muscle-group-radar-chart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/context/user-context'

import { HeatmapBodyView } from './heatmap-body-view'

export function MuscleHeatmapSection() {
  const { user } = useUser()
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)

  // Placeholder data - will be replaced with real data in Phase 3
  const muscleFocusData = {
    chest: 85,
    back: 90,
    shoulders: 70,
    arms: 60,
    legs: 120,
    core: 45,
  }

  const muscleIntensity = {
    chest: 0.8,
    back: 0.9,
    shoulders: 0.7,
    arms: 0.6,
    legs: 1.0,
    core: 0.5,
  }

  if (!user) {
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-orange-500" />
          Muscle Focus Heatmap
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          iconStart={<Target className="h-4 w-4" />}
        >
          Focus Mode
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Body Heatmap View */}
          <div className="flex justify-center">
            <HeatmapBodyView
              muscleIntensity={muscleIntensity}
              selectedMuscle={selectedMuscle}
              onMuscleClick={setSelectedMuscle}
            />
          </div>

          {/* Radial Chart */}
          <div className="h-64">
            <MuscleGroupRadarChart data={muscleFocusData} />
          </div>

          {/* Selected Muscle Details */}
          {selectedMuscle && (
            <div className="space-y-3">
              <div className="text-center">
                <h3 className="font-medium capitalize">
                  {selectedMuscle} Focus
                </h3>
                <p className="text-sm text-muted-foreground">
                  Intensity:{' '}
                  {Math.round(
                    muscleIntensity[
                      selectedMuscle as keyof typeof muscleIntensity
                    ] * 100,
                  )}
                  %
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-card-on-card rounded-lg">
                  <div className="text-lg font-semibold">
                    {
                      muscleFocusData[
                        selectedMuscle as keyof typeof muscleFocusData
                      ]
                    }{' '}
                    sets
                  </div>
                  <div className="text-xs text-muted-foreground">This Week</div>
                </div>
                <div className="text-center p-3 bg-card-on-card rounded-lg">
                  <div className="text-lg font-semibold text-orange-600">
                    {Math.round(
                      muscleIntensity[
                        selectedMuscle as keyof typeof muscleIntensity
                      ] * 100,
                    )}
                    %
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Focus Level
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-card-on-card rounded">
              <div className="text-sm font-medium">High Focus</div>
              <div className="text-xs text-muted-foreground">Legs, Back</div>
            </div>
            <div className="p-2 bg-card-on-card rounded">
              <div className="text-sm font-medium">Medium Focus</div>
              <div className="text-xs text-muted-foreground">
                Chest, Shoulders
              </div>
            </div>
            <div className="p-2 bg-card-on-card rounded">
              <div className="text-sm font-medium">Low Focus</div>
              <div className="text-xs text-muted-foreground">Arms, Core</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
