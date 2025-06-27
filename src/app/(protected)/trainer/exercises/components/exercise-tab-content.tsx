import { PlusIcon } from 'lucide-react'

import { AnimatedGrid, AnimatedGridItem } from '@/components/animated-grid'
import { useIsFirstRender } from '@/components/animated-grid'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GQLEquipment } from '@/generated/graphql-client'
import {
  GQLMuscleGroupCategoriesQuery,
  GQLTrainerExercisesQuery,
  useTrainerExercisesQuery,
} from '@/generated/graphql-client'

import { ExerciseCard } from './exercise-card'
import { useFilteredExercises, useSearchQueries } from './hooks'

export function ExerciseTabContent({
  categoryId,
  categories,
  setIsCreateDialogOpen,
}: {
  categoryId: string
  categories?: GQLMuscleGroupCategoriesQuery['muscleGroupCategories']
  setIsCreateDialogOpen: (open: boolean) => void
}) {
  const category = categories
    ?.find((c) => c.id === categoryId)
    ?.muscles.map((m) => m.id)

  const { data: exercises, isLoading } = useTrainerExercisesQuery({
    where: categoryId === 'all' ? undefined : { muscleGroups: category },
  })

  const userExercises = exercises?.userExercises
  const publicExercises = exercises?.publicExercises

  const { filteredExercises: userFilteredExercises } = useFilteredExercises({
    exercises: userExercises,
  })
  const { filteredExercises: publicFilteredExercises } = useFilteredExercises({
    exercises: publicExercises,
  })

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-xl font-bold">My Exercises</h3>
      {isLoading ? (
        <LoadingExercises />
      ) : (
        <MyExercises
          exercises={userFilteredExercises}
          categories={categories}
          setIsCreateDialogOpen={setIsCreateDialogOpen}
        />
      )}

      <h3 className="text-xl font-bold mt-6">Public Exercises</h3>
      {isLoading ? (
        <LoadingExercises />
      ) : (
        <PublicExercises exercises={publicFilteredExercises} />
      )}
    </div>
  )
}

function PublicExercises({
  exercises,
}: {
  exercises?: GQLTrainerExercisesQuery['publicExercises']
}) {
  const { hasAnyFilter } = useSearchQueries()
  const isFirstRender = useIsFirstRender()

  return (
    <AnimatedGrid layoutId="exercises">
      {exercises?.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          isFirstRender={isFirstRender}
        />
      ))}
      {hasAnyFilter && exercises?.length === 0 && (
        <AnimatedGridItem
          id="no-exercises"
          layoutId="exercises"
          isFirstRender={isFirstRender}
        >
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                No exercises found matching your criteria.
              </div>
            </CardContent>
          </Card>
        </AnimatedGridItem>
      )}
    </AnimatedGrid>
  )
}

function MyExercises({
  exercises,
  categories,
  setIsCreateDialogOpen,
}: {
  exercises?: GQLTrainerExercisesQuery['userExercises']
  categories?: GQLMuscleGroupCategoriesQuery['muscleGroupCategories']
  setIsCreateDialogOpen: (open: boolean) => void
}) {
  const { hasAnyFilter } = useSearchQueries()
  const isFirstRender = useIsFirstRender()

  return (
    <AnimatedGrid layoutId="exercises">
      {exercises?.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          isFirstRender={isFirstRender}
          categories={categories}
        />
      ))}
      {hasAnyFilter && exercises?.length === 0 && (
        <AnimatedGridItem
          id="no-exercises"
          layoutId="exercises-no-exercises"
          isFirstRender={isFirstRender}
        >
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                No exercises found matching your criteria.
              </div>
            </CardContent>
          </Card>
        </AnimatedGridItem>
      )}
      {!hasAnyFilter && exercises?.length === 0 && (
        <AnimatedGridItem
          id="no-exercises"
          layoutId="exercises-no-exercises"
          isFirstRender={isFirstRender}
        >
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                No exercises found matching your criteria.
              </div>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="mt-4 mx-auto"
                variant="default"
                iconStart={<PlusIcon />}
              >
                Create Your First Exercise
              </Button>
            </CardContent>
          </Card>
        </AnimatedGridItem>
      )}
    </AnimatedGrid>
  )
}

function LoadingExercises() {
  return (
    <div className="grid grid-cols-1 gap-4 auto-rows-fr @2xl/section:grid-cols-2 @2xl/section:gap-6 @5xl/section:grid-cols-3">
      {placeholderExercises.map((exercise, index) => (
        <ExerciseCard
          key={index}
          exercise={exercise}
          isFirstRender={false}
          isLoading={true}
        />
      ))}
    </div>
  )
}

const placeholderExercises = [
  {
    id: '1',
    name: 'Deadlift',
    description:
      'One to rule them all, One to find them, One to bring them all and in the darkness bind them',
    videoUrl: '',
    equipment: GQLEquipment.Barbell,
    isPublic: false,
    muscleGroups: [
      {
        id: '2',
        name: 'Quadriceps',
        alias: 'Quads',
        groupSlug: 'quads',
      },
    ],
  },
  {
    id: '2',
    name: 'Deadlift',
    description:
      'One to rule them all, One to find them, One to bring them all and in the darkness bind them',
    videoUrl: '',
    equipment: GQLEquipment.Barbell,
    isPublic: false,
    muscleGroups: [
      {
        id: '2',
        name: 'Quadriceps',
        alias: 'Quads',
        groupSlug: 'quads',
      },
    ],
  },
  {
    id: '3',
    name: 'Deadlift',
    description:
      'One to rule them all, One to find them, One to bring them all and in the darkness bind them',
    videoUrl: '',
    equipment: GQLEquipment.Barbell,
    isPublic: false,
    muscleGroups: [
      {
        id: '2',
        name: 'Quadriceps',
        alias: 'Quads',
        groupSlug: 'quads',
      },
    ],
  },
]
