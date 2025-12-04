#!/usr/bin/env ts-node
import { EQUIPMENT_OPTIONS } from '@/constants/equipment'
import { MUSCLES } from '@/constants/muscles'
import { prisma } from '@/lib/db'
import { openai } from '@/lib/open-ai/open-ai'

// Module-level abort controller for stopping generation
let currentAbortController: AbortController | null = null

export function abortMuscleGeneration(): boolean {
  if (currentAbortController) {
    currentAbortController.abort()
    currentAbortController = null
    return true
  }
  return false
}

export function isGenerationRunning(): boolean {
  return currentAbortController !== null
}

interface GenerationConfig {
  batchSize: number
  dryRun: boolean
  skipExisting: boolean
  maxRetries: number
  delayBetweenRequests: number // ms
}

interface ExerciseForGeneration {
  id: string
  name: string
  equipment: string | null
  description: string | null
  instructions: string[]
  tips: string[]
  muscleGroups: { id: string; name: string }[]
  secondaryMuscleGroups: { id: string; name: string }[]
}

interface GeneratedMuscles {
  primaryMuscleIds: string[]
  secondaryMuscleIds: string[]
  reasoning: string
}

// Group muscles by display group for AI context
const MUSCLES_BY_GROUP = MUSCLES.reduce(
  (acc, m) => {
    if (!acc[m.displayGroup]) acc[m.displayGroup] = []
    acc[m.displayGroup].push(`${m.name} (${m.alias}) [${m.id}]`)
    return acc
  },
  {} as Record<string, string[]>,
)

// JSON Schema for GPT structured outputs
const MUSCLE_SELECTION_SCHEMA = {
  type: 'object',
  properties: {
    primaryMuscleIds: {
      type: 'array',
      description:
        'Array of 1-3 muscle IDs that are the PRIMARY movers - muscles that perform the main movement and receive the most tension/stimulus',
      items: { type: 'string' },
      minItems: 1,
      maxItems: 3,
    },
    secondaryMuscleIds: {
      type: 'array',
      description:
        'Array of 0-4 muscle IDs that are SECONDARY - muscles that assist the movement, provide stability, or receive partial activation',
      items: { type: 'string' },
      minItems: 0,
      maxItems: 4,
    },
    reasoning: {
      type: 'string',
      description:
        'Brief explanation of why these muscles were selected based on the movement pattern and biomechanics',
    },
  },
  required: ['primaryMuscleIds', 'secondaryMuscleIds', 'reasoning'],
  additionalProperties: false,
} as const

class ExerciseMuscleGenerator {
  private config: GenerationConfig

  constructor(config: Partial<GenerationConfig> = {}) {
    this.config = {
      batchSize: 10,
      dryRun: false,
      skipExisting: true,
      maxRetries: 3,
      delayBetweenRequests: 2000,
      ...config,
    }
  }

