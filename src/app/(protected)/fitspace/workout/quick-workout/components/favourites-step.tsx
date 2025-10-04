'use client'

import { BookmarkIcon, Clock, Dot, Play } from 'lucide-react'
import { useState } from 'react'

import { StateCard } from '@/components/state-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  GQLGetFavouriteWorkoutsQuery,
  useGetFavouriteWorkoutsQuery,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'
import { estimateWorkoutTime } from '@/lib/workout/esimate-workout-time'

import { getSetRange } from '../../utils'

interface FavouritesStepProps {
  onSelectFavourite: (favouriteId: string) => void
  isStarting: boolean
}

type FavouriteWorkout =
  NonNullable<GQLGetFavouriteWorkoutsQuery>['getFavouriteWorkouts'][0]

export function FavouritesStep({
  onSelectFavourite,
  isStarting,
}: FavouritesStepProps) {
  const [selectedFavouriteId, setSelectedFavouriteId] = useState<string | null>(
    null,
  )

  const { data: favouritesData, isLoading } = useGetFavouriteWorkoutsQuery()

  const favourites = favouritesData?.getFavouriteWorkouts || []

  const handleSelectFavourite = (favouriteId: string) => {
    setSelectedFavouriteId(favouriteId)
    onSelectFavourite(favouriteId)
  }

  if (isLoading) {
    return <FavouritesStepSkeleton />
  }

  if (favourites.length === 0) {
    return (
      <StateCard
        title="No Favourite Workouts"
        description="You haven't saved any favourite workouts yet. Create and save some workouts to see them here."
        Icon={BookmarkIcon}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {favourites.map((favourite: FavouriteWorkout) => {
          const estimatedTime = estimateWorkoutTime(favourite.exercises)
          return (
            <Card
              key={favourite.id}
              className={cn('cursor-pointer transition-all')}
            >
              <CardHeader className="space-y-2">
                <div className="flex justify-between">
                  <CardTitle className="text-base">{favourite.title}</CardTitle>
                  {estimatedTime > 0 && (
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />~{estimatedTime}
                      min
                    </Badge>
                  )}
                </div>
                {favourite.description && (
                  <CardDescription className="mt-1">
                    {favourite.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="pt-0 pb-4 space-y-4">
                {/* Exercise Preview */}
                <div className="space-y-1">
                  <div className="text-sm flex flex-col gap-1">
                    {favourite.exercises.map((exercise) => (
                      <ExerciseItem key={exercise.id} exercise={exercise} />
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="grid justify-end">
                <Button
                  size="sm"
                  disabled={isStarting}
                  loading={isStarting && selectedFavouriteId === favourite.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectFavourite(favourite.id)
                  }}
                  iconEnd={<Play className="fill-secondary stroke-secondary" />}
                >
                  Start Workout
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function ExerciseItem({
  exercise,
}: {
  exercise: FavouriteWorkout['exercises'][0]
}) {
  const repRange = getSetRange(exercise.sets.at(0))
  return (
    <div
      key={exercise.id}
      className="grid grid-cols-[minmax(14px,auto)_1fr] items-center gap-2"
    >
      <div className="text-sm text-muted-foreground">{exercise.order}</div>
      <div className="p-2 bg-card-on-card rounded-md">
        <p>{exercise.name}</p>
        <div className="flex items-center text-sm text-muted-foreground">
          <p>{exercise.sets.length} sets</p>
          {repRange && <Dot />}
          {repRange && <p>{repRange} reps</p>}
        </div>
      </div>
    </div>
  )
}

function FavouritesStepSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Skeleton className="h-7 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-9 w-16" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-1" />
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-14" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
