'use client'

import { useState } from 'react'

import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/context/user-context'
import { cn } from '@/lib/utils'

import { HEATMAP_COLORS } from '../../constants/heatmap-colors'

import {
  BaseMuscleBodyMap,
  LABEL_HEIGHT,
  MusclePosition,
} from './muscle-body-map'
import type { MuscleProgressData } from './types'

const DISPLAY_NAMES: Record<string, string> = {
  'Upper Back': 'Up-Back',
  'Lower Back': 'Low-Back',
  Hamstrings: 'Hams',
  'Inner Thighs': 'Adductors',
}

interface MuscleProgressLabelProps {
  position: MusclePosition
  progress: MuscleProgressData | undefined
  isSelected: boolean
  onClick: () => void
}

function MuscleProgressLabel({
  position,
  progress,
  isSelected,
  onClick,
}: MuscleProgressLabelProps) {
  const completedSets = progress?.completedSets ?? 0
  const targetSets = progress?.targetSets ?? 12
  const percentage = progress?.percentage ?? 0
  const colorLevel = HEATMAP_COLORS.getColorForProgress(percentage / 100)
  const isLeft = position.side === 'left'
  const displayName = DISPLAY_NAMES[position.muscle] ?? position.muscle

  return (
    <button
      onClick={onClick}
      style={{ height: LABEL_HEIGHT }}
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
          {completedSets}/{targetSets}
        </span>
      </div>

      <Progress
        value={percentage}
        classNameIndicator={colorLevel.progressColor}
      />
    </button>
  )
}

interface HeatmapBodyViewProps {
  muscleIntensity: Record<string, number>
  muscleProgress: Record<string, MuscleProgressData>
  selectedMuscle: string | null
  onMuscleClick: (muscle: string) => void
}

export function HeatmapBodyView({
  muscleIntensity,
  muscleProgress,
  selectedMuscle,
  onMuscleClick,
}: HeatmapBodyViewProps) {
  const [view, setView] = useState<'front' | 'back'>('front')
  const { user } = useUser()
  const isFemale = user?.profile?.sex === 'Female'

  return (
    <div className="relative">
      <Tabs value={view} onValueChange={(v) => setView(v as 'front' | 'back')}>
        <TabsContent value="front" className="-mx-2">
          <BaseMuscleBodyMap
            view="front"
            muscleIntensity={muscleIntensity}
            selectedMuscle={selectedMuscle}
            onMuscleClick={onMuscleClick}
            renderLabel={({ position }) => (
              <MuscleProgressLabel
                position={position}
                progress={muscleProgress[position.muscle]}
                isSelected={selectedMuscle === position.muscle}
                onClick={() => onMuscleClick(position.muscle)}
              />
            )}
          />
        </TabsContent>

        <TabsContent value="back" className="-mx-2">
          <BaseMuscleBodyMap
            view="back"
            muscleIntensity={muscleIntensity}
            selectedMuscle={selectedMuscle}
            onMuscleClick={onMuscleClick}
            renderLabel={({ position }) => (
              <MuscleProgressLabel
                position={position}
                progress={muscleProgress[position.muscle]}
                isSelected={selectedMuscle === position.muscle}
                onClick={() => onMuscleClick(position.muscle)}
              />
            )}
          />
        </TabsContent>

        <div
          className={cn(
            'mx-auto flex flex-col items-center',
            isFemale && 'mt-10',
          )}
        >
          <TabsList
            variant="secondary"
            className="mx-auto border border-border grid grid-cols-2 w-fit"
          >
            <TabsTrigger value="front">Front</TabsTrigger>
            <TabsTrigger value="back">Back</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  )
}
