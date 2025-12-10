import { EQUIPMENT_OPTIONS } from '@/config/equipment'
import { MUSCLES } from '@/config/muscles'
import { openai } from '@/lib/open-ai/open-ai'

export interface GenerateExerciseContentInput {
  name: string
  equipment?: string | null
  primaryMuscleIds?: string[]
  secondaryMuscleIds?: string[]
}

export interface GenerateExerciseContentResult {
  description: string
  instructions: [string, string]
  tips: string[]
}

const EXERCISE_CONTENT_SCHEMA = {
  type: 'object',
  properties: {
    description: {
      type: 'string',
      description:
        'A natural, conversational description focusing on what this exercise will do for the person. Keep it up to 2 sentences.',
    },
    instructions: {
      type: 'array',
      description: 'Exactly 2 steps - starting position and execution.',
      items: { type: 'string' },
      minItems: 2,
      maxItems: 2,
    },
    tips: {
      type: 'array',
      description: '1-3 helpful form cues or safety notes',
      items: { type: 'string' },
      minItems: 1,
      maxItems: 3,
    },
  },
  required: ['description', 'instructions', 'tips'],
  additionalProperties: false,
} as const

function buildSystemPrompt(): string {
  return `You are a friendly fitness coach creating exercise descriptions for everyday people. Write content that's encouraging, easy to understand, and focuses on how exercises will help users achieve their fitness goals.

Guidelines:
- Description: A natural, conversational description focusing on what this exercise will do for the person. Explain benefits and what areas it targets using everyday language. Don't start with "Description:" - write it naturally. Use common muscle names (biceps, triceps, shoulders, back, chest, abs, glutes, etc.) instead of technical terms. Keep it up to 2 short sentences.
- Instructions: EXACTLY 2 steps - First describes how to get into position, second explains the movement. Write like you're coaching someone in person. Keep it up to 1-2 short sentences per step.
- Tips: 1-3 practical tips that help people do the exercise better and avoid mistakes
- Write conversationally and encouragingly
- Focus on what the person will feel and achieve
- Use simple, everyday language`
}

function buildUserPrompt(input: GenerateExerciseContentInput): string {
  const equipmentLabel =
    EQUIPMENT_OPTIONS.find((e) => e.value === input.equipment)?.label || 'None'

  const primaryMuscles =
    input.primaryMuscleIds
      ?.map((id) => MUSCLES.find((m) => m.id === id)?.alias)
      .filter(Boolean)
      .join(', ') || 'Not specified'

  const secondaryMuscles =
    input.secondaryMuscleIds
      ?.map((id) => MUSCLES.find((m) => m.id === id)?.alias)
      .filter(Boolean)
      .join(', ') || ''

  return `Generate description, instructions, and tips for this exercise:

Exercise: ${input.name}
Equipment: ${equipmentLabel}
Primary Muscles: ${primaryMuscles}
${secondaryMuscles ? `Secondary Muscles: ${secondaryMuscles}` : ''}

Requirements:
- Description: Overview including muscles worked and key benefits
- Instructions: Exactly 2 parts - setup/positioning and movement execution
- Tips: 1-3 practical form cues and common mistakes to avoid`
}

export async function generateExerciseContent(
  input: GenerateExerciseContentInput,
): Promise<GenerateExerciseContentResult> {
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
            name: 'exercise_content',
            strict: true,
            schema: EXERCISE_CONTENT_SCHEMA,
          },
        },
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content received from OpenAI')
      }

      const parsed = JSON.parse(content) as GenerateExerciseContentResult
      return parsed
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(
          `Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
    }
  }

  throw new Error('Failed to generate content')
}
