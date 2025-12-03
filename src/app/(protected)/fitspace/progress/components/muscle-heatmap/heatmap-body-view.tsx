'use client'

import { ArrowLeftRight } from 'lucide-react'
import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

import { HEATMAP_COLORS } from '../../constants/heatmap-colors'

import {
  BaseMuscleBodyMap,
  LABEL_HEIGHT,
  MusclePosition,
} from './muscle-body-map'
import type { MuscleProgressData } from './types'

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
  const displayName =
    position.muscle === 'LowerBack' ? 'Lower Back' : position.muscle

  return (
    <button
      onClick={onClick}
      style={{ height: LABEL_HEIGHT }}
      className={cn(
        'flex w-full flex-col justify-center gap-0.5 rounded-md px-2 transition-colors',
        'hover:bg-muted/50',
        isSelected && 'bg-muted',
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
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            colorLevel.progressColor,
            // percentage >= 100 && 'animate-pulse',
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
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

  return (
    <div className="relative">
      <Tabs value={view} onValueChange={(v) => setView(v as 'front' | 'back')}>
        <TabsList className="mx-auto border border-border grid grid-cols-[1fr_auto_1fr]">
          <TabsTrigger value="front">Front</TabsTrigger>
          <TabsTrigger value="swap" disabled>
            <ArrowLeftRight className="size-3" />
          </TabsTrigger>
          <TabsTrigger value="back">Back</TabsTrigger>
        </TabsList>

        <TabsContent value="front" className="pt-4">
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

        <TabsContent value="back" className="pt-4">
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
      </Tabs>
    </div>
  )
}
