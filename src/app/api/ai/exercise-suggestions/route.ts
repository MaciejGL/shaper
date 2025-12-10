import { differenceInDays, endOfWeek, startOfWeek } from 'date-fns'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import {
  DEFAULT_SETS_GOAL_PER_GROUP,
  DISPLAY_GROUP_MUSCLE_IDS,
  TRACKED_DISPLAY_GROUPS,
  getMuscleById,
} from '@/config/muscles'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/db'
import { getExerciseVersionWhereClause } from '@/lib/exercise-version-filter'
import { openai } from '@/lib/open-ai/open-ai'
import { checkPremiumAccess } from '@/lib/subscription/subscription-validator'

interface ExerciseSuggestion {
  exerciseId: string
  exerciseName: string
  muscleGroup: string
}

interface SuggestionsResponse {
  suggestions: ExerciseSuggestion[]
  context: string
}

interface MuscleProgressData {
  muscle: string
  completedSets: number
  targetSets: number
  daysSinceTrained: number
}

interface ExerciseForSelection {
  id: string
  name: string
  muscleGroup: string
}

const SUGGESTIONS_SCHEMA = {
  type: 'object',
  properties: {
    selectedExerciseIds: {
      type: 'array',
      description:
        'Array of 4-6 exercise IDs to suggest, prioritizing undertrained and recovered muscles',
      items: { type: 'string' },
      minItems: 4,
      maxItems: 6,
    },
    context: {
      type: 'string',
      description: 'Short context explaining the suggestions (max 15 words)',
    },
  },
  required: ['selectedExerciseIds', 'context'],
  additionalProperties: false,
} as const

function buildSystemPrompt(): string {
  return `You are a fitness coach suggesting exercises for a user's workout.

Your task is to select 4-6 exercises from the provided list based on:
1. Muscles that need more volume this week (below target sets)
2. Muscles that are recovered (3+ days since last trained)
3. Variety - don't suggest similar exercises

Return exercise IDs EXACTLY as provided. Keep the context very short (max 15 words).`
}

function buildUserPrompt(
  muscleProgress: MuscleProgressData[],
  exercises: ExerciseForSelection[],
  workoutType?: string,
): string {
  const needsWork = muscleProgress
    .filter((m) => m.completedSets < m.targetSets * 0.5)
    .map(
      (m) =>
        `${m.muscle}: ${m.completedSets}/${m.targetSets} sets, ${m.daysSinceTrained}d recovery`,
    )
    .join('\n')

  const recovered = muscleProgress
    .filter((m) => m.daysSinceTrained >= 3)
    .map((m) => `${m.muscle}: ${m.daysSinceTrained} days since trained`)
    .join('\n')

  const exerciseList = exercises
    .map((e) => `[${e.id}] ${e.name} (${e.muscleGroup})`)
    .join('\n')

  return `${workoutType ? `Workout type: ${workoutType}\n\n` : ''}Muscles needing volume:
${needsWork || 'All muscles on track'}

Recovered muscles (ready to train):
${recovered || 'All muscles recently trained'}

Available exercises:
${exerciseList}

Select 4-6 exercises that would best complement this user's week.`
}

async function getWeeklyMuscleProgress(
  userId: string,
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
  const weekStart = startOfWeek(now, { weekStartsOn })
  const weekEnd = endOfWeek(now, { weekStartsOn })

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

  const muscleProgress: Record<
    string,
    { completedSets: number; lastTrained: Date | null }
  > = {}

  TRACKED_DISPLAY_GROUPS.forEach((group) => {
    muscleProgress[group] = { completedSets: 0, lastTrained: null }
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
        muscleProgress[displayGroup].completedSets += setCount
        countedGroups.add(displayGroup)

        exercise.sets.forEach((set) => {
          if (
            set.completedAt &&
            (!muscleProgress[displayGroup].lastTrained ||
              set.completedAt > muscleProgress[displayGroup].lastTrained!)
          ) {
            muscleProgress[displayGroup].lastTrained = set.completedAt
          }
        })
      }
    })
  })

  return TRACKED_DISPLAY_GROUPS.map((group) => ({
    muscle: group,
    completedSets: Math.floor(muscleProgress[group].completedSets),
    targetSets: DEFAULT_SETS_GOAL_PER_GROUP,
    daysSinceTrained: muscleProgress[group].lastTrained
      ? differenceInDays(now, muscleProgress[group].lastTrained)
      : 14, // If never trained, treat as fully recovered
  }))
}

async function getExercisesForMuscles(
  muscleGroups: string[],
): Promise<ExerciseForSelection[]> {
  // Get muscle IDs for the target display groups
  const muscleIds: string[] = []
  muscleGroups.forEach((group) => {
    const ids = DISPLAY_GROUP_MUSCLE_IDS[group]
    if (ids) muscleIds.push(...ids)
  })

  if (muscleIds.length === 0) return []

  const exercises = await prisma.baseExercise.findMany({
    where: {
      isPublic: true,
      ...getExerciseVersionWhereClause(),
      muscleGroups: {
        some: { id: { in: muscleIds } },
      },
    },
    include: {
      muscleGroups: true,
    },
    take: 50, // Limit to prevent huge prompts
  })

  return exercises.map((e) => ({
    id: e.id,
    name: e.name,
    muscleGroup: e.muscleGroups[0]
      ? getMuscleById(e.muscleGroups[0].id)?.displayGroup || 'Unknown'
      : 'Unknown',
  }))
}

export async function POST(request: NextRequest) {
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

    // Parse optional workoutType from body
    let workoutType: string | undefined
    try {
      const body = await request.json()
      workoutType = body.workoutType
    } catch {
      // No body or invalid JSON - that's fine
    }

    // Get muscle progress
    const muscleProgress = await getWeeklyMuscleProgress(userId)

    // Identify muscles that need work (below 50% target) or are recovered (3+ days)
    const targetMuscles = muscleProgress
      .filter(
        (m) => m.completedSets < m.targetSets * 0.5 || m.daysSinceTrained >= 3,
      )
      .map((m) => m.muscle)
      .slice(0, 6) // Limit to top 6 priority muscles

    // Fallback to all tracked groups if no priority muscles
    const musclesToQuery =
      targetMuscles.length > 0
        ? targetMuscles
        : TRACKED_DISPLAY_GROUPS.slice(0, 4)

    // Get exercises for target muscles
    const availableExercises = await getExercisesForMuscles(
      musclesToQuery as string[],
    )

    if (availableExercises.length === 0) {
      return NextResponse.json({
        suggestions: [],
        context: 'No exercises found for your target muscles.',
      })
    }

    // Use AI to select best exercises
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        {
          role: 'user',
          content: buildUserPrompt(
            muscleProgress,
            availableExercises,
            workoutType,
          ),
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'exercise_suggestions',
          strict: true,
          schema: SUGGESTIONS_SCHEMA,
        },
      },
    })

    const aiResult = JSON.parse(response.choices[0]?.message?.content || '{}')

    // Map selected IDs to full exercise data
    const exerciseMap = new Map(availableExercises.map((e) => [e.id, e]))
    const suggestions: ExerciseSuggestion[] = (
      aiResult.selectedExerciseIds || []
    )
      .filter((id: string) => exerciseMap.has(id))
      .map((id: string) => {
        const exercise = exerciseMap.get(id)!
        return {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          muscleGroup: exercise.muscleGroup,
        }
      })

    const result: SuggestionsResponse = {
      suggestions,
      context: aiResult.context || 'Based on your week so far:',
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to generate exercise suggestions:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate suggestions',
      },
      { status: 500 },
    )
  }
}
