import { differenceInHours } from 'date-fns'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import {
  DEFAULT_SETS_GOAL_PER_GROUP,
  TRACKED_DISPLAY_GROUPS,
} from '@/config/muscles'
import { authOptions } from '@/lib/auth/config'
import { getTrainingAnalyticsCacheKey } from '@/lib/cache/training-analytics-cache'
import { prisma } from '@/lib/db'
import { openai } from '@/lib/open-ai/open-ai'
import { getFromCache, setInCache } from '@/lib/redis'
import { checkPremiumAccess } from '@/lib/subscription/subscription-validator'

interface MuscleProgressData {
  muscle: string
  completedSets: number
  targetSets: number
  percentage: number
  lastTrained: string | null
  lastSessionSets: number
}

interface WeekSummary {
  totalSets: number
  muscleData: MuscleProgressData[]
}

interface RecoveryItem {
  muscle: string
  hours: number
  targetHours: number
  percentRecovered: number
}

interface TrainingAnalyticsResponse {
  totalSets: number
  trendPercent: number
  strong: string[]
  needsWork: string[]
  insight: string | null
  status: 'empty' | 'normal' | 'crushing_it'
  recovery: RecoveryItem[]
}

// Calculate recovery target based on volume from last session
function getRecoveryTarget(setsInLastSession: number): number {
  if (setsInLastSession <= 4) return 36 // Light: ready in 1.5 days
  if (setsInLastSession <= 8) return 48 // Moderate: ready in 2 days
  return 72 // Heavy: ready in 3 days
}

// AI schema for trend-based insights only
const INSIGHT_SCHEMA = {
  type: 'object',
  properties: {
    insight: {
      type: 'string',
      description:
        'A personalized observation about a notable trend or improvement. Must reference specific comparison to previous weeks. If nothing notable, return empty string. Max 25 words.',
    },
    hasNotableInsight: {
      type: 'boolean',
      description:
        'True only if there is a genuinely interesting trend worth mentioning.',
    },
  },
  required: ['insight', 'hasNotableInsight'],
  additionalProperties: false,
} as const

