'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GQLFitspaceGenerateAiWorkoutMutation } from '@/generated/graphql-client'

import { AiExerciseList } from './ai-exercise-list'

interface WorkoutVariantTabsProps {
  variants: GQLFitspaceGenerateAiWorkoutMutation['generateAiWorkout']['variants']
  selectedIndex: number
  onSelectVariant: (index: number) => void
  onReorderExercises?: (
    exercises: GQLFitspaceGenerateAiWorkoutMutation['generateAiWorkout']['variants'][number]['exercises'],
  ) => void
}

export function WorkoutVariantTabs({
  variants,
  selectedIndex,
  onSelectVariant,
  onReorderExercises,
}: WorkoutVariantTabsProps) {
  if (!variants || variants.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <Tabs
        value={selectedIndex.toString()}
        onValueChange={(value) => onSelectVariant(parseInt(value))}
      >
        <TabsList className="grid w-full grid-cols-2 border dark:border-0">
          {variants.map((variant, index) => (
            <TabsTrigger key={index} value={index.toString()}>
              {variant.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {variants.map((variant, index) => (
          <TabsContent
            key={index}
            value={index.toString()}
            className="space-y-4 overflow-visible -mx-4 px-4"
          >
            {/* Exercise List */}
            <AiExerciseList
              exercises={variant.exercises}
              onReorderExercises={onReorderExercises}
            />
            {/* Workout Summary */}
            {variant.summary && (
              <div className="p-4 bg-card-on-card rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {variant.summary}
                </p>
              </div>
            )}

            {/* Duration */}
            {variant.totalDuration && (
              <div className="text-sm text-muted-foreground">
                Estimated duration: ~{variant.totalDuration} minutes
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
