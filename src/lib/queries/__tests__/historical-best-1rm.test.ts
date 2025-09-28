/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { prisma } from '@/lib/db'

import { getHistoricalBest1RM } from '../historical-best-1rm'

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}))

const mockPrisma = vi.mocked(prisma)

describe('getHistoricalBest1RM', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return historical best 1RM when excluding a specific set', async () => {
    const mockResult = [{ max1rm: 125.5 }]
    mockPrisma.$queryRaw.mockResolvedValue(mockResult)

    const result = await getHistoricalBest1RM({
      baseExerciseId: 'exercise-123',
      userId: 'user-456',
      excludeSetId: 'set-789',
    })

    expect(result).toBe(125.5)
    expect(mockPrisma.$queryRaw).toHaveBeenCalledOnce()

    // Verify correct parameters were passed to the query
    const queryArgs = mockPrisma.$queryRaw.mock.calls[0]
    expect(queryArgs[1]).toBe('exercise-123') // baseExerciseId
    expect(queryArgs[2]).toBe('user-456') // userId
    expect(queryArgs[3]).toBe('set-789') // excludeSetId
  })

  it('should return historical best 1RM when excluding a specific day', async () => {
    const mockResult = [{ max1rm: 110.2 }]
    mockPrisma.$queryRaw.mockResolvedValue(mockResult)

    const result = await getHistoricalBest1RM({
      baseExerciseId: 'exercise-123',
      userId: 'user-456',
      excludeDayId: 'day-789',
    })

    expect(result).toBe(110.2)
    expect(mockPrisma.$queryRaw).toHaveBeenCalledOnce()

    // Verify correct parameters were passed to the query
    const queryArgs = mockPrisma.$queryRaw.mock.calls[0]
    expect(queryArgs[1]).toBe('exercise-123') // baseExerciseId
    expect(queryArgs[2]).toBe('user-456') // userId
    expect(queryArgs[3]).toBe('day-789') // excludeDayId
  })

  it('should return 0 when no historical data exists', async () => {
    const mockResult: { max1rm: number }[] = []
    mockPrisma.$queryRaw.mockResolvedValue(mockResult)

    const result = await getHistoricalBest1RM({
      baseExerciseId: 'exercise-123',
      userId: 'user-456',
      excludeSetId: 'set-789',
    })

    expect(result).toBe(0)
  })

  it('should return 0 when max1rm is null', async () => {
    const mockResult = [{ max1rm: null }]
    mockPrisma.$queryRaw.mockResolvedValue(mockResult)

    const result = await getHistoricalBest1RM({
      baseExerciseId: 'exercise-123',
      userId: 'user-456',
      excludeSetId: 'set-789',
    })

    expect(result).toBe(0)
  })

  it('should include current workout when includingCurrentWorkout is true', async () => {
    const mockResult = [{ max1rm: 120.0 }]
    mockPrisma.$queryRaw.mockResolvedValue(mockResult)

    const result = await getHistoricalBest1RM({
      baseExerciseId: 'exercise-123',
      userId: 'user-456',
      excludeSetId: 'set-789',
      includingCurrentWorkout: true,
    })

    expect(result).toBe(120.0)
    expect(mockPrisma.$queryRaw).toHaveBeenCalledOnce()

    // This should NOT exclude completed workouts (td.completedAt condition should be absent)
    const queryArgs = mockPrisma.$queryRaw.mock.calls[0]
    expect(queryArgs[1]).toBe('exercise-123') // baseExerciseId
    expect(queryArgs[2]).toBe('user-456') // userId
    expect(queryArgs[3]).toBe('set-789') // excludeSetId
  })

  it('should handle query without exclusions', async () => {
    const mockResult = [{ max1rm: 95.0 }]
    mockPrisma.$queryRaw.mockResolvedValue(mockResult)

    const result = await getHistoricalBest1RM({
      baseExerciseId: 'exercise-123',
      userId: 'user-456',
    })

    expect(result).toBe(95.0)
    expect(mockPrisma.$queryRaw).toHaveBeenCalledOnce()

    // Verify correct parameters were passed to the query (no exclusions)
    const queryArgs = mockPrisma.$queryRaw.mock.calls[0]
    expect(queryArgs[1]).toBe('exercise-123') // baseExerciseId
    expect(queryArgs[2]).toBe('user-456') // userId
    expect(queryArgs.length).toBe(3) // Only 3 args (no exclusions)
  })
})
