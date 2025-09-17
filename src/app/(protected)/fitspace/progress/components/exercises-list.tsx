'use client'

import { BarChart3, SearchIcon, Star, Trophy } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useUser } from '@/context/user-context'
import { useProgressPageExercisesQuery } from '@/generated/graphql-client'
import { LocalStorageKey, useLocalStorage } from '@/hooks/use-local-storage'
import { useWeightConversion } from '@/hooks/use-weight-conversion'
import { cn } from '@/lib/utils'

import { ExerciseDrawer } from './exercise-drawer'

export function ExercisesList() {
  const { user } = useUser()
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null,
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [favoriteExercises, setFavoriteExercises] = useLocalStorage(
    LocalStorageKey.FAVORITE_EXERCISES,
    [],
  )
  const { toDisplayWeight, weightUnit } = useWeightConversion()

  // Convert array to Set for easier lookup
  const favoriteExercisesSet = new Set(favoriteExercises)

  const toggleFavorite = (exerciseId: string) => {
    setFavoriteExercises((prev) => {
      if (prev.includes(exerciseId)) {
        return prev.filter((id) => id !== exerciseId)
      } else {
        return [...prev, exerciseId]
      }
    })
  }

  const { data, isLoading } = useProgressPageExercisesQuery(
    { userId: user?.id || '' },
    { enabled: !!user?.id },
  )

  const allExercises = data?.exercisesProgressByUser || []

  // Filter and sort exercises - favorites first, then by search term
  const exercises = allExercises
    .filter((exercise) =>
      exercise.baseExercise?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      const aIsFavorite = favoriteExercisesSet.has(a.baseExercise?.id || '')
      const bIsFavorite = favoriteExercisesSet.has(b.baseExercise?.id || '')

      // Favorites first
      if (aIsFavorite && !bIsFavorite) return -1
      if (!aIsFavorite && bIsFavorite) return 1

      // Then alphabetically by name
      return (a.baseExercise?.name || '').localeCompare(
        b.baseExercise?.name || '',
      )
    })

  if (isLoading) {
    return (
      <div className="grid gap-3">
        <LoadingSkeleton count={6} variant="sm" />
      </div>
    )
  }

  if (exercises.length === 0 && searchTerm) {
    return (
      <div>
        <Input
          id="search-exercises"
          variant="secondary"
          iconStart={<SearchIcon />}
          placeholder="Search exercises"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <div className="text-center py-12">
          <SearchIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium mb-2">No exercises found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search term
          </p>
        </div>
      </div>
    )
  }

  const image1 = exercises[0]?.baseExercise?.images[0]?.thumbnail
  const image2 = exercises[0]?.baseExercise?.images[1]?.thumbnail

  return (
    <div>
      <Input
        id="search-exercises"
        variant="secondary"
        iconStart={<SearchIcon />}
        placeholder="Search exercises"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <div className="grid gap-3">
        {allExercises.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-medium mb-2">No exercises yet</h3>
            <p className="text-sm text-muted-foreground">
              Complete some workouts to see your exercises here!
            </p>
          </div>
        )}
        {exercises.map((exercise) => {
          if (!exercise.baseExercise) return null

          const latest1RM = exercise.estimated1RMProgress?.[0]?.average1RM || 0
          const exerciseName = exercise.baseExercise.name
          const exerciseId = exercise.baseExercise.id
          const isFavorite = favoriteExercisesSet.has(exerciseId)

          return (
            <Card
              borderless
              key={exerciseId}
              className="hover:shadow-sm transition-all cursor-pointer py-0 relative"
              onClick={() => setSelectedExerciseId(exerciseId)}
            >
              <CardContent className="p-4">
                <div className="gap-2 flex flex-col">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-medium whitespace-pre-wrap">
                      {exerciseName}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(exerciseId)
                      }}
                      iconOnly={
                        <Star
                          className={cn(
                            isFavorite
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-muted-foreground',
                          )}
                        />
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    {image1 && (
                      <div className="size-20 shrink-0 rounded-sm aspect-square overflow-hidden">
                        <Image
                          src={image1}
                          alt={exerciseName}
                          width={100}
                          height={100}
                          className="object-cover"
                        />
                      </div>
                    )}
                    {image2 && (
                      <div className="size-20 shrink-0 rounded-sm aspect-square overflow-hidden">
                        <Image
                          src={image2}
                          alt={exerciseName}
                          width={100}
                          height={100}
                          className="object-cover"
                        />
                      </div>
                    )}
                    {latest1RM > 0 && (
                      <div className="text-right ml-auto self-end">
                        <div className="text-xs text-muted-foreground">
                          Latest PR
                        </div>
                        <Badge variant="premium" size="lg">
                          <Trophy className="mr-1" />
                          <span className="font-semibold">
                            {toDisplayWeight(latest1RM)?.toFixed(1)}{' '}
                            {weightUnit}
                          </span>
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <ExerciseDrawer
        exerciseId={selectedExerciseId}
        isOpen={!!selectedExerciseId}
        onClose={() => setSelectedExerciseId(null)}
      />
    </div>
  )
}
