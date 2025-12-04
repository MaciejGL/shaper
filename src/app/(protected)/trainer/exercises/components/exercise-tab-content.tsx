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

  const { data: exercises, isLoading } = useTrainerExercisesQuery(
    {
      where: categoryId === 'all' ? undefined : { muscleGroups: category },
    },
    {
      refetchOnWindowFocus: false,
    },
  )

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
          userExercisesFiltered={userFilteredExercises}
          userExercises={userExercises}
          publicExercises={publicExercises}
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
  userExercisesFiltered,
  userExercises,
  publicExercises,
  categories,
  setIsCreateDialogOpen,
}: {
  userExercisesFiltered?: GQLTrainerExercisesQuery['userExercises']
  userExercises?: GQLTrainerExercisesQuery['userExercises']
  publicExercises?: GQLTrainerExercisesQuery['publicExercises']
  categories?: GQLMuscleGroupCategoriesQuery['muscleGroupCategories']
  setIsCreateDialogOpen: (open: boolean) => void
}) {
  const { hasAnyFilter } = useSearchQueries()
  const isFirstRender = useIsFirstRender()

  return (
    <AnimatedGrid layoutId="exercises">
      {userExercisesFiltered?.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          isFirstRender={isFirstRender}
          categories={categories}
          userExercises={userExercises}
          publicExercises={publicExercises}
        />
      ))}
      {hasAnyFilter && userExercisesFiltered?.length === 0 && (
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
      {!hasAnyFilter && userExercisesFiltered?.length === 0 && (
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
    instructions: [],
    tips: [],
    difficulty: null,
    additionalInstructions: null,
    videoUrl: '',
    equipment: GQLEquipment.Barbell,
    isPublic: false,
    images: [],
    muscleGroups: [
      {
        id: '2',
        name: 'Quadriceps',
        alias: 'Quads',
        displayGroup: 'quads',
      },
    ],
    secondaryMuscleGroups: [
      {
        id: '3',
        name: 'Hamstrings',
        alias: 'Hamstrings',
        displayGroup: 'hamstrings',
      },
    ],
  },

  {
    id: '2',
    name: 'Deadlift',
    description:
      'One to rule them all, One to find them, One to bring them all and in the darkness bind them',
    instructions: [],
    tips: [],
    difficulty: null,
    additionalInstructions: null,
    videoUrl: '',
    equipment: GQLEquipment.Barbell,
    isPublic: false,
    images: [],
    muscleGroups: [
      {
        id: '2',
        name: 'Quadriceps',
        alias: 'Quads',
        displayGroup: 'quads',
      },
    ],
    secondaryMuscleGroups: [
      {
        id: '3',
        name: 'Hamstrings',
        alias: 'Hamstrings',
        displayGroup: 'hamstrings',
      },
    ],
  },
  {
    id: '3',
    name: 'Deadlift',
    description:
      'One to rule them all, One to find them, One to bring them all and in the darkness bind them',
    instructions: [],
    tips: [],
    difficulty: null,
    additionalInstructions: null,
    videoUrl: '',
    equipment: GQLEquipment.Barbell,
    isPublic: false,
    images: [],
    muscleGroups: [
      {
        id: '2',
        name: 'Quadriceps',
        alias: 'Quads',
        displayGroup: 'quads',
      },
    ],
    secondaryMuscleGroups: [
      {
        id: '3',
        name: 'Hamstrings',
        alias: 'Hamstrings',
        displayGroup: 'hamstrings',
      },
    ],
  },
]
