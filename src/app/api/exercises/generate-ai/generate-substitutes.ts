import { MUSCLES } from '@/constants/muscles'
import { prisma } from '@/lib/db'
import { openai } from '@/lib/open-ai/open-ai'

export interface GenerateSubstitutesInput {
  exerciseName: string
  primaryMuscleIds: string[]
  equipment: string
}

export interface GenerateSubstitutesResult {
  suggestedSubstituteIds: string[]
}

interface ExerciseForMatching {
  id: string
  name: string
  primaryMuscles: string
}

interface GeneratedSubstitutesResponse {
  substituteIds: string[]
  reasoning: string
}

const SUBSTITUTES_SCHEMA = {
  type: 'object',
  properties: {
    substituteIds: {
      type: 'array',
      description: 'Array of 1-3 exercise IDs that are the best substitutes',
      items: { type: 'string' },
      minItems: 0,
      maxItems: 3,
    },
    reasoning: {
      type: 'string',
      description:
        'Brief explanation of why these exercises are good substitutes',
    },
  },
  required: ['substituteIds', 'reasoning'],
  additionalProperties: false,
} as const

async function getExercisesMatchingMuscles(
  primaryMuscleIds: string[],
): Promise<ExerciseForMatching[]> {
  const exercises = await prisma.baseExercise.findMany({
    where: {
      isPublic: true,
      muscleGroups: {
        some: {
          id: { in: primaryMuscleIds },
        },
      },
    },
    select: {
      id: true,
      name: true,
      muscleGroups: {
        select: { id: true },
      },
    },
    take: 100,
  })

  return exercises.map((e) => ({
    id: e.id,
    name: e.name,
    primaryMuscles: e.muscleGroups
      .map((mg) => MUSCLES.find((m) => m.id === mg.id)?.alias || mg.id)
      .join(', '),
  }))
}

function buildSystemPrompt(): string {
  return `You are a fitness expert helping select substitute exercises.

Your task is to select 1-3 exercises that are the best substitutes for a given exercise.

SUBSTITUTE SELECTION CRITERIA:
1. Same primary muscle groups targeted
2. Similar movement pattern (push/pull/squat/hinge)
3. Different equipment is OK (provides variety)
4. Consider difficulty level similarity

Return ONLY exercise IDs from the provided list. Do not invent IDs.`
}

function buildUserPrompt(
  exerciseName: string,
  equipment: string,
  primaryMuscles: string,
  availableExercises: ExerciseForMatching[],
): string {
  const exerciseList = availableExercises
    .map((e) => `- ${e.name} (${e.primaryMuscles}) [${e.id}]`)
    .join('\n')

  return `Find substitute exercises for:

EXERCISE: ${exerciseName}
EQUIPMENT: ${equipment}
PRIMARY MUSCLES: ${primaryMuscles}

AVAILABLE EXERCISES (select 1-3 from this list):
${exerciseList}

Select exercises that target similar muscles and movement patterns. Return their exact IDs.`
}

export async function generateSubstitutes(
  input: GenerateSubstitutesInput,
): Promise<GenerateSubstitutesResult> {
  // Get exercises matching the primary muscles
  const availableExercises = await getExercisesMatchingMuscles(
    input.primaryMuscleIds,
  )

  // If no matching exercises found, return empty
  if (availableExercises.length === 0) {
    return { suggestedSubstituteIds: [] }
  }

  const primaryMuscleNames = input.primaryMuscleIds
    .map((id) => MUSCLES.find((m) => m.id === id)?.alias || id)
    .join(', ')

  const maxRetries = 2

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          {
            role: 'user',
            content: buildUserPrompt(
              input.exerciseName,
              input.equipment,
              primaryMuscleNames,
              availableExercises,
            ),
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'substitute_selection',
            strict: true,
            schema: SUBSTITUTES_SCHEMA,
          },
        },
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content received from OpenAI')
      }

      const parsed = JSON.parse(content) as GeneratedSubstitutesResponse

      // Validate that returned IDs exist in our available exercises
      const validIds = new Set(availableExercises.map((e) => e.id))
      const validSubstituteIds = parsed.substituteIds.filter((id) =>
        validIds.has(id),
      )

      return {
        suggestedSubstituteIds: validSubstituteIds,
      }
    } catch (error) {
      if (attempt === maxRetries) {
        console.error('Failed to generate substitutes:', error)
        return { suggestedSubstituteIds: [] }
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
    }
  }

  return { suggestedSubstituteIds: [] }
}
