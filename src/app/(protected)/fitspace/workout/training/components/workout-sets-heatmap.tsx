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

const REWARD_SET_MILESTONES = {
  moderate: 3, // noticeably orange
  optimal: 6, // stronger orange
  max: 9, // current maximum color
} as const

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

function getRewardProgress(sets: number, maxSets: number) {
  const safeSets = Math.max(0, sets)

  const a = REWARD_SET_MILESTONES.moderate
  const b = REWARD_SET_MILESTONES.optimal
  const c = REWARD_SET_MILESTONES.max

  // Map sets -> progress so:
  // 3 sets => ~Moderate threshold
  // 6 sets => ~Optimal threshold
  // 9+ sets => current maximum color
  const absoluteProgress =
    safeSets >= c
      ? 1
      : safeSets >= b
        ? 0.75 + ((safeSets - b) / (c - b)) * (1 - 0.75)
        : safeSets >= a
          ? 0.44 + ((safeSets - a) / (b - a)) * (0.75 - 0.44)
          : (safeSets / a) * 0.44

  // If workout's max muscle volume is < 9 sets, normalize so the most-trained
  // muscle still hits 100% (never less “rewarding” than before).
  const workoutMax = Math.max(0, maxSets)
  const maxAbsoluteProgress =
    workoutMax >= c
      ? 1
      : workoutMax >= b
        ? 0.75 + ((workoutMax - b) / (c - b)) * (1 - 0.75)
        : workoutMax >= a
          ? 0.44 + ((workoutMax - a) / (b - a)) * (0.75 - 0.44)
          : workoutMax > 0
            ? (workoutMax / a) * 0.44
            : 0

  const normalized =
    maxAbsoluteProgress > 0 ? absoluteProgress / maxAbsoluteProgress : 0

  return clamp01(normalized)
}

function buildIntensityFromSets(
  setsDone: Record<string, number>,
  maxSets: number,
) {
  const intensity: Record<string, number> = {}

  Object.entries(setsDone).forEach(([group, sets]) => {
    intensity[group] = getRewardProgress(sets, maxSets)
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
  const progress01 = getRewardProgress(sets, maxSets)
  const progress = progress01 * 100
  const colorLevel = HEATMAP_COLORS.getColorForProgress(progress01)
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
