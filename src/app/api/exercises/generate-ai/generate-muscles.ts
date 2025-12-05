import { EQUIPMENT_OPTIONS } from '@/constants/equipment'
import { MUSCLES } from '@/constants/muscles'
import { openai } from '@/lib/open-ai/open-ai'

export interface GenerateExerciseMusclesInput {
  name: string
  equipment?: string | null
}

export interface GenerateExerciseMusclesResult {
  primaryMuscleIds: string[]
  secondaryMuscleIds: string[]
}

interface GeneratedMusclesResponse {
  primaryMuscleIds: string[]
  secondaryMuscleIds: string[]
  reasoning: string
}

const MUSCLES_BY_GROUP = MUSCLES.reduce(
  (acc, m) => {
    if (!acc[m.displayGroup]) acc[m.displayGroup] = []
    acc[m.displayGroup].push(`${m.name} (${m.alias}) [${m.id}]`)
    return acc
  },
  {} as Record<string, string[]>,
)

const MUSCLE_SELECTION_SCHEMA = {
  type: 'object',
  properties: {
    primaryMuscleIds: {
      type: 'array',
      description:
        'Array of 1-2 muscle IDs that are the PRIMARY target muscles',
      items: { type: 'string' },
      minItems: 1,
      maxItems: 2,
    },
    secondaryMuscleIds: {
      type: 'array',
      description:
        'Array of 0-4 muscle IDs that are SECONDARY - assisting muscles',
      items: { type: 'string' },
      minItems: 0,
      maxItems: 4,
    },
    reasoning: {
      type: 'string',
      description: 'Brief explanation of muscle selection',
    },
  },
  required: ['primaryMuscleIds', 'secondaryMuscleIds', 'reasoning'],
  additionalProperties: false,
} as const

function buildSystemPrompt(): string {
  const muscleList = Object.entries(MUSCLES_BY_GROUP)
    .map(([group, muscles]) => `${group}:\n  ${muscles.join('\n  ')}`)
    .join('\n\n')

  return `You are an expert exercise physiologist specializing in muscle activation patterns during resistance training.

Your task is to identify which muscles are targeted by exercises based on TRAINING INTENT, not just activation.

AVAILABLE MUSCLES (you MUST use exact IDs from this list):

${muscleList}

CORE PRINCIPLE - TRAINING INTENT:
The PRIMARY muscle is what the exercise is DESIGNED to train, not just what works hard.
Ask yourself: "What muscle is someone trying to grow when they do this exercise?"

MUSCLE SELECTION RULES:

1. PRIMARY MUSCLES (strictly 1-2 muscles):
   - The TARGET muscle(s) the exercise is specifically designed to train
   - Most exercises should have only 1 primary muscle
   - Only use 2 primary muscles for exercises that equally target two muscle groups
   - NEVER mark 3+ muscles as primary

2. SECONDARY MUSCLES (0-4 muscles):
   - ALL other muscles that assist, stabilize, or work during the movement
   - Even muscles that work VERY HARD belong here if they're not the TARGET
   - Synergists, stabilizers, and support muscles

CRITICAL ANTI-PATTERNS - DO NOT MAKE THESE MISTAKES:
   - Bench Press / Chest Press: Triceps are SECONDARY (target is CHEST only)
   - Shoulder Press: Triceps are SECONDARY (target is SHOULDERS only)
   - Rows / Pulldowns: Biceps are SECONDARY (target is BACK only)
   - Squats: Usually quad-dominant, glutes/hamstrings are often SECONDARY
   - Dips: Primarily CHEST or TRICEPS depending on lean angle, not both as primary

EXERCISE CATEGORY FRAMEWORK:
   - ISOLATION exercises (curls, extensions, raises): Always 1 primary muscle
   - COMPOUND PUSH (bench, press): The main pushing muscle = primary, triceps = secondary
   - COMPOUND PULL (rows, pulldowns): The main pulling muscle = primary, biceps = secondary
   - LEG COMPOUND: Identify if quad-dominant (squat) vs hip-dominant (deadlift/RDL)

LITMUS TEST:
If you titled this exercise "[Muscle] Builder", which muscle would it be?
   - Bench Press = "Chest Builder" → Chest is primary, triceps/delts are secondary
   - Barbell Curl = "Bicep Builder" → Biceps is primary only
   - Lat Pulldown = "Back Builder" → Lats are primary, biceps are secondary

IMPORTANT: You must return the exact muscle IDs from the list above. Do not invent new IDs.`
}

function buildUserPrompt(input: GenerateExerciseMusclesInput): string {
  const equipmentLabel =
    EQUIPMENT_OPTIONS.find((e) => e.value === input.equipment)?.label ||
    input.equipment ||
    'Bodyweight'

  return `Analyze this exercise and identify the exact muscles activated:

EXERCISE: ${input.name}
EQUIPMENT: ${equipmentLabel}

Based on biomechanics and muscle activation patterns, select the correct primary and secondary muscles using EXACT muscle IDs from the provided list.`
}

export async function generateExerciseMuscles(
  input: GenerateExerciseMusclesInput,
): Promise<GenerateExerciseMusclesResult> {
  const maxRetries = 3

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4.1',
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: buildUserPrompt(input) },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'muscle_selection',
            strict: true,
            schema: MUSCLE_SELECTION_SCHEMA,
          },
        },
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content received from OpenAI')
      }

      const parsed = JSON.parse(content) as GeneratedMusclesResponse

      const validMuscleIds = new Set(MUSCLES.map((m) => m.id))
      const invalidPrimary = parsed.primaryMuscleIds.filter(
        (id) => !validMuscleIds.has(id),
      )
      const invalidSecondary = parsed.secondaryMuscleIds.filter(
        (id) => !validMuscleIds.has(id),
      )

      if (invalidPrimary.length > 0 || invalidSecondary.length > 0) {
        throw new Error(
          `Invalid muscle IDs: ${[...invalidPrimary, ...invalidSecondary].join(', ')}`,
        )
      }

      return {
        primaryMuscleIds: parsed.primaryMuscleIds,
        secondaryMuscleIds: parsed.secondaryMuscleIds,
      }
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(
          `Failed to generate muscles: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
    }
  }

  throw new Error('Failed to generate muscles')
}
