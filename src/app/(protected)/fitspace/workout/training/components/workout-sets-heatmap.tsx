'use client'

import { useMemo, useState } from 'react'

import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

import {
  BaseMuscleBodyMap,
  type MusclePosition,
} from '../../../progress/components/muscle-heatmap/muscle-body-map'
import { HEATMAP_COLORS } from '../../../progress/constants/heatmap-colors'

export interface WorkoutMuscleGroupSet {
  displayGroup: string
  weightedSets: number
}

const DISPLAY_NAMES: Record<string, string> = {
  'Upper Back': 'Up-Back',
  'Lower Back': 'Low-Back',
  Hamstrings: 'Hams',
  'Inner Thighs': 'Adductors',
}

function buildSetsDoneByDisplayGroup(sets: WorkoutMuscleGroupSet[]) {
  const setsDone: Record<string, number> = {}
  sets.forEach((item) => {
    setsDone[item.displayGroup] = item.weightedSets
  })
  return setsDone
}

function buildIntensityFromSets(setsDone: Record<string, number>, maxSets: number) {
  const intensity: Record<string, number> = {}

  Object.entries(setsDone).forEach(([group, sets]) => {
    intensity[group] = maxSets > 0 ? Math.min(1, sets / maxSets) : 0
  })

  return { intensity }
}

interface MuscleSetsLabelProps {
  position: MusclePosition
  setsDone: Record<string, number>
  maxSets: number
  isSelected: boolean
  onClick: () => void
}

function MuscleSetsLabel({
  position,
  setsDone,
  maxSets,
  isSelected,
  onClick,
}: MuscleSetsLabelProps) {
  const sets = setsDone[position.muscle] ?? 0
  const progress = maxSets > 0 ? Math.min(100, (sets / maxSets) * 100) : 0
  const colorLevel = HEATMAP_COLORS.getColorForProgress(progress / 100)
  const isLeft = position.side === 'left'
  const displayName = DISPLAY_NAMES[position.muscle] ?? position.muscle

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full flex-col justify-center gap-0.5 rounded-md px-2 transition-colors',
        'hover:bg-muted/50',
        isSelected && 'bg-muted/50',
        isLeft ? 'items-end' : 'items-start',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-1.5 text-[10px]',
          isLeft && 'flex-row-reverse',
        )}
      >
        <span className="font-medium truncate">{displayName}</span>
        <span className="tabular-nums text-muted-foreground whitespace-nowrap">
          {sets} sets
        </span>
      </div>

      <Progress
        value={progress}
        classNameIndicator={
          sets > 0 ? colorLevel.progressColor : 'bg-muted-foreground/20'
        }
      />
    </button>
  )
}

export function WorkoutSetsHeatmap({
  muscleGroupSets,
  maxSets,
}: {
  muscleGroupSets: WorkoutMuscleGroupSet[]
  maxSets: number
}) {
  const [view, setView] = useState<'front' | 'back'>('front')
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)

  const setsDone = useMemo(
    () => buildSetsDoneByDisplayGroup(muscleGroupSets),
    [muscleGroupSets],
  )

  const { intensity } = useMemo(
    () => buildIntensityFromSets(setsDone, maxSets),
    [maxSets, setsDone],
  )

  const handleMuscleClick = (muscle: string) => {
    setSelectedMuscle((prev) => (prev === muscle ? null : muscle))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Sets by muscle group</p>
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as 'front' | 'back')}
        >
          <TabsList variant="secondary" className="h-8">
            <TabsTrigger value="front" className="text-xs">
              Front
            </TabsTrigger>
            <TabsTrigger value="back" className="text-xs">
              Back
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-2xl p-4">
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as 'front' | 'back')}
        >
          <TabsContent value="front" className="-mx-2 mt-0">
            <BaseMuscleBodyMap
              view="front"
              muscleIntensity={intensity}
              selectedMuscle={selectedMuscle}
              onMuscleClick={handleMuscleClick}
              renderLabel={({ position }) => (
                <MuscleSetsLabel
                  position={position}
                  setsDone={setsDone}
                  maxSets={maxSets}
                  isSelected={selectedMuscle === position.muscle}
                  onClick={() => handleMuscleClick(position.muscle)}
                />
              )}
            />
          </TabsContent>

          <TabsContent value="back" className="-mx-2 mt-0">
            <BaseMuscleBodyMap
              view="back"
              muscleIntensity={intensity}
              selectedMuscle={selectedMuscle}
              onMuscleClick={handleMuscleClick}
              renderLabel={({ position }) => (
                <MuscleSetsLabel
                  position={position}
                  setsDone={setsDone}
                  maxSets={maxSets}
                  isSelected={selectedMuscle === position.muscle}
                  onClick={() => handleMuscleClick(position.muscle)}
                />
              )}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
