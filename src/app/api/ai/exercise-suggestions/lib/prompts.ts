import type { ExerciseForSelection, MuscleProgressData } from './types'

export const SUGGESTIONS_SCHEMA = {
  type: 'object',
  properties: {
    orderedSuggestions: {
      type: 'array',
      description:
        'Ordered 4-6 exercise suggestions with roles. Prefer compounds early, isolations late.',
      items: {
        type: 'object',
        properties: {
          exerciseId: {
            type: 'string',
            description: 'Exercise ID from the provided list',
          },
          role: {
            type: 'string',
            enum: [
              'activation',
              'primary_compound',
              'secondary_compound',
              'accessory',
              'isolation',
            ],
          },
        },
        required: ['exerciseId', 'role'],
        additionalProperties: false,
      },
      minItems: 4,
      maxItems: 6,
    },
    context: {
      type: 'string',
      description: 'Short context explaining the suggestions (max 15 words)',
    },
  },
  required: ['orderedSuggestions', 'context'],
  additionalProperties: false,
} as const

export function buildSystemPrompt(): string {
  return `You are an experienced strength coach suggesting exercises for a user's workout.

Your task is to select 4-6 exercises from the provided list based on:
1. Muscles that are fully recovered (percentRecovered = 100)
2. Muscles that need more volume this week (below target sets)
3. Variety - don't suggest similar exercises

Order rules (manage fatigue):
- Optional activation/prehab first only when it improves the first compound
- 2-3 compound lifts early
- 1 accessory after compounds
- 1-2 isolations last

You MUST assign a role to each exercise and return orderedSuggestions.
Return exercise IDs EXACTLY as provided. Keep the context very short (max 15 words).`
}

export function buildUserPrompt(params: {
  muscleProgress: MuscleProgressData[]
  exercises: ExerciseForSelection[]
  workoutType?: string
}): string {
  const needsWork = params.muscleProgress
    .filter((m) => m.completedSets < m.targetSets * 0.5)
    .map(
      (m) =>
        `${m.muscle}: ${m.completedSets}/${m.targetSets} sets, ${m.percentRecovered}% recovered`,
    )
    .join('\n')

  const recovered = params.muscleProgress
    .filter((m) => m.percentRecovered >= 100)
    .map((m) => `${m.muscle}: ${m.percentRecovered}% recovered`)
    .join('\n')

  const exerciseList = params.exercises
    .map((e) => {
      const primary =
        e.primaryDisplayGroups.length > 0
          ? e.primaryDisplayGroups.join(', ')
          : 'Unknown'
      const secondary =
        e.secondaryDisplayGroups.length > 0
          ? e.secondaryDisplayGroups.join(', ')
          : 'None'
      const equipment = e.equipment ?? 'Unknown'
      const type = e.type ?? 'Unknown'
      const difficulty = e.difficulty ?? 'Unknown'

      return `[${e.id}] ${e.name} | primary: ${primary} | secondary: ${secondary} | equipment: ${equipment} | type: ${type} | difficulty: ${difficulty}`
    })
    .join('\n')

  return `${
    params.workoutType ? `Workout type: ${params.workoutType}\n\n` : ''
  }Muscles needing volume:
${needsWork || 'All muscles on track'}

Recovered muscles (ready to train):
${recovered || 'All muscles recently trained'}

Available exercises:
${exerciseList}

Select 4-6 exercises that would best complement this user's week.`
}


