'use client'

import { Dumbbell, Plus } from 'lucide-react'
import { useState } from 'react'

import { CardSkeleton } from '@/components/card-skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useUser } from '@/context/user-context'
import { GQLGetFavouriteWorkoutsQuery } from '@/generated/graphql-client'
import { WorkoutStatusAnalysis } from '@/hooks/use-favourite-workouts'

import { CreateEmptyFavouriteDrawer } from './create-empty-favourite-drawer'
import { FavouriteWorkoutCard } from './favourite-workout-card'

interface FavouriteWorkoutsListProps {
  favouriteWorkouts: NonNullable<
    NonNullable<GQLGetFavouriteWorkoutsQuery>['getFavouriteWorkouts']
  >
  loading: boolean
  onStartWorkout: (favouriteId: string) => void
  onDeleteWorkout: (favouriteId: string) => void
  onRefetch: () => void
  workoutStatus: WorkoutStatusAnalysis
  isStarting: boolean
}

export function FavouriteWorkoutsList({
  favouriteWorkouts,
  loading,
  onStartWorkout,
  onDeleteWorkout,
  onRefetch,
  workoutStatus,
  isStarting,
}: FavouriteWorkoutsListProps) {
  const { hasPremium } = useUser()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end items-center">
          <Button disabled iconStart={<Plus />}>
            Add Template
          </Button>
        </div>
        <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  const hasReachedLimit = favouriteWorkouts.length >= (hasPremium ? 999 : 3)

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center">
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          iconStart={<Plus />}
          disabled={hasReachedLimit}
        >
          Add Template
        </Button>
      </div>

      {favouriteWorkouts.length === 0 ? (
        <EmptyFavouritesState
          onCreateNew={() => setIsCreateModalOpen(true)}
          workoutStatus={workoutStatus}
        />
      ) : (
        <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
          {favouriteWorkouts.map((favourite) => (
            <FavouriteWorkoutCard
              key={favourite.id}
              favourite={favourite}
              onStart={() => onStartWorkout(favourite.id)}
              onRefetch={onRefetch}
              onDelete={() => onDeleteWorkout(favourite.id)}
              workoutStatus={workoutStatus}
              isLoading={isStarting}
            />
          ))}
        </div>
      )}

      <CreateEmptyFavouriteDrawer
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          onRefetch()
        }}
      />
    </div>
  )
}

function EmptyFavouritesState({
  onCreateNew,
  workoutStatus,
}: {
  onCreateNew: () => void
  workoutStatus: WorkoutStatusAnalysis
}) {
  const canStartMessage =
    workoutStatus.status === 'active-plan-workout'
      ? 'You have already a workout scheduled in your training plan for today.'
      : workoutStatus.message

  return (
    <Card borderless>
      <CardContent className="flex flex-col items-center justify-center text-center py-6">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Dumbbell className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Create first custom template
        </h3>
        <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
          Create your first custom template to quickly start your preferred
          exercise routines.
        </p>
        {workoutStatus.status === 'active-plan-workout' && (
          <p className="text-sm text-muted-foreground my-4 max-w-sm mx-auto">
            {canStartMessage}
          </p>
        )}
        <Button onClick={onCreateNew} iconStart={<Plus />}>
          Create
        </Button>
      </CardContent>
    </Card>
  )
}