  async generateMuscles(): Promise<{
    processed: number
    successful: number
    skipped: number
    failed: number
    aborted: boolean
  }> {
    // Set up abort controller
    currentAbortController = new AbortController()
    const signal = currentAbortController.signal

    console.info('💪 Starting exercise muscle group generation...\n')
    console.info(`Configuration:`)
    console.info(`  • Batch size: ${this.config.batchSize}`)
    console.info(`  • Dry run: ${this.config.dryRun}`)
    console.info(`  • Skip existing: ${this.config.skipExisting}`)
    console.info(`  • Max retries: ${this.config.maxRetries}`)
    console.info(
      `  • Delay between requests: ${this.config.delayBetweenRequests}ms\n`,
    )

    let processed = 0
    let successful = 0
    let skipped = 0
    let failed = 0
    let aborted = false

    try {
      const exercises = await this.getExercisesForGeneration()
      console.info(`📋 Found ${exercises.length} exercises to process\n`)

      if (exercises.length === 0) {
        console.info('✅ All exercises already have muscle groups assigned!')
        return {
          processed: 0,
          successful: 0,
          skipped: 0,
          failed: 0,
          aborted: false,
        }
      }

      for (let i = 0; i < exercises.length; i += this.config.batchSize) {
        // Check for abort before each batch
        if (signal.aborted) {
          console.info('\n⏹️ Generation aborted by user')
          aborted = true
          break
        }

        const batch = exercises.slice(i, i + this.config.batchSize)
        console.info(
          `🔄 Processing batch ${Math.floor(i / this.config.batchSize) + 1} (${batch.length} exercises)`,
        )

        for (const exercise of batch) {
          // Check for abort before each exercise
          if (signal.aborted) {
            console.info('\n⏹️ Generation aborted by user')
            aborted = true
            break
          }

          try {
            console.info(`  💪 Analyzing: ${exercise.name}`)

            const muscles = await this.generateMusclesForExercise(exercise)

            if (this.config.dryRun) {
              const primaryNames = muscles.primaryMuscleIds
                .map((id) => MUSCLES.find((m) => m.id === id)?.alias || id)
                .join(', ')
              const secondaryNames = muscles.secondaryMuscleIds
                .map((id) => MUSCLES.find((m) => m.id === id)?.alias || id)
                .join(', ')

              console.info(`    [DRY RUN] Would update with:`)
              console.info(`      Primary: ${primaryNames}`)
              console.info(`      Secondary: ${secondaryNames || 'None'}`)
              console.info(`      Reasoning: ${muscles.reasoning}\n`)
              skipped++
            } else {
              await this.updateExerciseMuscles(exercise.id, muscles)
              console.info(`    ✅ Updated successfully`)
              successful++
            }

            processed++

            if (i + batch.indexOf(exercise) < exercises.length - 1) {
              await this.delay(this.config.delayBetweenRequests)
            }
          } catch (error) {
            console.error(`    ❌ Failed to process ${exercise.name}:`, error)
            failed++
          }
        }

        if (aborted) break
        console.info('')
      }

      console.info(`\n📊 GENERATION ${aborted ? 'STOPPED' : 'COMPLETE'}\n`)
      console.info(`Results:`)
      console.info(`  • Total processed: ${processed}`)
      console.info(`  • Successful: ${successful}`)
      console.info(`  • Skipped (dry run): ${skipped}`)
      console.info(`  • Failed: ${failed}`)
      if (aborted) console.info(`  • Status: Aborted by user`)

      return { processed, successful, skipped, failed, aborted }
    } catch (error) {
      console.error('❌ Error in generation process:', error)
      throw error
    } finally {
      currentAbortController = null
      await prisma.$disconnect()
    }
  }

