'use client'

import {
  ArrowLeft,
  BookmarkIcon,
  ChevronRight,
  Clock,
  Dot,
  Folder,
} from 'lucide-react'
import { useState } from 'react'

import { FolderCard } from '@/app/(protected)/fitspace/my-plans/components/favourites/folder-card'
import { LoadingSkeleton } from '@/components/loading-skeleton'
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
import {
  GQLGetFavouriteWorkoutsQuery,
  useGetFavouriteWorkoutFoldersQuery,
  useGetFavouriteWorkoutsQuery,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'
import { estimateWorkoutTime } from '@/lib/workout/estimate-workout-time'

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
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)

  const { data: favouritesData, isLoading: isLoadingWorkouts } =
    useGetFavouriteWorkoutsQuery()
  const { data: foldersData, isLoading: isLoadingFolders } =
    useGetFavouriteWorkoutFoldersQuery()

  const isLoading = isLoadingWorkouts || isLoadingFolders

  const allFavourites = favouritesData?.getFavouriteWorkouts || []
  const allFolders = foldersData?.getFavouriteWorkoutFolders || []

  const currentFolder = allFolders.find((f) => f.id === currentFolderId)

  // Filter workouts based on current folder view
  const displayedWorkouts = allFavourites.filter((workout) => {
    if (currentFolderId) {
      return workout.folderId === currentFolderId
    }
    return !workout.folderId // Show uncategorized at root
  })

  const displayedFolders = currentFolderId
    ? [] // Don't show folders when inside a folder
    : allFolders

  const handleSelectFavourite = (favouriteId: string) => {
    setSelectedFavouriteId(favouriteId)
    onSelectFavourite(favouriteId)
  }

  if (isLoading) {
    return <LoadingSkeleton count={4} variant="lg" />
  }

  const isEmpty =
    displayedWorkouts.length === 0 && displayedFolders.length === 0

  return (
    <div className="space-y-3">
      {/* Folder Navigation Header */}
      {currentFolderId && (
        <div className="flex items-center gap-2 mb-4 animate-in fade-in slide-in-from-left-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentFolderId(null)}
            iconStart={<ArrowLeft />}
            className="-ml-2"
          >
            Back to Plans
          </Button>
          <div className="h-4 w-px bg-border mx-1" />
          <span className="font-semibold text-sm">{currentFolder?.name}</span>
        </div>
      )}

      {/* Folders Grid */}
      {displayedFolders.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {displayedFolders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onClick={() => setCurrentFolderId(folder.id)}
            />
          ))}
          {displayedWorkouts.length > 0 && (
            <h3 className="text-sm font-medium text-muted-foreground mt-4 mb-2 px-1">
              Uncategorized Workouts
            </h3>
          )}
        </div>
      )}

      {/* Workouts List */}
      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        {displayedWorkouts
          .filter((favourite) => favourite.exercises.length > 0)
          .map((favourite: FavouriteWorkout) => {
            const estimatedTime = estimateWorkoutTime(favourite.exercises)
            return (
              <Card
                key={favourite.id}
                className={cn('cursor-pointer transition-all')}
              >
                <CardHeader className="space-y-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-base">
                      {favourite.title}
                    </CardTitle>
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
                    iconEnd={<ChevronRight />}
                  >
                    Start Workout
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
      </div>

      {isEmpty && (
        <StateCard
          title={
            currentFolderId ? 'No Workouts in Folder' : 'No Favourite Workouts'
          }
          description={
            currentFolderId
              ? 'This folder is empty. Add some workouts to it from your plans page.'
              : "You haven't saved any favourite workouts yet. Create and save some workouts to see them here."
          }
          Icon={currentFolderId ? Folder : BookmarkIcon}
          action={
            currentFolderId ? (
              <Button
                variant="outline"
                onClick={() => setCurrentFolderId(null)}
                className="mt-4"
              >
                Go Back
              </Button>
            ) : undefined
          }
        />
      )}
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
