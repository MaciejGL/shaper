import { openai } from '@/lib/open-ai/open-ai'

import {
  SUGGESTIONS_SCHEMA,
  buildSystemPrompt,
  buildUserPrompt,
} from './prompts'
import type {
  AiOrderedSuggestion,
  ExerciseForSelection,
  ExerciseSuggestion,
  ExerciseSuggestionRole,
  MuscleProgressData,
} from './types'

function getEnvKeyForModel(model: string): string {
  return model.toUpperCase().replace(/[^A-Z0-9]+/g, '_')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function getCachedPromptTokensFromUsage(usage: unknown): number {
  if (!isRecord(usage)) return 0
  const details = usage.prompt_tokens_details
  if (!isRecord(details)) return 0
  const cached = details.cached_tokens
  return typeof cached === 'number' && Number.isFinite(cached) ? cached : 0
}

function getModelPricingUsdPer1M(model: string): {
  inputUsdPer1M: number
  cachedInputUsdPer1M: number | null
  outputUsdPer1M: number
} | null {
  const key = getEnvKeyForModel(model)
  const inputRaw = process.env[`OPENAI_${key}_INPUT_USD_PER_1M`]
  const cachedInputRaw = process.env[`OPENAI_${key}_CACHED_INPUT_USD_PER_1M`]
  const outputRaw = process.env[`OPENAI_${key}_OUTPUT_USD_PER_1M`]

  const inputUsdPer1M = inputRaw ? Number(inputRaw) : NaN
  const cachedInputUsdPer1M = cachedInputRaw ? Number(cachedInputRaw) : NaN
  const outputUsdPer1M = outputRaw ? Number(outputRaw) : NaN

  // Default pricing for debugging. Env vars override defaults.
  if (!Number.isFinite(inputUsdPer1M) || !Number.isFinite(outputUsdPer1M)) {
    if (model === 'gpt-4.1-mini') {
      return {
        inputUsdPer1M: 0.4,
        cachedInputUsdPer1M: 0.1,
        outputUsdPer1M: 1.6,
      }
    }
    return null
  }

  return {
    inputUsdPer1M,
    cachedInputUsdPer1M: Number.isFinite(cachedInputUsdPer1M)
      ? cachedInputUsdPer1M
      : null,
    outputUsdPer1M,
  }
}

function estimateOpenAiCostUsd(params: {
  model: string
  promptTokens: number
  cachedPromptTokens: number
  completionTokens: number
}): {
  estimatedCostUsd: number
  pricing: {
    inputUsdPer1M: number
    cachedInputUsdPer1M: number | null
    outputUsdPer1M: number
  }
} | null {
  const pricing = getModelPricingUsdPer1M(params.model)
  if (!pricing) return null

  const cachedPromptTokens = Math.max(0, params.cachedPromptTokens)
  const nonCachedPromptTokens = Math.max(
    0,
    params.promptTokens - cachedPromptTokens,
  )
  const cachedInputUsdPer1M =
    pricing.cachedInputUsdPer1M ?? pricing.inputUsdPer1M

  const estimatedCostUsd =
    (nonCachedPromptTokens / 1_000_000) * pricing.inputUsdPer1M +
    (cachedPromptTokens / 1_000_000) * cachedInputUsdPer1M +
    (params.completionTokens / 1_000_000) * pricing.outputUsdPer1M

  return { estimatedCostUsd, pricing }
}

function isValidRole(role: string): role is ExerciseSuggestionRole {
  return (
    role === 'activation' ||
    role === 'primary_compound' ||
    role === 'secondary_compound' ||
    role === 'accessory' ||
    role === 'isolation'
  )
}

function parseAndEnforceOrdering(params: {
  aiOrdered: unknown
  availableExercises: ExerciseForSelection[]
}): ExerciseSuggestion[] {
  const exerciseMap = new Map(params.availableExercises.map((e) => [e.id, e]))

  const rolePriority: Record<ExerciseSuggestionRole, number> = {
    activation: 0,
    primary_compound: 1,
    secondary_compound: 2,
    accessory: 3,
    isolation: 4,
  }

  const orderedSuggestions: unknown[] = Array.isArray(params.aiOrdered)
    ? params.aiOrdered
    : []

  const seen = new Set<string>()
  const filtered = orderedSuggestions
    .map((s, index) => ({ s, index }))
    .filter((item): item is { s: AiOrderedSuggestion; index: number } => {
      if (!item.s || typeof item.s !== 'object') return false
      const exerciseId = (item.s as { exerciseId?: unknown }).exerciseId
      const role = (item.s as { role?: unknown }).role

      if (typeof exerciseId !== 'string') return false
      if (typeof role !== 'string' || !isValidRole(role)) return false
      if (!exerciseMap.has(exerciseId)) return false
      if (seen.has(exerciseId)) return false
      seen.add(exerciseId)
      return true
    })
    .sort((a, b) => {
      const aRole = a.s.role
      const bRole = b.s.role
      const aP = rolePriority[aRole]
      const bP = rolePriority[bRole]
      if (aP !== bP) return aP - bP
      return a.index - b.index
    })

  return filtered.map(({ s }) => {
    const exercise = exerciseMap.get(s.exerciseId)!
    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      role: s.role,
    }
  })
}

