'use client'

import { BookmarkIcon, ChevronRight } from 'lucide-react'
import { useState } from 'react'

import { StateCard } from '@/components/state-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  GQLGetFavouriteWorkoutsQuery,
  useGetFavouriteWorkoutsQuery,
} from '@/generated/graphql-client'

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
        {favourites.map((favourite: FavouriteWorkout) => (
          <Card
            borderless
            key={favourite.id}
            className={`cursor-pointer transition-all ${
              selectedFavouriteId === favourite.id
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:bg-muted/50'
            } ${isStarting ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => !isStarting && handleSelectFavourite(favourite.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{favourite.title}</CardTitle>
                  {favourite.description && (
                    <CardDescription className="mt-1">
                      {favourite.description}
                    </CardDescription>
                  )}
                </div>
                <Button
                  size="sm"
                  disabled={isStarting}
                  loading={isStarting && selectedFavouriteId === favourite.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectFavourite(favourite.id)
                  }}
                  iconEnd={<ChevronRight />}
                >
                  {isStarting && selectedFavouriteId === favourite.id
                    ? 'Adding...'
                    : 'Add to Today'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                {favourite.exercises && favourite.exercises.length > 0 && (
                  <>
                    <div className="flex flex-col gap-1">
                      {favourite.exercises.map((exercise, index: number) => (
                        <Badge key={index} variant="secondary" size="lg">
                          {index + 1}. {exercise.name}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
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
