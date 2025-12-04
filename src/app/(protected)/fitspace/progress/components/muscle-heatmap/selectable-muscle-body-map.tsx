'use client'

import { Check } from 'lucide-react'
import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

import {
  BaseMuscleBodyMap,
  LABEL_HEIGHT,
  MusclePosition,
} from './muscle-body-map'

interface SelectableLabelProps {
  position: MusclePosition
  isSelected: boolean
  onClick: () => void
}

function SelectableLabel({
  position,
  isSelected,
  onClick,
}: SelectableLabelProps) {
  const isLeft = position.side === 'left'

  return (
    <button
      onClick={onClick}
      style={{ height: LABEL_HEIGHT }}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 transition-all',
        'hover:bg-muted/50',
        isSelected && 'bg-orange-500/20 ring-1 ring-orange-500/50',
        isLeft ? 'flex-row-reverse justify-start' : 'justify-start',
      )}
    >
      <span
        className={cn(
          'text-xs font-medium truncate',
          isSelected ? 'text-orange-500' : 'text-foreground',
        )}
      >
        {position.muscle}
      </span>
      {isSelected && <Check className="size-3.5 text-orange-500 shrink-0" />}
    </button>
  )
}

interface SelectableMuscleBodyMapProps {
  selectedMuscleGroups: string[]
  onMuscleGroupClick: (muscle: string) => void
}

export function SelectableMuscleBodyMap({
  selectedMuscleGroups,
  onMuscleGroupClick,
}: SelectableMuscleBodyMapProps) {
  const [view, setView] = useState<'front' | 'back'>('front')

  // Create intensity map for body coloring (1.0 = selected, 0 = not selected)
  const muscleIntensity: Record<string, number> = {}
  selectedMuscleGroups.forEach((muscle) => {
    muscleIntensity[muscle] = 1.0
  })

  return (
    <div className="relative">
      <Tabs value={view} onValueChange={(v) => setView(v as 'front' | 'back')}>
        <TabsList className="mx-auto border border-border grid grid-cols-2 w-fit">
          <TabsTrigger value="front">Front</TabsTrigger>
          <TabsTrigger value="back">Back</TabsTrigger>
        </TabsList>

        <TabsContent value="front" className="pt-4 -mx-2">
          <BaseMuscleBodyMap
            view="front"
            muscleIntensity={muscleIntensity}
            selectedMuscle={null}
            onMuscleClick={onMuscleGroupClick}
            renderLabel={({ position }) => (
              <SelectableLabel
                position={position}
                isSelected={selectedMuscleGroups.includes(position.muscle)}
                onClick={() => onMuscleGroupClick(position.muscle)}
              />
            )}
          />
        </TabsContent>

        <TabsContent value="back" className="pt-4 -mx-2">
          <BaseMuscleBodyMap
            view="back"
            muscleIntensity={muscleIntensity}
            selectedMuscle={null}
            onMuscleClick={onMuscleGroupClick}
            renderLabel={({ position }) => (
              <SelectableLabel
                position={position}
                isSelected={selectedMuscleGroups.includes(position.muscle)}
                onClick={() => onMuscleGroupClick(position.muscle)}
              />
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

