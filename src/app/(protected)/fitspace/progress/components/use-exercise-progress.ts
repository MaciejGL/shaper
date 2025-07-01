import { format } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'

import { ExerciseProgress, TimePeriod } from './exercise-progress-constants'

export function useExerciseProgress(
  exerciseProgress: ExerciseProgress[],
  userId: string | null,
) {
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([])

  // Load selected exercises from localStorage on mount
  useEffect(() => {
    if (userId) {
      const stored = localStorage.getItem(`selectedExercises_${userId}`)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) {
            setSelectedExerciseIds(parsed)
          }
        } catch (error) {
          console.warn('Failed to parse stored exercise selection:', error)
        }
      }
    }
  }, [userId])

  // Filter and maintain order based on selectedExerciseIds array
  const selectedExercises = useMemo(() => {
    return selectedExerciseIds
      .map((id) => exerciseProgress.find((ex) => ex.baseExercise?.id === id))
      .filter(Boolean)
  }, [exerciseProgress, selectedExerciseIds])

  // Save selected exercises to localStorage when they change
  const handleExerciseSelectionChange = (exerciseIds: string[]) => {
    setSelectedExerciseIds(exerciseIds)
    if (userId) {
      localStorage.setItem(
        `selectedExercises_${userId}`,
        JSON.stringify(exerciseIds),
      )
    }
  }

  // Handle removing an exercise from favorites
  const handleRemoveExercise = (exerciseId: string) => {
    const newIds = selectedExerciseIds.filter((id) => id !== exerciseId)
    handleExerciseSelectionChange(newIds)
  }

  // Handle moving an exercise to the top
  const handleMoveToTop = (exerciseId: string) => {
    const newIds = [
      exerciseId,
      ...selectedExerciseIds.filter((id) => id !== exerciseId),
    ]
    handleExerciseSelectionChange(newIds)
  }

  return {
    selectedExerciseIds,
    selectedExercises,
    handleExerciseSelectionChange,
    handleRemoveExercise,
    handleMoveToTop,
  }
}

export function useChartData(
  exercise: ExerciseProgress | undefined,
  timePeriod: TimePeriod,
) {
  return useMemo(() => {
    const oneRMData = exercise?.estimated1RMProgress || []

    if (oneRMData.length === 0) {
      return []
    }

    // Create data points from 1RM progression
    const allDataPoints = new Map()

    oneRMData.forEach((item) => {
      if (!item.date) return

      const date = new Date(item.date)
      if (isNaN(date.getTime())) return

      // Use real data from the exercise
      const totalSetsFromExercise = exercise?.totalSets || 0
      const volumeFromProgress = exercise?.totalVolumeProgress || []

      // Calculate estimated sets and volume for this data point
      const setsPerPoint =
        totalSetsFromExercise > 0
          ? Math.ceil(totalSetsFromExercise / oneRMData.length)
          : Math.round(8 + Math.random() * 6) // Fallback: 8-14 sets

      // Try to find matching volume data or estimate
      const matchingVolume = volumeFromProgress.find((vol) => {
        const volDate = new Date(vol.week)
        return (
          Math.abs(volDate.getTime() - date.getTime()) < 7 * 24 * 60 * 60 * 1000
        ) // Within a week
      })

      const volumePerPoint =
        matchingVolume?.totalVolume ||
        (item.average1RM || 50) * 0.75 * setsPerPoint * 8 // Estimate: 1RM * 75% * sets * reps

      const key = `date-${item.date}`
      allDataPoints.set(key, {
        date: format(date, 'd MMM'),
        oneRM: item.average1RM || 0,
        sets: Math.round(setsPerPoint),
        volume: Math.round(volumePerPoint),
        timestamp: date.getTime(),
      })
    })

    // Filter based on selected time period
    const now = new Date()
    let cutoffTime = 0

    switch (timePeriod) {
      case '12weeks':
        cutoffTime = now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000
        break
      case '1year':
        cutoffTime = now.getTime() - 365 * 24 * 60 * 60 * 1000
        break
      case 'all':
        cutoffTime = 0
        break
    }

    const result = Array.from(allDataPoints.values())
      .filter((item) => item.timestamp >= cutoffTime)
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-15) // Show up to 15 data points

    return result
  }, [exercise, timePeriod])
}

export function useExerciseImprovement(
  exercise: ExerciseProgress | undefined,
  timePeriod: TimePeriod,
) {
  return useMemo(() => {
    if (
      !exercise?.estimated1RMProgress ||
      exercise?.estimated1RMProgress.length < 2
    ) {
      return 0
    }

    // Filter data based on selected time period
    const now = new Date()
    let cutoffTime = 0

    switch (timePeriod) {
      case '12weeks':
        cutoffTime = now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000
        break
      case '1year':
        cutoffTime = now.getTime() - 365 * 24 * 60 * 60 * 1000
        break
      case 'all':
        cutoffTime = 0
        break
    }

    // Filter and sort data for the selected time period
    const filteredData = exercise.estimated1RMProgress
      .filter((item) => {
        if (!item.date) return false
        const date = new Date(item.date)
        return !isNaN(date.getTime()) && date.getTime() >= cutoffTime
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (filteredData.length < 2) {
      return 0
    }

    const earliestValue = filteredData[0]?.average1RM || 0
    const latestValue = filteredData[filteredData.length - 1]?.average1RM || 0

    // Validate that values are reasonable
    if (
      earliestValue <= 0 ||
      latestValue <= 0 ||
      earliestValue > 500 ||
      latestValue > 500
    ) {
      return 0
    }

    const calculatedImprovement =
      ((latestValue - earliestValue) / earliestValue) * 100

    // Cap improvement at reasonable bounds for the time period
    const maxImprovement =
      timePeriod === '12weeks' ? 50 : timePeriod === '1year' ? 100 : 150
    const minImprovement = -50

    return Math.max(
      minImprovement,
      Math.min(maxImprovement, calculatedImprovement),
    )
  }, [exercise?.estimated1RMProgress, timePeriod])
}
