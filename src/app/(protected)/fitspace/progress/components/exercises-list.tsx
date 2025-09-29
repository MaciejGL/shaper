'use client'

import { SearchIcon, Star, StarIcon, Trophy } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { EmptyStateCard } from '@/components/empty-state-card'
import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/context/user-context'
import { useProgressPageExercisesQuery } from '@/generated/graphql-client'
import { LocalStorageKey, useLocalStorage } from '@/hooks/use-local-storage'
import { useWeightConversion } from '@/hooks/use-weight-conversion'
import { cn } from '@/lib/utils'

import { ExerciseDrawer } from './exercise-drawer'

export function ExercisesList() {
  const { user } = useUser()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('all')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
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

  // Get date thresholds for filtering
  const now = new Date()
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Calculate counts for each tab (before search filtering)
  const getExerciseCountForPeriod = (
    period: 'last-week' | 'last-month' | 'all',
  ) => {
    return allExercises.filter((exercise) => {
      if (period === 'all') return true

      const latestSession = exercise.estimated1RMProgress?.[0]
      if (!latestSession?.date) return false

      const sessionDate = new Date(latestSession.date)

      if (period === 'last-week') {
        return sessionDate >= lastWeek
      }

      if (period === 'last-month') {
        return sessionDate >= lastMonth
      }

      return true
    }).length
  }

  const lastWeekCount = getExerciseCountForPeriod('last-week')
  const lastMonthCount = getExerciseCountForPeriod('last-month')
  const allCount = getExerciseCountForPeriod('all')

  // Filter and sort exercises - favorites first, then by search term and date
  const exercises = allExercises
    .filter((exercise) => {
      // Filter by search term
      const matchesSearch = exercise.baseExercise?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      if (!matchesSearch) return false

      // Filter by favorites if enabled
      if (showFavoritesOnly) {
        const isFavorite = favoriteExercisesSet.has(
          exercise.baseExercise?.id || '',
        )
        if (!isFavorite) return false
      }

      // Filter by date tab
      if (selectedTab === 'all') return true

      // Get the latest session date from the exercise
      const latestSession = exercise.estimated1RMProgress?.[0]
      if (!latestSession?.date) return false

      const sessionDate = new Date(latestSession.date)

      if (selectedTab === 'last-week') {
        return sessionDate >= lastWeek
      }

      if (selectedTab === 'last-month') {
        return sessionDate >= lastMonth
      }

      return true
    })
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
      <div className="flex items-center gap-2 mb-4 w-full">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="last-week">
              Last Week <CountBadge count={lastWeekCount} />
            </TabsTrigger>
            <TabsTrigger value="last-month">
              Last Month <CountBadge count={lastMonthCount} />
            </TabsTrigger>
            <TabsTrigger value="all">
              All <CountBadge count={allCount} />
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          variant="secondary"
          size="icon-md"
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          iconOnly={
            <StarIcon
              className={cn(
                showFavoritesOnly
                  ? 'fill-yellow-500 text-yellow-500'
                  : 'text-muted-foreground',
              )}
            />
          }
          className="ml-auto"
        />
      </div>
      <div className="grid gap-2">
        {showFavoritesOnly && exercises.length === 0 ? (
          <EmptyStateCard
            title="No favorite exercises found"
            description="Try adding some exercises to favorites or adjusting your filters"
            icon={Star}
          />
        ) : exercises.length === 0 ? (
          <EmptyStateCard
            title="No exercises found"
            description="Try adjusting your search term"
            icon={SearchIcon}
          />
        ) : null}
        {exercises.map((exercise) => {
          if (!exercise.baseExercise) return null

          const latest1RM = exercise.estimated1RMProgress?.[0]?.average1RM || 0
          const exerciseName = exercise.baseExercise.name
          const exerciseId = exercise.baseExercise.id
          const isFavorite = favoriteExercisesSet.has(exerciseId)

          return (
            <ExerciseDrawer exerciseId={exerciseId} key={exerciseId}>
              <Card
                borderless
                key={exerciseId}
                className="hover:shadow-sm transition-all cursor-pointer py-0 relative bg-card/70"
              >
                <CardContent className="p-4">
                  <div className="gap-2 flex flex-col">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="text-sm max-w-[20ch] whitespace-pre-wrap">
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
                        <div className="text-right ml-auto self-start">
                          <Badge variant="secondary" size="md">
                            <Trophy className="h-3 w-3 mr-1" />
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
            </ExerciseDrawer>
          )
        })}
      </div>
    </div>
  )
}

const CountBadge = ({ count }: { count: number }) => {
  return <div className="rounded-full text-muted-foreground">{count}</div>
}
