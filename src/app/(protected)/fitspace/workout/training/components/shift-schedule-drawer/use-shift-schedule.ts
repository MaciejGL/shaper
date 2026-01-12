'use client'

import { useQueryClient } from '@tanstack/react-query'
import { addDays } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { revalidatePlanPages } from '@/app/actions/revalidate'
import {
  GQLFitspaceGetWorkoutNavigationQuery,
  useFitspaceShiftTrainingScheduleMutation,
} from '@/generated/graphql-client'

import type { NavigationPlan } from '../workout-day'

import { getDateKeyAsUTC } from './utils'

interface ShiftScheduleArgs {
  fromWeekId: string
  startDateKey: string // YYYY-MM-DD
  timezone: string
}

export function useShiftSchedule(plan: NavigationPlan) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [isShifting, setIsShifting] = useState(false)

  const mutation = useFitspaceShiftTrainingScheduleMutation({
    onSuccess: async () => {
      await Promise.all([
        revalidatePlanPages(),
        queryClient.invalidateQueries({ queryKey: ['navigation'] }),
      ])
      router.refresh()
    },
  })

  const shiftSchedule = async ({
    fromWeekId,
    startDateKey,
    timezone,
  }: ShiftScheduleArgs) => {
    setIsShifting(true)

    try {
      // Find the selected week
      const fromWeek = plan.weeks.find((w) => w.id === fromWeekId)
      if (!fromWeek || !fromWeek.scheduledAt) {
        setIsShifting(false)
        return
      }

      // Get all weeks to shift (selected week and following)
      const weeksToShift = plan.weeks.filter(
        (w) => w.weekNumber >= fromWeek.weekNumber,
      )

      if (weeksToShift.length === 0) {
        setIsShifting(false)
        return
      }

      // Calculate offset in days
      const targetStartDate = getDateKeyAsUTC(startDateKey, timezone)
      const currentWeekStart = new Date(fromWeek.scheduledAt)
      const offsetMs = targetStartDate.getTime() - currentWeekStart.getTime()
      const offsetDays = Math.round(offsetMs / (1000 * 60 * 60 * 24))

      // If no change needed, return early
      if (offsetDays === 0) {
        setIsShifting(false)
        return
      }

      // Optimistic update - apply offset to weeks and days
      queryClient.setQueryData(
        ['navigation'],
        (old: GQLFitspaceGetWorkoutNavigationQuery | undefined) => {
          if (!old?.getWorkoutNavigation?.plan) return old

          return {
            ...old,
            getWorkoutNavigation: {
              ...old.getWorkoutNavigation,
              plan: {
                ...old.getWorkoutNavigation.plan,
                weeks: old.getWorkoutNavigation.plan.weeks.map((week) => {
                  // Only update weeks that should be shifted
                  if (week.weekNumber < fromWeek.weekNumber) {
                    return week
                  }

                  if (!week.scheduledAt) {
                    return week
                  }

                  // Calculate new week start
                  const newWeekStart = addDays(
                    new Date(week.scheduledAt),
                    offsetDays,
                  )

                  return {
                    ...week,
                    scheduledAt: newWeekStart.toISOString(),
                    days: week.days.map((day) => {
                      // Calculate new day scheduledAt as week start + dayOfWeek
                      const newDayScheduledAt = addDays(
                        newWeekStart,
                        day.dayOfWeek,
                      )
                      return {
                        ...day,
                        scheduledAt: newDayScheduledAt.toISOString(),
                      }
                    }),
                  }
                }),
              },
            },
          }
        },
      )

      // Execute mutation
      await mutation.mutateAsync({
        input: {
          planId: plan.id,
          fromWeekId,
          startDate: startDateKey,
        },
      })
    } catch (error) {
      // Rollback on error by invalidating
      await queryClient.invalidateQueries({ queryKey: ['navigation'] })
      throw error
    } finally {
      setIsShifting(false)
    }
  }

  return {
    shiftSchedule,
    isShifting,
  }
}