  private async getExercisesForGeneration(): Promise<ExerciseForGeneration[]> {
    const allExercises = await prisma.baseExercise.findMany({
      where: {
        isPublic: true,
      },
      select: {
        id: true,
        name: true,
        equipment: true,
        description: true,
        instructions: true,
        tips: true,
        muscleGroups: {
          select: { id: true, name: true },
        },
        secondaryMuscleGroups: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    if (!this.config.skipExisting) {
      return allExercises
    }

    // Filter to exercises missing muscle groups
    return allExercises.filter((exercise) => {
      const hasPrimary = exercise.muscleGroups.length > 0
      const hasSecondary = exercise.secondaryMuscleGroups.length > 0
      // Skip if already has both primary and secondary
      return !hasPrimary || !hasSecondary
    })
  }

  private async generateMusclesForExercise(
    exercise: ExerciseForGeneration,
  ): Promise<GeneratedMuscles> {
    const prompt = this.buildPrompt(exercise)

    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-5.1',
          messages: [
            {
              role: 'system',
              content: this.buildSystemPrompt(),
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_completion_tokens: 10000,
          reasoning_effort: 'high', // Deep reasoning for anatomy analysis
          verbosity: 'low', // Concise output
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

        const parsed = JSON.parse(content) as GeneratedMuscles

        // Validate muscle IDs exist
        const validMuscleIds = new Set(MUSCLES.map((m) => m.id))
        const invalidPrimary = parsed.primaryMuscleIds.filter(
          (id) => !validMuscleIds.has(id),
        )
        const invalidSecondary = parsed.secondaryMuscleIds.filter(
          (id) => !validMuscleIds.has(id),
        )

        if (invalidPrimary.length > 0 || invalidSecondary.length > 0) {
          throw new Error(
            `Invalid muscle IDs returned: ${[...invalidPrimary, ...invalidSecondary].join(', ')}`,
          )
        }

        return parsed
      } catch (error) {
        lastError = error as Error
        console.warn(
          `    ⚠️  Attempt ${attempt} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )

        if (attempt < this.config.maxRetries) {
          await this.delay(1000 * attempt)
        }
      }
    }

    throw new Error(
      `Failed after ${this.config.maxRetries} attempts. Last error: ${lastError?.message}`,
    )
  }

  private buildSystemPrompt(): string {
    const muscleList = Object.entries(MUSCLES_BY_GROUP)
      .map(([group, muscles]) => `${group}:\n  ${muscles.join('\n  ')}`)
      .join('\n\n')

    return `You are an expert exercise physiologist and anatomy specialist with deep knowledge of muscle activation patterns during resistance training.

Your task is to accurately identify which muscles are activated during exercises.

AVAILABLE MUSCLES (you MUST use exact IDs from this list):

${muscleList}

MUSCLE SELECTION RULES:

1. PRIMARY MUSCLES (1-3 muscles):
   - The main movers that perform the exercise movement
   - Muscles that receive the MOST tension and stimulus
   - For compound exercises, include all major muscles involved
   - Example: Bench Press → Pectoralis Major, Deltoid Anterior, Triceps Brachii

2. SECONDARY MUSCLES (0-4 muscles):
   - Muscles that assist the movement or provide stability
   - Synergists that help but aren't the main target
   - Stabilizers under significant load
   - Example: Bench Press secondary → Serratus Anterior

3. MOVEMENT ANALYSIS:
   - Consider the joint actions (flexion, extension, rotation, etc.)
   - Consider the resistance direction and force vector
   - Consider grip variations and stance modifications
   - Consider isometric vs concentric/eccentric involvement

4. EXERCISE TYPE PATTERNS:
   - Push movements: Chest, Shoulders (anterior), Triceps
   - Pull movements: Back (lats, rhomboids, traps), Biceps
   - Squat patterns: Quads, Glutes, Core
   - Hip hinge patterns: Hamstrings, Glutes, Lower Back
   - Isolation exercises: Focus on 1-2 primary muscles

IMPORTANT: You must return the exact muscle IDs from the list above. Do not invent new IDs.`
  }

  private buildPrompt(exercise: ExerciseForGeneration): string {
    const equipmentLabel =
      EQUIPMENT_OPTIONS.find((e) => e.value === exercise.equipment)?.label ||
      exercise.equipment ||
      'Bodyweight'

    const currentPrimary =
      exercise.muscleGroups.map((m) => m.name).join(', ') || 'None assigned'
    const currentSecondary =
      exercise.secondaryMuscleGroups.map((m) => m.name).join(', ') ||
      'None assigned'

    return `Analyze this exercise and identify the exact muscles activated:

EXERCISE: ${exercise.name}
EQUIPMENT: ${equipmentLabel}

${exercise.description ? `DESCRIPTION:\n${exercise.description}\n` : ''}
${exercise.instructions?.length ? `INSTRUCTIONS:\n${exercise.instructions.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}\n` : ''}
${exercise.tips?.length ? `TIPS:\n${exercise.tips.map((t) => `• ${t}`).join('\n')}\n` : ''}

CURRENT ASSIGNMENT (may be incorrect or incomplete):
- Primary: ${currentPrimary}
- Secondary: ${currentSecondary}

Based on biomechanics and muscle activation patterns, select the correct primary and secondary muscles using EXACT muscle IDs from the provided list.`
  }

  private async updateExerciseMuscles(
    exerciseId: string,
    muscles: GeneratedMuscles,
  ): Promise<void> {
    await prisma.baseExercise.update({
      where: { id: exerciseId },
      data: {
        muscleGroups: {
          set: muscles.primaryMuscleIds.map((id) => ({ id })),
        },
        secondaryMuscleGroups: {
          set: muscles.secondaryMuscleIds.map((id) => ({ id })),
        },
      },
    })
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)

  const config: Partial<GenerationConfig> = {
    dryRun: args.includes('--dry-run') || args.includes('-d'),
    skipExisting: !args.includes('--force'),
    batchSize: parseInt(
      args.find((arg) => arg.startsWith('--batch='))?.split('=')[1] || '10',
    ),
  }

  const generator = new ExerciseMuscleGenerator(config)
  await generator.generateMuscles()
}

// Export for use in API routes
export { ExerciseMuscleGenerator }

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}
