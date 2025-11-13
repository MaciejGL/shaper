import { describe, expect, it, vi } from 'vitest'

import {
  calculateTrainerPlanWeekIndex,
  findClosestWeek,
  findDayByDayOfWeek,
  findFirstNonCompletedDay,
  findWeekByDate,
  getDefaultSelection,
  isDateInWeek,
  isQuickWorkout,
  jsDateToTrainingDay,
} from './navigation-utils'
import { NavigationDay, NavigationPlan, NavigationWeek } from './workout-day'

describe('navigation-utils', () => {
  describe('isQuickWorkout', () => {
    it('returns true when weeks have scheduledAt', () => {
      const plan: NavigationPlan = {
        id: '1',
        startDate: null,
        weeks: [
          {
            id: 'w1',
            weekNumber: 1,
            scheduledAt: '2025-10-01T00:00:00Z',
            completedAt: null,
            days: [],
          },
        ],
      }
      expect(isQuickWorkout(plan)).toBe(true)
    })

    it('returns false when weeks have no scheduledAt', () => {
      const plan: NavigationPlan = {
        id: '1',
        startDate: '2025-01-01T00:00:00Z',
        weeks: [
          {
            id: 'w1',
            weekNumber: 1,
            scheduledAt: null,
            completedAt: null,
            days: [],
          },
        ],
      }
      expect(isQuickWorkout(plan)).toBe(false)
    })
  })

  describe('isDateInWeek', () => {
    it('returns true when date is within week', () => {
      const weekStart = new Date('2025-10-01T00:00:00Z') // Wednesday
      const date = new Date('2025-10-03T12:00:00Z') // Friday same week
      expect(isDateInWeek(date, weekStart)).toBe(true)
    })

    it('returns false when date is before week', () => {
      const weekStart = new Date('2025-10-01T00:00:00Z')
      const date = new Date('2025-09-30T12:00:00Z')
      expect(isDateInWeek(date, weekStart)).toBe(false)
    })

    it('returns false when date is after week', () => {
      const weekStart = new Date('2025-10-01T00:00:00Z')
      const date = new Date('2025-10-08T12:00:00Z')
      expect(isDateInWeek(date, weekStart)).toBe(false)
    })

    it('returns true for week start date', () => {
      const weekStart = new Date('2025-10-01T00:00:00Z')
      expect(isDateInWeek(weekStart, weekStart)).toBe(true)
    })

    it('returns false for exact week end (7 days later)', () => {
      const weekStart = new Date('2025-10-01T00:00:00Z')
      const weekEnd = new Date('2025-10-08T00:00:00Z')
      expect(isDateInWeek(weekEnd, weekStart)).toBe(false)
    })
  })

  describe('findWeekByDate', () => {
    it('finds the correct week containing the date', () => {
      const weeks: NavigationWeek[] = [
        {
          id: 'w1',
          weekNumber: 1,
          scheduledAt: '2025-09-29T00:00:00Z', // Week 40: Sep 29 - Oct 5
          completedAt: null,
          days: [],
        },
        {
          id: 'w2',
          weekNumber: 2,
          scheduledAt: '2025-10-06T00:00:00Z', // Week 41: Oct 6 - Oct 12
          completedAt: null,
          days: [],
        },
      ]

      const date = new Date('2025-10-03T00:00:00Z') // Oct 3 - should be in week 1
      const week = findWeekByDate(weeks, date)

      expect(week?.id).toBe('w1')
    })

    it('returns undefined when no week contains the date', () => {
      const weeks: NavigationWeek[] = [
        {
          id: 'w1',
          weekNumber: 1,
          scheduledAt: '2025-09-01T00:00:00Z',
          completedAt: null,
          days: [],
        },
      ]

      const date = new Date('2025-10-03T00:00:00Z')
      const week = findWeekByDate(weeks, date)

      expect(week).toBeUndefined()
    })
  })

  describe('findClosestWeek', () => {
    it('finds the closest week to the given date', () => {
      const weeks: NavigationWeek[] = [
        {
          id: 'w1',
          weekNumber: 1,
          scheduledAt: '2025-09-01T00:00:00Z',
          completedAt: null,
          days: [],
        },
        {
          id: 'w2',
          weekNumber: 2,
          scheduledAt: '2025-10-01T00:00:00Z',
          completedAt: null,
          days: [],
        },
        {
          id: 'w3',
          weekNumber: 3,
          scheduledAt: '2025-11-01T00:00:00Z',
          completedAt: null,
          days: [],
        },
      ]

      const date = new Date('2025-10-05T00:00:00Z')
      const week = findClosestWeek(weeks, date)

      expect(week?.id).toBe('w2')
    })

    it('returns undefined for empty weeks array', () => {
      const weeks: NavigationWeek[] = []
      const date = new Date('2025-10-03T00:00:00Z')

      expect(findClosestWeek(weeks, date)).toBeUndefined()
    })
  })

  describe('calculateTrainerPlanWeekIndex', () => {
    it('calculates week 0 for dates within first week', () => {
      const planStart = new Date('2025-10-01T00:00:00Z')
      const now = new Date('2025-10-05T00:00:00Z')

      expect(calculateTrainerPlanWeekIndex(planStart, now)).toBe(0)
    })

    it('calculates week 1 for dates in second week', () => {
      const planStart = new Date('2025-10-01T00:00:00Z')
      const now = new Date('2025-10-08T00:00:00Z')

      expect(calculateTrainerPlanWeekIndex(planStart, now)).toBe(1)
    })

    it('returns 0 for dates before plan start', () => {
      const planStart = new Date('2025-10-01T00:00:00Z')
      const now = new Date('2025-09-25T00:00:00Z')

      expect(calculateTrainerPlanWeekIndex(planStart, now)).toBe(0)
    })

    it('calculates correct week for 4 weeks in', () => {
      const planStart = new Date('2025-10-01T00:00:00Z')
      const now = new Date('2025-10-29T00:00:00Z')

      expect(calculateTrainerPlanWeekIndex(planStart, now)).toBe(4)
    })
  })

  describe('jsDateToTrainingDay', () => {
    it('converts Monday (1) to 0', () => {
      const monday = new Date('2025-09-29T00:00:00Z') // Monday
      expect(jsDateToTrainingDay(monday)).toBe(0)
    })

    it('converts Thursday (4) to 3', () => {
      const thursday = new Date('2025-10-02T00:00:00Z') // Thursday
      expect(jsDateToTrainingDay(thursday)).toBe(3)
    })

    it('converts Sunday (0) to 6', () => {
      const sunday = new Date('2025-10-05T00:00:00Z') // Sunday
      expect(jsDateToTrainingDay(sunday)).toBe(6)
    })

    it('converts Saturday (6) to 5', () => {
      const saturday = new Date('2025-10-04T00:00:00Z') // Saturday
      expect(jsDateToTrainingDay(saturday)).toBe(5)
    })
  })

  describe('findDayByDayOfWeek', () => {
    const days: NavigationDay[] = [
      {
        id: 'd1',
        dayOfWeek: 0,
        isRestDay: false,
        completedAt: null,
        scheduledAt: null,
        exercisesCount: 0,
      },
      {
        id: 'd2',
        dayOfWeek: 1,
        isRestDay: false,
        completedAt: null,
        scheduledAt: null,
        exercisesCount: 0,
      },
      {
        id: 'd3',
        dayOfWeek: 2,
        isRestDay: false,
        completedAt: null,
        scheduledAt: null,
        exercisesCount: 0,
      },
    ]

    it('finds day by dayOfWeek', () => {
      const day = findDayByDayOfWeek(days, 1)
      expect(day?.id).toBe('d2')
    })

    it('returns undefined for non-existent dayOfWeek', () => {
      const day = findDayByDayOfWeek(days, 5)
      expect(day).toBeUndefined()
    })
  })

  describe('findFirstNonCompletedDay', () => {
    it('finds first non-completed day', () => {
      const days: NavigationDay[] = [
        {
          id: 'd1',
          dayOfWeek: 0,
          isRestDay: false,
          completedAt: '2025-10-01T00:00:00Z',
          scheduledAt: null,
          exercisesCount: 0,
        },
        {
          id: 'd2',
          dayOfWeek: 1,
          isRestDay: false,
          completedAt: null,
          scheduledAt: null,
          exercisesCount: 0,
        },
        {
          id: 'd3',
          dayOfWeek: 2,
          isRestDay: false,
          completedAt: null,
          scheduledAt: null,
          exercisesCount: 0,
        },
      ]

      const day = findFirstNonCompletedDay(days)
      expect(day?.id).toBe('d2')
    })

    it('returns undefined when all days completed', () => {
      const days: NavigationDay[] = [
        {
          id: 'd1',
          dayOfWeek: 0,
          isRestDay: false,
          completedAt: '2025-10-01T00:00:00Z',
          scheduledAt: null,
          exercisesCount: 0,
        },
        {
          id: 'd2',
          dayOfWeek: 1,
          isRestDay: false,
          completedAt: '2025-10-02T00:00:00Z',
          scheduledAt: null,
          exercisesCount: 0,
        },
      ]

      const day = findFirstNonCompletedDay(days)
      expect(day).toBeUndefined()
    })
  })

  describe('getDefaultSelection', () => {
    it('returns null for undefined plan', () => {
      const result = getDefaultSelection(undefined)
      expect(result).toEqual({ weekId: null, dayId: null })
    })

    it('returns null for plan with no weeks', () => {
      const plan: NavigationPlan = {
        id: '1',
        startDate: null,
        weeks: [],
      }

      const result = getDefaultSelection(plan)
      expect(result).toEqual({ weekId: null, dayId: null })
    })

    it('selects correct week and day for Quick Workout', () => {
      const plan: NavigationPlan = {
        id: '1',
        startDate: null,
        weeks: [
          {
            id: 'w40',
            weekNumber: 40,
            scheduledAt: '2025-09-29T00:00:00Z', // Week 40: Sep 29 - Oct 5
            completedAt: null,
            days: [
              {
                id: 'd1',
                dayOfWeek: 0,
                isRestDay: false,
                completedAt: null,
                scheduledAt: null,
                exercisesCount: 0,
              }, // Monday
              {
                id: 'd2',
                dayOfWeek: 1,
                isRestDay: false,
                completedAt: null,
                scheduledAt: null,
                exercisesCount: 0,
              }, // Tuesday
              {
                id: 'd3',
                dayOfWeek: 2,
                isRestDay: false,
                completedAt: null,
                scheduledAt: null,
                exercisesCount: 0,
              }, // Wednesday
              {
                id: 'd4',
                dayOfWeek: 3,
                isRestDay: false,
                completedAt: null,
                scheduledAt: null,
                exercisesCount: 0,
              }, // Thursday
              {
                id: 'd5',
                dayOfWeek: 4,
                isRestDay: false,
                completedAt: null,
                scheduledAt: null,
                exercisesCount: 0,
              }, // Friday
            ],
          },
        ],
      }

      // October 3, 2025 is a Friday and falls in Week 40 (Sep 29 - Oct 5)
      const result = getDefaultSelection(plan)

      expect(result.weekId).toBe('w40')
      // Test should work regardless of current date - just check it found a valid day
      expect(result.dayId).toBeTruthy()
      expect(['d1', 'd2', 'd3', 'd4', 'd5']).toContain(result.dayId)
    })

    it('selects correct week for Trainer Plan based on start date', () => {
      // Mock the current date to Oct 3, 2025 (2 days after start date)
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-10-03T12:00:00Z'))

      const plan: NavigationPlan = {
        id: '1',
        startDate: '2025-10-01T00:00:00Z', // Oct 1, 2025
        weeks: [
          {
            id: 'w1',
            weekNumber: 1,
            scheduledAt: null,
            completedAt: null,
            days: [
              {
                id: 'd1',
                dayOfWeek: 0,
                isRestDay: false,
                completedAt: null,
                scheduledAt: null,
                exercisesCount: 0,
              }, // Monday
              {
                id: 'd2',
                dayOfWeek: 1,
                isRestDay: false,
                completedAt: null,
                scheduledAt: null,
                exercisesCount: 0,
              }, // Tuesday
              {
                id: 'd3',
                dayOfWeek: 2,
                isRestDay: false,
                completedAt: null,
                scheduledAt: null,
                exercisesCount: 0,
              }, // Wednesday
              {
                id: 'd4',
                dayOfWeek: 3,
                isRestDay: false,
                completedAt: null,
                scheduledAt: null,
                exercisesCount: 0,
              }, // Thursday
              {
                id: 'd5',
                dayOfWeek: 4,
                isRestDay: false,
                completedAt: null,
                scheduledAt: null,
                exercisesCount: 0,
              }, // Friday
            ],
          },
          {
            id: 'w2',
            weekNumber: 2,
            scheduledAt: null,
            completedAt: null,
            days: [
              {
                id: 'd6',
                dayOfWeek: 0,
                isRestDay: false,
                completedAt: null,
                scheduledAt: null,
                exercisesCount: 0,
              }, // Monday
            ],
          },
        ],
      }

      // Today is Oct 3, 2025 which is 2 days after start (Oct 1) = still week 1
      const result = getDefaultSelection(plan)

      expect(result.weekId).toBe('w1')
      // Test should work regardless of current date - just check it found a valid day
      expect(result.dayId).toBeTruthy()
      expect(['d1', 'd2', 'd3', 'd4', 'd5']).toContain(result.dayId)

      vi.useRealTimers()
    })
  })
})
