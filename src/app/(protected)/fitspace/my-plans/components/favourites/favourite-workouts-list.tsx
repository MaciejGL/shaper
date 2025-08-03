'use client'

import { Dumbbell, Plus } from 'lucide-react'
import { useState } from 'react'

import { CardSkeleton } from '@/components/card-skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GQLGetFavouriteWorkoutsQuery } from '@/generated/graphql-client'

import { CreateFavouriteModal } from './create-favourite-modal'
import { FavouriteWorkoutCard } from './favourite-workout-card'

interface FavouriteWorkoutsListProps {
  favouriteWorkouts: NonNullable<
    NonNullable<GQLGetFavouriteWorkoutsQuery>['getFavouriteWorkouts']
  >
  loading: boolean
  onStartWorkout: (favouriteId: string) => void
  onEditWorkout: (
    favourite: NonNullable<
      NonNullable<GQLGetFavouriteWorkoutsQuery>['getFavouriteWorkouts']
    >[number],
  ) => void
  onDeleteWorkout: (favouriteId: string) => void
  onRefetch: () => void
}

export function FavouriteWorkoutsList({
  favouriteWorkouts,
  loading,
  onStartWorkout,
  onEditWorkout,
  onDeleteWorkout,
  onRefetch,
}: FavouriteWorkoutsListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Favourite Workouts</h3>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Create Favourite
          </Button>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Favourite Workouts</h3>
        <Button onClick={() => setIsCreateModalOpen(true)} iconStart={<Plus />}>
          Create
        </Button>
      </div>

      {favouriteWorkouts.length === 0 ? (
        <EmptyFavouritesState onCreateNew={() => setIsCreateModalOpen(true)} />
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {favouriteWorkouts.map((favourite) => (
            <FavouriteWorkoutCard
              key={favourite.id}
              favourite={favourite}
              onStart={() => onStartWorkout(favourite.id)}
              onEdit={() => onEditWorkout(favourite)}
              onDelete={() => onDeleteWorkout(favourite.id)}
            />
          ))}
        </div>
      )}

      <CreateFavouriteModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          onRefetch()
        }}
      />
    </div>
  )
}

function EmptyFavouritesState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center text-center py-6">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Dumbbell className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          No Favourite Workouts Yet
        </h3>
        <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
          Create your first favourite workout to quickly start your preferred
          exercise routines.
        </p>
        <Button onClick={onCreateNew} iconStart={<Plus />}>
          Create
        </Button>
      </CardContent>
    </Card>
  )
}
