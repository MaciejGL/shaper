'use client'

import { groupBy, sortBy, uniqBy } from 'lodash'
import { useState } from 'react'

import { ExerciseProgressChart } from '@/app/(protected)/fitspace/progress/components/exercise-progress-chart'
import { Loader } from '@/components/loader'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  type GQLGetClientByIdQuery,
  useExercisesProgressByUserQuery,
} from '@/generated/graphql-client'

interface ExerciseLogsProps {
  plan: NonNullable<GQLGetClientByIdQuery['getClientActivePlan']>
  clientId: string
}

export function ExerciseLogs({ clientId }: ExerciseLogsProps) {
  const { data, isLoading } = useExercisesProgressByUserQuery({
    userId: clientId,
  })
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(
    null,
  )

  const allMuscleGroups = data?.exercisesProgressByUser.flatMap(
    (exercise) => exercise.baseExercise?.muscleGroups,
  )

  const uniqueMuscleGroups = sortBy(
    uniqBy(allMuscleGroups, (mg) => mg?.displayGroup),
    (mg) => mg?.displayGroup,
  )

  const exercisesCounter = groupBy(allMuscleGroups, (mg) => mg?.displayGroup)

  const filteredExercises = data?.exercisesProgressByUser.filter((exercise) =>
    exercise.baseExercise?.muscleGroups.some(
      (group) => group?.displayGroup === selectedMuscleGroup,
    ),
  )

  if (isLoading)
    return (
      <Card className="flex justify-center items-center h-full py-40">
        <Loader />
      </Card>
    )

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="allExercises"
        className="w-full"
        onValueChange={(value) => {
          setSelectedMuscleGroup(value)
        }}
      >
        <TabsList>
          <TabsTrigger value="allExercises">
            All Exercises ({data?.exercisesProgressByUser.length})
          </TabsTrigger>
          {uniqueMuscleGroups.map(
            (mg) =>
              mg?.displayGroup && (
                <TabsTrigger key={mg.displayGroup} value={mg.displayGroup}>
                  {mg?.displayGroup} (
                  {exercisesCounter[mg.displayGroup]?.length})
                </TabsTrigger>
              ),
          )}
        </TabsList>

        {/* ALL EXERCISES TAB */}
        <TabsContent
          value="allExercises"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {data?.exercisesProgressByUser.map((exercise) => (
            <ExerciseProgressChart
              key={exercise.baseExercise?.id}
              exercise={exercise}
            />
          ))}
        </TabsContent>

        {/* GROUPED BY MUSCLE GROUP */}
        {uniqueMuscleGroups.map((mg) => (
          <TabsContent
            key={mg?.displayGroup}
            value={mg?.displayGroup ?? ''}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filteredExercises?.map((exercise) => (
              <ExerciseProgressChart
                key={exercise.baseExercise?.id}
                exercise={exercise}
              />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
