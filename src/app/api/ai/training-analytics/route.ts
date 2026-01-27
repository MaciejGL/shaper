import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { checkPremiumAccess } from '@/lib/subscription/subscription-validator'

import { getWeeklyMuscleProgress } from './lib/get-weekly-muscle-progress'
import { buildRecovery, getRecentRecoveryInputs } from './lib/recovery'
import {
  calculateStrongAndNeedsWork,
  calculateTrendPercent,
} from './lib/scoring'
import type { TrainingAnalyticsResponse } from './lib/types'

const LOOKBACK_DAYS = 4
const RECOVERY_DAY_WEIGHTS = [1.0, 0.6, 0.35, 0.2] as const

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Check premium access
    const hasPremium = await checkPremiumAccess(userId)
    if (!hasPremium && process.env.ENABLE_ALL_FEATURES !== 'true') {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 },
      )
    }

    const currentWeekData = await getWeeklyMuscleProgress({
      prisma,
      userId,
      weekOffset: 0,
    })

    // Get previous 3 weeks for trend calculation
    const [week1Data, week2Data, week3Data] = await Promise.all([
      getWeeklyMuscleProgress({ prisma, userId, weekOffset: 1 }),
      getWeeklyMuscleProgress({ prisma, userId, weekOffset: 2 }),
      getWeeklyMuscleProgress({ prisma, userId, weekOffset: 3 }),
    ])

    // Calculate total sets
    const totalSets = currentWeekData.reduce(
      (sum, m) => sum + m.completedSets,
      0,
    )

    const prevWeekTotals = [week1Data, week2Data, week3Data].map((week) =>
      week.reduce((sum, m) => sum + m.completedSets, 0),
    )
    const trendPercent = calculateTrendPercent({
      currentTotalSets: totalSets,
      previousWeekTotals: prevWeekTotals,
    })

    const now = new Date()
    const recentInputs = await getRecentRecoveryInputs({
      prisma,
      userId,
      lookbackDays: LOOKBACK_DAYS,
      dayWeights: RECOVERY_DAY_WEIGHTS,
      now,
    })
    const recovery = buildRecovery({ now, recentInputs })

    const { strong, needsWork } = calculateStrongAndNeedsWork({
      muscleData: currentWeekData,
      recovery,
    })

    // Determine status
    let status: 'empty' | 'normal' | 'crushing_it' = 'normal'
    if (totalSets === 0) {
      status = 'empty'
    } else if (strong.length >= 5 || (totalSets >= 60 && strong.length >= 3)) {
      status = 'crushing_it'
    }

    // AI insight - only when there's enough historical data for meaningful trends
    // let insight: string | null = null
    // const hasHistoricalData = weeksWithData >= 2
    // const hasMeaningfulActivity = totalSets >= 10

    // if (hasHistoricalData && hasMeaningfulActivity) {
    //   try {
    //     // Calculate day of week (0 = start of week, 6 = end of week)
    //     const userProfile = await prisma.userProfile.findUnique({
    //       where: { userId },
    //       select: { weekStartsOn: true },
    //     })
    //     const weekStartsOn = (userProfile?.weekStartsOn ?? 1) as
    //       | 0
    //       | 1
    //       | 2
    //       | 3
    //       | 4
    //       | 5
    //       | 6
    //     const { startOfWeek, differenceInDays } = await import('date-fns')
    //     // Calculate days since week started (0-6)
    //     const weekStart = startOfWeek(now, { weekStartsOn })
    //     const dayOfWeek = differenceInDays(now, weekStart)

    //     const currentWeekSummary: WeekSummary = {
    //       totalSets,
    //       muscleData: currentWeekData,
    //     }
    //     const previousWeeks: WeekSummary[] = [
    //       { totalSets: prevWeekTotals[0], muscleData: week1Data },
    //       { totalSets: prevWeekTotals[1], muscleData: week2Data },
    //       { totalSets: prevWeekTotals[2], muscleData: week3Data },
    //     ]

    //     const response = await openai.chat.completions.create({
    //       model: 'gpt-4.1-mini',
    //       temperature: 1.5,
    //       messages: [
    //         {
    //           role: 'system',
    //           content:
    //             'You are a supportive personal trainer checking in with your client. Be warm, encouraging, and natural. Notice what they are doing well. Never point out negatives or that they are behind. Keep it short (1-2 sentences max). If nothing positive stands out, return empty.',
    //         },
    //         {
    //           role: 'user',
    //           content: buildInsightPrompt(
    //             currentWeekSummary,
    //             previousWeeks,
    //             dayOfWeek,
    //           ),
    //         },
    //       ],
    //       response_format: {
    //         type: 'json_schema',
    //         json_schema: {
    //           name: 'training_insight',
    //           strict: true,
    //           schema: INSIGHT_SCHEMA,
    //         },
    //       },
    //     })

    //     const aiResult = JSON.parse(
    //       response.choices[0]?.message?.content || '{}',
    //     )
    //     if (aiResult.hasNotableInsight && aiResult.insight) {
    //       insight = aiResult.insight
    //     }
    //   } catch (error) {
    //     console.error('AI insight generation failed:', error)
    //     // Continue without insight - not critical
    //   }
    // }

    const result: TrainingAnalyticsResponse = {
      totalSets,
      trendPercent,
      strong,
      needsWork,
      insight: '',
      status,
      recovery,
    }

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
