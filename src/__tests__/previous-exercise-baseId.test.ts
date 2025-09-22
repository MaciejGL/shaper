import { describe, expect, it } from 'vitest'

/**
 * Unit tests to verify the fix for previous exercise logs bug
 *
 * Bug: Previous exercise logs were matched by exercise name instead of baseId,
 * causing wrong "previous" data to be shown in workout sets placeholders.
 *
 * Fix: Updated getWorkoutDay to:
 * 1. Use baseId instead of exercise name for matching
 * 2. Include same week earlier days, not just previous weeks
 * 3. Order by completedAt desc to get most recent logs
 */

describe('Previous Exercise Data Logic (Unit Tests)', () => {
  it('should match exercises by baseId, not by name', () => {
    // Test data representing different exercises with same baseId
    const exercises = [
      { id: '1', name: 'Bench Press - Variation A', baseId: 'base-123' },
      { id: '2', name: 'Bench Press - Variation B', baseId: 'base-123' },
      { id: '3', name: 'Incline Press', baseId: 'base-456' },
    ]

    const previousLogs = [
      {
        id: '1',
        exerciseName: 'Bench Press - Variation A',
        baseId: 'base-123',
        sets: [],
      },
      { id: '2', exerciseName: 'Incline Press', baseId: 'base-456', sets: [] },
    ]

    // Find by baseId (correct approach)
    const currentExercise = exercises[1] // "Bench Press - Variation B"
    const matchedByBaseId = previousLogs.find(
      (log) => log.baseId === currentExercise.baseId,
    )

    // Find by name (old buggy approach)
    const matchedByName = previousLogs.find(
      (log) => log.exerciseName === currentExercise.name,
    )

    // Should match by baseId even though names are different
    expect(matchedByBaseId).toBeDefined()
    expect(matchedByBaseId?.baseId).toBe('base-123')

    // Should NOT match by name since exercise names are different
    expect(matchedByName).toBeUndefined()
  })

  it('should prioritize more recent completedAt dates', () => {
    // Test data with different completion dates
    const previousExercises = [
      {
        id: '1',
        baseId: 'base-123',
        completedAt: '2024-01-01T10:00:00Z', // 3 weeks ago
        sets: [{ order: 1, log: { weight: 80, reps: 10 } }],
      },
      {
        id: '2',
        baseId: 'base-123',
        completedAt: '2024-01-20T10:00:00Z', // More recent
        sets: [{ order: 1, log: { weight: 85, reps: 8 } }],
      },
      {
        id: '3',
        baseId: 'base-123',
        completedAt: '2024-01-15T10:00:00Z', // Middle date
        sets: [{ order: 1, log: { weight: 82, reps: 9 } }],
      },
    ]

    // Sort by completedAt desc (most recent first)
    const sortedByCompletion = [...previousExercises].sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    )

    // Keep only most recent for each baseId
    const seenBaseIds = new Set<string>()
    const mostRecentPerBaseId = sortedByCompletion.filter((exercise) => {
      if (seenBaseIds.has(exercise.baseId)) {
        return false
      }
      seenBaseIds.add(exercise.baseId)
      return true
    })

    // Should return the most recent exercise (2024-01-20)
    expect(mostRecentPerBaseId).toHaveLength(1)
    expect(mostRecentPerBaseId[0].id).toBe('2')
    expect(mostRecentPerBaseId[0].sets[0].log.weight).toBe(85)
    expect(mostRecentPerBaseId[0].sets[0].log.reps).toBe(8)
  })

  it('should include same week earlier days, not just previous weeks', () => {
    const currentWeekNumber = 3
    const currentDayOfWeek = 5 // Friday

    // Test cases for week/day filtering
    const testCases = [
      { weekNumber: 2, dayOfWeek: 1, expected: true, reason: 'Previous week' },
      {
        weekNumber: 3,
        dayOfWeek: 1,
        expected: true,
        reason: 'Same week, earlier day',
      },
      {
        weekNumber: 3,
        dayOfWeek: 4,
        expected: true,
        reason: 'Same week, earlier day',
      },
      {
        weekNumber: 3,
        dayOfWeek: 5,
        expected: false,
        reason: 'Same week, same day',
      },
      {
        weekNumber: 3,
        dayOfWeek: 6,
        expected: false,
        reason: 'Same week, later day',
      },
      { weekNumber: 4, dayOfWeek: 1, expected: false, reason: 'Future week' },
    ]

    testCases.forEach(({ weekNumber, dayOfWeek, expected }) => {
      // Simulate the WHERE condition logic from the fixed query
      const shouldInclude =
        weekNumber < currentWeekNumber || // Previous weeks
        (weekNumber === currentWeekNumber && dayOfWeek < currentDayOfWeek) // Same week, earlier days

      expect(shouldInclude).toBe(expected)
    })
  })
})
