'use server'

import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/lib/auth/config'
import {
  ServerEvent,
  captureServerEvent,
  captureServerException,
} from '@/lib/posthog-server'
import { checkPremiumAccess } from '@/lib/subscription/subscription-validator'

import { getExercisesForMuscles } from './lib/exercise-pool'
import {
  getFocusDisplayGroups,
  getHabitBiasStartOfWeek,
  getWeeklyMuscleProgress,
  selectMusclesToQuery,
} from './lib/muscle-selection'
import { generateAiSuggestions } from './lib/openai-suggestions'

export async function POST(request: NextRequest) {
  const debugAi =
    process.env.DEBUG_AI_EXERCISE_SUGGESTIONS === 'true' ||
    process.env.NODE_ENV !== 'production'
  const debugId =
    typeof crypto?.randomUUID === 'function'
      ? crypto.randomUUID()
      : String(Date.now())
  let distinctId: string | undefined
  let workoutType: string | undefined

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    distinctId = userId
    if (debugAi) {
      console.info('[ai-exercise-suggestions]', {
        debugId,
        step: 'start',
        userId: `${userId.slice(0, 6)}…`,
      })
    }

    const hasPremium = await checkPremiumAccess(userId)
    if (!hasPremium && process.env.ENABLE_ALL_FEATURES !== 'true') {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 },
      )
    }

    let workoutType: string | undefined
    let rawBody: unknown = undefined
    try {
      const body = await request.json()
      rawBody = body
      workoutType = (body as { workoutType?: string }).workoutType
    } catch {
      // No body or invalid JSON - that's fine
    }

    if (debugAi) {
      console.info('[ai-exercise-suggestions]', {
        debugId,
        step: 'request',
        body: rawBody,
        workoutType,
      })
    }

    const muscleProgress = await getWeeklyMuscleProgress(userId)
    const focusDisplayGroups = getFocusDisplayGroups(workoutType)
    const habitBias = await getHabitBiasStartOfWeek(userId)

    const { targetMuscles, musclesToQuery } = selectMusclesToQuery({
      muscleProgress,
      focusDisplayGroups,
      habitBias,
    })

    if (debugAi) {
      console.info('[ai-exercise-suggestions]', {
        debugId,
        step: 'signals',
        focusDisplayGroups,
        targetMuscles,
        musclesToQuery,
        habitBias: Array.from(habitBias.entries()).sort((a, b) => b[1] - a[1]),
        muscleProgress: muscleProgress.map((m) => ({
          muscle: m.muscle,
          completedSets: m.completedSets,
          targetSets: m.targetSets,
          percentRecovered: m.percentRecovered,
          lastSessionSets: m.lastSessionSets,
        })),
      })
    }

    const availableExercises = await getExercisesForMuscles(musclesToQuery)
    if (debugAi) {
      console.info('[ai-exercise-suggestions]', {
        debugId,
        step: 'exercise-pool',
        availableExercisesCount: availableExercises.length,
        sampleExercises: availableExercises.slice(0, 6).map((e) => ({
          id: e.id,
          name: e.name,
          muscleGroup: e.muscleGroup,
          primaryDisplayGroups: e.primaryDisplayGroups,
          secondaryDisplayGroups: e.secondaryDisplayGroups,
        })),
      })
    }

    if (availableExercises.length === 0) {
      return NextResponse.json({
        suggestions: [],
        context: 'No exercises found for your target muscles.',
      })
    }

    const ai = await generateAiSuggestions({
      muscleProgress,
      availableExercises,
      workoutType,
    })

    captureServerEvent({
      distinctId: userId,
      event: ServerEvent.AI_EXERCISE_SUGGESTIONS_SUCCESS,
      properties: {
        debugId,
        workoutType: workoutType ?? null,
        model: ai.debug.model,
        promptTokens: ai.debug.usage.promptTokens,
        cachedPromptTokens: ai.debug.usage.cachedPromptTokens,
        completionTokens: ai.debug.usage.completionTokens,
        totalTokens: ai.debug.usage.totalTokens,
        estimatedCostUsd:
          'estimatedCostUsd' in ai.debug.cost
            ? ai.debug.cost.estimatedCostUsd
            : null,
        suggestionsCount: ai.suggestions.length,
        focusDisplayGroups,
        targetMuscles,
        musclesToQuery,
      },
    })

    if (debugAi) {
      console.info('[ai-exercise-suggestions]', {
        debugId,
        step: 'prompt',
        model: ai.debug.model,
        systemPromptLength: ai.debug.systemPrompt.length,
        userPromptLength: ai.debug.userPrompt.length,
        userPromptSnippet: ai.debug.userPromptSnippet,
      })
      console.info('[ai-exercise-suggestions]', {
        debugId,
        step: 'usage',
        model: ai.debug.model,
        usage: ai.debug.usage,
        cost: ai.debug.cost,
      })
      console.info('[ai-exercise-suggestions]', {
        debugId,
        step: 'raw-ai',
        content: ai.debug.rawAiContent,
      })
      console.info('[ai-exercise-suggestions]', {
        debugId,
        step: 'response',
        result: { suggestions: ai.suggestions, context: ai.context },
      })
    }

    return NextResponse.json({
      suggestions: ai.suggestions,
      context: ai.context,
    })
  } catch (error) {
    console.error('Failed to generate exercise suggestions:', error)

    const err = error instanceof Error ? error : new Error('Unknown error')

    captureServerException(err, distinctId, {
      debugId,
      route: '/api/ai/exercise-suggestions',
      workoutType: workoutType ?? null,
    })

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