export interface GenerateAiSuggestionsDebugInfo {
  model: string
  systemPrompt: string
  userPrompt: string
  userPromptSnippet: string
  rawAiContent: string
  usage: {
    promptTokens: number
    cachedPromptTokens: number
    completionTokens: number
    totalTokens: number
  }
  cost:
    | {
        pricingUsdPer1M: {
          inputUsdPer1M: number
          cachedInputUsdPer1M: number | null
          outputUsdPer1M: number
        }
        estimatedCostUsd: number
      }
    | {
        pricingHint: string
        estimatedCostUsd: null
      }
}

export async function generateAiSuggestions(params: {
  muscleProgress: MuscleProgressData[]
  availableExercises: ExerciseForSelection[]
  workoutType?: string
}): Promise<{
  suggestions: ExerciseSuggestion[]
  context: string
  debug: GenerateAiSuggestionsDebugInfo
}> {
  const buildSignalContext = (): string => {
    const needsWork = params.muscleProgress
      .filter((m) => m.targetSets > 0 && m.completedSets < m.targetSets * 0.5)
      .sort(
        (a, b) =>
          a.completedSets / a.targetSets - b.completedSets / b.targetSets,
      )
      .map((m) => m.muscle)

    const recovered = params.muscleProgress
      .filter((m) => m.percentRecovered >= 100)
      .sort((a, b) => b.percentRecovered - a.percentRecovered)
      .map((m) => m.muscle)

    const topNeed = needsWork.slice(0, 2)
    const topRecovered = recovered.slice(0, 2)

    const joinTwo = (items: string[]) =>
      items.length === 2 ? `${items[0]} and ${items[1]}` : items[0] ?? ''

    if (topNeed.length > 0 && topRecovered.length > 0) {
      return `Focus today: add volume for ${joinTwo(topNeed)} while ${joinTwo(
        topRecovered,
      )} is fresh.`
    }

    if (topNeed.length > 0) {
      return `Focus today: add volume for ${joinTwo(topNeed)} to balance your week.`
    }

    if (topRecovered.length > 0) {
      return `Good day to train ${joinTwo(topRecovered)}—it fits your recovery this week.`
    }

    return 'Solid picks that fit today and keep your week balanced.'
  }

  const normalizeContext = (value: unknown): string => {
    const signalContext = buildSignalContext()
    const raw =
      typeof value === 'string' ? value : signalContext

    const trimmed = raw.trim().replace(/\s+/g, ' ')
    if (!trimmed) return signalContext

    const endsWithSentencePunctuation = /[.!?]$/.test(trimmed)
    return endsWithSentencePunctuation ? trimmed : `${trimmed}.`
  }

  const model = 'gpt-4.1-mini'
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt({
    muscleProgress: params.muscleProgress,
    exercises: params.availableExercises,
    workoutType: params.workoutType,
  })

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
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

  const rawAiContent = response.choices[0]?.message?.content || '{}'
  const aiResult = JSON.parse(rawAiContent) as {
    orderedSuggestions?: unknown
    context?: unknown
  }

  const promptTokens = response.usage?.prompt_tokens ?? 0
  const completionTokens = response.usage?.completion_tokens ?? 0
  const totalTokens =
    response.usage?.total_tokens ?? promptTokens + completionTokens
  const cachedPromptTokens = getCachedPromptTokensFromUsage(response.usage)

  const costEstimate = estimateOpenAiCostUsd({
    model,
    promptTokens,
    cachedPromptTokens,
    completionTokens,
  })

  const suggestions = parseAndEnforceOrdering({
    aiOrdered: aiResult.orderedSuggestions,
    availableExercises: params.availableExercises,
  })

  const signalContext = buildSignalContext()
  const aiContext = normalizeContext(aiResult.context)
  const shouldPreferAiContext =
    signalContext === 'Solid picks that fit today and keep your week balanced.' ||
    (() => {
      const topMuscles = params.muscleProgress
        .map((m) => m.muscle)
        .filter((m) => m && m.length > 1)
        .slice(0, 12)

      const aiLower = aiContext.toLowerCase()
      return topMuscles.some((m) => aiLower.includes(m.toLowerCase()))
    })()

  const envKey = getEnvKeyForModel(model)
  const cost: GenerateAiSuggestionsDebugInfo['cost'] = costEstimate
    ? {
        pricingUsdPer1M: costEstimate.pricing,
        estimatedCostUsd: Number(costEstimate.estimatedCostUsd.toFixed(6)),
      }
    : {
        estimatedCostUsd: null,
        pricingHint: `Set OPENAI_${envKey}_INPUT_USD_PER_1M, OPENAI_${envKey}_CACHED_INPUT_USD_PER_1M, OPENAI_${envKey}_OUTPUT_USD_PER_1M to enable cost estimation.`,
      }

  return {
    suggestions,
    context: shouldPreferAiContext ? aiContext : signalContext,
    debug: {
      model,
      systemPrompt,
      userPrompt,
      userPromptSnippet: userPrompt.slice(0, 2000),
      rawAiContent,
      usage: {
        promptTokens,
        cachedPromptTokens,
        completionTokens,
        totalTokens,
      },
      cost,
    },
  }
}