function buildInsightPrompt(
  currentWeek: WeekSummary,
  previousWeeks: WeekSummary[],
  dayOfWeek: number, // 0 = start of week, 6 = end of week
): string {
  const daysIntoWeek = dayOfWeek + 1

  // Current week muscle breakdown
  const currentMuscles = currentWeek.muscleData
    .filter((m) => m.completedSets > 0)
    .sort((a, b) => b.completedSets - a.completedSets)

  // Calculate average per muscle over previous weeks
  const muscleAverages: Record<string, number> = {}
  previousWeeks.forEach((week) => {
    week.muscleData.forEach((m) => {
      muscleAverages[m.muscle] =
        (muscleAverages[m.muscle] || 0) + m.completedSets
    })
  })
  Object.keys(muscleAverages).forEach((m) => {
    muscleAverages[m] = Math.round(muscleAverages[m] / previousWeeks.length)
  })

  // Find top focus muscle
  const topMuscle = currentMuscles[0]
  const topMuscleVsAvg =
    topMuscle && muscleAverages[topMuscle.muscle]
      ? Math.round(
          ((topMuscle.completedSets - muscleAverages[topMuscle.muscle]) /
            muscleAverages[topMuscle.muscle]) *
            100,
        )
      : 0

  return `Client check-in (day ${daysIntoWeek}):
- ${currentWeek.totalSets} sets done so far
- Main focus: ${topMuscle?.muscle || 'getting started'} (${topMuscle?.completedSets || 0} sets)
${topMuscleVsAvg > 20 ? `- That's ${topMuscleVsAvg}% more ${topMuscle?.muscle} than usual!` : ''}
- Muscles trained: ${currentMuscles.map((m) => m.muscle).join(', ') || 'none yet'}

Say something encouraging and natural, like:
- "Nice leg focus this week - those quads are getting solid work!"
- "Love seeing you hit back early in the week"
- "Good variety so far - you're spreading the work around nicely"

Keep it warm and brief. If they haven't done much yet, just encourage them to get after it.
NEVER mention pace, averages, or that anything is "down" or "behind".`
}

async function getWeeklyMuscleProgress(
  userId: string,
  weekOffset: number = 0,
): Promise<MuscleProgressData[]> {
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { weekStartsOn: true },
  })
  const weekStartsOn = (userProfile?.weekStartsOn ?? 1) as
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6

  const now = new Date()
  const { startOfWeek, endOfWeek, subWeeks } = await import('date-fns')
  const targetWeek = subWeeks(now, weekOffset)
  const weekStart = startOfWeek(targetWeek, { weekStartsOn })
  const weekEnd = endOfWeek(targetWeek, { weekStartsOn })

  const exercises = await prisma.trainingExercise.findMany({
    where: {
      day: {
        scheduledAt: { gte: weekStart, lte: weekEnd },
        week: { plan: { assignedToId: userId } },
      },
      sets: { some: { completedAt: { not: null } } },
    },
    include: {
      base: { include: { muscleGroups: true } },
      sets: { where: { completedAt: { not: null } } },
    },
  })

  const { getMuscleById } = await import('@/config/muscles')
  const muscleProgress: Record<
    string,
    {
      completedSets: number
      lastTrained: Date | null
      lastSessionDate: string | null
      lastSessionSets: number
    }
  > = {}

  TRACKED_DISPLAY_GROUPS.forEach((group) => {
    muscleProgress[group] = {
      completedSets: 0,
      lastTrained: null,
      lastSessionDate: null,
      lastSessionSets: 0,
    }
  })

  // Group exercises by day (scheduledAt date) for tracking last session sets
  exercises.forEach((exercise) => {
    if (!exercise.base) return
    const setCount = exercise.sets.length
    const countedGroups = new Set<string>()

    // Get the day this exercise was scheduled
    const exerciseDate = exercise.sets[0]?.completedAt?.toDateString() || null

    exercise.base.muscleGroups?.forEach((mg) => {
      const staticMuscle = getMuscleById(mg.id)
      const displayGroup = staticMuscle?.displayGroup
      if (
        displayGroup &&
        muscleProgress[displayGroup] &&
        !countedGroups.has(displayGroup)
      ) {
        muscleProgress[displayGroup].completedSets += setCount
        countedGroups.add(displayGroup)

        // Track the most recent training date and update lastSessionSets
        exercise.sets.forEach((set) => {
          if (set.completedAt) {
            const setDate = set.completedAt.toDateString()

            if (
              !muscleProgress[displayGroup].lastTrained ||
              set.completedAt > muscleProgress[displayGroup].lastTrained!
            ) {
              // New most recent date - check if same day or new day
              if (muscleProgress[displayGroup].lastSessionDate !== setDate) {
                // New day - reset session counter
                muscleProgress[displayGroup].lastSessionDate = setDate
                muscleProgress[displayGroup].lastSessionSets = setCount
              }
              muscleProgress[displayGroup].lastTrained = set.completedAt
            } else if (
              muscleProgress[displayGroup].lastSessionDate === setDate
            ) {
              // Same day as last session - add to counter (but avoid double counting)
              // This is handled by countedGroups check above
            }
          }
        })

        // If this exercise is on the same day as lastSessionDate, add its sets
        if (
          exerciseDate &&
          muscleProgress[displayGroup].lastSessionDate === exerciseDate &&
          muscleProgress[displayGroup].lastSessionSets < setCount
        ) {
          // Already counted in the first encounter, but need to track cumulative for the day
        }
      }
    })
  })

  // Second pass: calculate total sets for the last session day per muscle
  const lastSessionSetsByMuscle: Record<string, number> = {}
  TRACKED_DISPLAY_GROUPS.forEach((group) => {
    lastSessionSetsByMuscle[group] = 0
  })

  exercises.forEach((exercise) => {
    if (!exercise.base) return
    const setCount = exercise.sets.length
    const countedGroups = new Set<string>()

    exercise.base.muscleGroups?.forEach((mg) => {
      const staticMuscle = getMuscleById(mg.id)
      const displayGroup = staticMuscle?.displayGroup
      if (
        displayGroup &&
        muscleProgress[displayGroup] &&
        !countedGroups.has(displayGroup)
      ) {
        const lastSessionDate = muscleProgress[displayGroup].lastSessionDate
        const exerciseDate = exercise.sets[0]?.completedAt?.toDateString()

        if (lastSessionDate && exerciseDate === lastSessionDate) {
          lastSessionSetsByMuscle[displayGroup] += setCount
        }
        countedGroups.add(displayGroup)
      }
    })
  })

  return TRACKED_DISPLAY_GROUPS.map((group) => ({
    muscle: group,
    completedSets: Math.floor(muscleProgress[group].completedSets),
    targetSets: DEFAULT_SETS_GOAL_PER_GROUP,
    percentage: Math.min(
      100,
      Math.round(
        (muscleProgress[group].completedSets / DEFAULT_SETS_GOAL_PER_GROUP) *
          100,
      ),
    ),
    lastTrained: muscleProgress[group].lastTrained?.toISOString() || null,
    lastSessionSets: lastSessionSetsByMuscle[group],
  }))
}

// Simple calculations - no AI needed
function calculateStrongAndNeedsWork(
  muscleData: MuscleProgressData[],
  recovery: RecoveryItem[],
): { strong: string[]; needsWork: string[] } {
  const recoveryMap = new Map(
    recovery.map((r) => [r.muscle, r.percentRecovered]),
  )

  // Strong: >= 80% of target
  const strong = muscleData
    .filter((m) => m.percentage >= 80)
    .map((m) => m.muscle)
    .slice(0, 3)

  // Needs work: < 50% of target AND fully recovered (100% percentRecovered)
  const needsWork = muscleData
    .filter((m) => {
      const percentRecovered = recoveryMap.get(m.muscle) ?? 100
      return m.percentage < 50 && percentRecovered >= 100
    })
    .map((m) => m.muscle)
    .slice(0, 4)

  return { strong, needsWork }
}

const CACHE_TTL = 24 * 60 * 60 // 24 hours

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Check premium access
    const hasPremium = await checkPremiumAccess(userId)
    if (!hasPremium) {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 },
      )
    }

    // Check Redis cache first
    const cacheKey = getTrainingAnalyticsCacheKey(userId)
    const cached = await getFromCache<TrainingAnalyticsResponse>(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    // Get current week's data
    const currentWeekData = await getWeeklyMuscleProgress(userId, 0)

    // Get previous 3 weeks for trend calculation
    const [week1Data, week2Data, week3Data] = await Promise.all([
      getWeeklyMuscleProgress(userId, 1),
      getWeeklyMuscleProgress(userId, 2),
      getWeeklyMuscleProgress(userId, 3),
    ])

    // Calculate total sets
    const totalSets = currentWeekData.reduce(
      (sum, m) => sum + m.completedSets,
      0,
    )

    // Calculate monthly average for trend
    const prevWeekTotals = [week1Data, week2Data, week3Data].map((week) =>
      week.reduce((sum, m) => sum + m.completedSets, 0),
    )
    const weeksWithData = prevWeekTotals.filter((t) => t > 0).length
    const monthlyAverage =
      weeksWithData > 0
        ? prevWeekTotals.reduce((a, b) => a + b, 0) / weeksWithData
        : 0

    // Calculate trend, capped at ±200%
    let trendPercent = 0
    if (monthlyAverage >= 10) {
      trendPercent = Math.round(
        ((totalSets - monthlyAverage) / monthlyAverage) * 100,
      )
      // Cap trends - don't show overly negative for incomplete weeks
      // Positive trends are encouraging, negative trends are discouraging during partial week
      trendPercent = Math.max(-50, Math.min(200, trendPercent))
    }

    // Calculate recovery with volume-based targets
    const now = new Date()
    const recovery: RecoveryItem[] = currentWeekData.map((m) => {
      const hours = m.lastTrained
        ? differenceInHours(now, new Date(m.lastTrained))
        : 168 // Not trained this week = fully recovered

      // Recovery target based on sets done in last session
      const targetHours =
        m.lastSessionSets > 0 ? getRecoveryTarget(m.lastSessionSets) : 72 // Default to 72h if no session data

      const percentRecovered = Math.min(
        100,
        Math.round((hours / targetHours) * 100),
      )

      return {
        muscle: m.muscle,
        hours,
        targetHours,
        percentRecovered,
      }
    })
    // Sort: most recently trained first (lowest hours), then ready muscles
    recovery.sort((a, b) => a.hours - b.hours)

    // Simple calculations for Strong/Needs Work (no AI)
    const { strong, needsWork } = calculateStrongAndNeedsWork(
      currentWeekData,
      recovery,
    )

    // Determine status
    let status: 'empty' | 'normal' | 'crushing_it' = 'normal'
    if (totalSets === 0) {
      status = 'empty'
    } else if (strong.length >= 5 || (totalSets >= 60 && strong.length >= 3)) {
      status = 'crushing_it'
    }

    // AI insight - only when there's enough historical data for meaningful trends
    let insight: string | null = null
    const hasHistoricalData = weeksWithData >= 2
    const hasMeaningfulActivity = totalSets >= 10

    if (hasHistoricalData && hasMeaningfulActivity) {
      try {
        // Calculate day of week (0 = start of week, 6 = end of week)
        const userProfile = await prisma.userProfile.findUnique({
          where: { userId },
          select: { weekStartsOn: true },
        })
        const weekStartsOn = (userProfile?.weekStartsOn ?? 1) as
          | 0
          | 1
          | 2
          | 3
          | 4
          | 5
          | 6
        const { startOfWeek, differenceInDays } = await import('date-fns')
        // Calculate days since week started (0-6)
        const weekStart = startOfWeek(now, { weekStartsOn })
        const dayOfWeek = differenceInDays(now, weekStart)

        const currentWeekSummary: WeekSummary = {
          totalSets,
          muscleData: currentWeekData,
        }
        const previousWeeks: WeekSummary[] = [
          { totalSets: prevWeekTotals[0], muscleData: week1Data },
          { totalSets: prevWeekTotals[1], muscleData: week2Data },
          { totalSets: prevWeekTotals[2], muscleData: week3Data },
        ]

        const response = await openai.chat.completions.create({
          model: 'gpt-4.1-mini',
          temperature: 1.5,
          messages: [
            {
              role: 'system',
              content:
                'You are a supportive personal trainer checking in with your client. Be warm, encouraging, and natural. Notice what they are doing well. Never point out negatives or that they are behind. Keep it short (1-2 sentences max). If nothing positive stands out, return empty.',
            },
            {
              role: 'user',
              content: buildInsightPrompt(
                currentWeekSummary,
                previousWeeks,
                dayOfWeek,
              ),
            },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'training_insight',
              strict: true,
              schema: INSIGHT_SCHEMA,
            },
          },
        })

        const aiResult = JSON.parse(
          response.choices[0]?.message?.content || '{}',
        )
        if (aiResult.hasNotableInsight && aiResult.insight) {
          insight = aiResult.insight
        }
      } catch (error) {
        console.error('AI insight generation failed:', error)
        // Continue without insight - not critical
      }
    }

    const result: TrainingAnalyticsResponse = {
      totalSets,
      trendPercent,
      strong,
      needsWork,
      insight,
      status,
      recovery,
    }

    console.log('result', result)
    // Cache the result
    await setInCache(cacheKey, result, CACHE_TTL)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to generate training analytics:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate analytics',
      },
      { status: 500 },
    )
  }
}
