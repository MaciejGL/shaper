#!/usr/bin/env ts-node
import { EQUIPMENT_OPTIONS } from '@/config/equipment'
import { prisma } from '@/lib/db'
import { openai } from '@/lib/open-ai/open-ai'

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
  muscleGroups: { name: string; alias: string | null }[]
  secondaryMuscleGroups: { name: string; alias: string | null }[]
  description: string | null
  instructions: string[]
  tips: string[]
}

interface GeneratedContent {
  description: string
  instructions: string[] // Array of strings
  tips: string[] // Array of strings
}

// JSON Schema for GPT-5 structured outputs
const EXERCISE_CONTENT_SCHEMA = {
  type: 'object',
  properties: {
    description: {
      type: 'string',
      description:
        'A natural, conversational description focusing on what this exercise will do for the person. Explain benefits and what areas it targets using everyday language. Don\'t start with "Description:" - write it naturally. Use common muscle sections names (biceps, triceps, shoulders, back, mid-back, chest, abs, glutes, etc.) instead of terms like "brachialis" or "brachioradialis". Keep it up to 2 sentences.',
    },
    instructions: {
      type: 'array',
      description:
        'Exactly 2 steps - starting position and execution, each step should contain maximum 1-2 sentences. Don\'t use "Starting Position" or "Execution" as start of the step.',
      items: {
        type: 'string',
      },
      minItems: 2,
      maxItems: 2,
    },
    tips: {
      type: 'array',
      description:
        '1-3 helpful form cues, safety notes, breathing tips, or common mistake corrections',
      items: {
        type: 'string',
      },
      minItems: 1,
      maxItems: 3,
    },
  },
  required: ['description', 'instructions', 'tips'],
  additionalProperties: false,
} as const

class ExerciseDescriptionGenerator {
  private config: GenerationConfig

  constructor(config: Partial<GenerationConfig> = {}) {
    this.config = {
      batchSize: 10,
      dryRun: false,
      skipExisting: false,
      maxRetries: 3,
      delayBetweenRequests: 2000, // 2 seconds between requests
      ...config,
    }
  }

  /**
   * Main function to generate descriptions for public exercises
   */
  async generateDescriptions(): Promise<void> {
    console.info('🏋️  Starting exercise description generation...\n')
    console.info(`Configuration:`)
    console.info(`  • Batch size: ${this.config.batchSize}`)
    console.info(`  • Dry run: ${this.config.dryRun}`)
    console.info(`  • Skip existing: ${this.config.skipExisting}`)
    console.info(`  • Max retries: ${this.config.maxRetries}`)
    console.info(
      `  • Delay between requests: ${this.config.delayBetweenRequests}ms\n`,
    )

    try {
      // Get exercises that need descriptions
      const exercises = await this.getExercisesForGeneration()
      console.info(`📋 Found ${exercises.length} exercises to process\n`)

      if (exercises.length === 0) {
        console.info('✅ All exercises already have descriptions!')
        return
      }

      let processed = 0
      let successful = 0
      let skipped = 0
      let failed = 0

      // Process in batches
      for (let i = 0; i < exercises.length; i += this.config.batchSize) {
        const batch = exercises.slice(i, i + this.config.batchSize)
        console.info(
          `🔄 Processing batch ${Math.floor(i / this.config.batchSize) + 1} (${batch.length} exercises)`,
        )

        for (const exercise of batch) {
          try {
            console.info(`  📝 Generating for: ${exercise.name}`)

            const content = await this.generateContentForExercise(exercise)

            if (this.config.dryRun) {
              console.info(`    [DRY RUN] Would update with:`)
              console.info(`      Description: ${content.description}\n\n`)
              console.info(
                `      Instructions: ${JSON.stringify(content.instructions, null, 2)}\n\n`,
              )
              console.info(
                `      Tips: ${JSON.stringify(content.tips, null, 2)}\n\n`,
              )
              skipped++
            } else {
              await this.updateExerciseContent(exercise.id, content)
              console.info(`    ✅ Updated successfully`)
              successful++
            }

            processed++

            // Rate limiting delay
            if (i + batch.indexOf(exercise) < exercises.length - 1) {
              await this.delay(this.config.delayBetweenRequests)
            }
          } catch (error) {
            console.error(`    ❌ Failed to process ${exercise.name}:`, error)
            failed++
          }
        }

        console.info('')
      }

      // Final summary
      console.info('📊 GENERATION COMPLETE\n')
      console.info(`Results:`)
      console.info(`  • Total processed: ${processed}`)
      console.info(`  • Successful: ${successful}`)
      console.info(`  • Skipped (dry run): ${skipped}`)
      console.info(`  • Failed: ${failed}`)
    } catch (error) {
      console.error('❌ Error in generation process:', error)
      throw error
    } finally {
      await prisma.$disconnect()
    }
  }

  /**
   * Get exercises that need descriptions generated
   */
  private async getExercisesForGeneration(): Promise<ExerciseForGeneration[]> {
    // First get all public exercises
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
          select: {
            name: true,
            alias: true,
          },
        },
        secondaryMuscleGroups: {
          select: {
            name: true,
            alias: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Filter in application logic if skipExisting is enabled
    if (!this.config.skipExisting) {
      return allExercises
    }

    return allExercises.filter((exercise) => {
      const needsDescription =
        !exercise.description || exercise.description.trim() === ''
      const needsInstructions =
        !exercise.instructions || exercise.instructions.length === 0
      const needsTips = !exercise.tips || exercise.tips.length === 0

      return needsDescription || needsInstructions || needsTips
    })
  }

  /**
   * Generate AI content for a specific exercise
   */
  private async generateContentForExercise(
    exercise: ExerciseForGeneration,
  ): Promise<GeneratedContent> {
    const prompt = this.buildPrompt(exercise)

    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-5.1',
          messages: [
            {
              role: 'system',
              content: `You are a friendly fitness coach creating exercise descriptions for everyday people. Write content that's encouraging, easy to understand, and focuses on how exercises will help users achieve their fitness goals. Your client is not a fitness expert, so don't use technical terms.

Guidelines:
- Description: A natural, conversational description focusing on what this exercise will do for the person. Explain benefits and what areas it targets using everyday language. Don\'t start with "Description:" - write it naturally. Use common muscle sections names (biceps, triceps, shoulders, back, mid-back, chest, abs, glutes, etc.) instead of terms like "brachialis" or "brachioradialis". Keep it up to 2 short sentences.
- Instructions: EXACTLY 2 steps - First describes how to get into position, second explains the movement. Write like you're coaching someone in person. Do not use brackets or titles. AVOID using [detailed setup and positioning] or [complete movement description with tempo and breathing] in the instructions. Keep it up to 1-2 short sentences per step.
- Tips: 1-3 practical tips that help people do the exercise better and avoid mistakes
- Write conversationally and encouragingly
- Focus on what the person will feel and achieve
- Use simple, everyday language that anyone can understand`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_completion_tokens: 10000,
          reasoning_effort: 'high', // Deep reasoning for complex exercise analysis
          verbosity: 'low', // Concise but informative for mobile users
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

        // With GPT-5 structured outputs, the response is guaranteed to be valid JSON
        // that matches our schema, so we can parse it directly without validation
        const parsed = JSON.parse(content) as GeneratedContent

        return parsed
      } catch (error) {
        lastError = error as Error
        console.warn(
          `    ⚠️  Attempt ${attempt} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )

        if (attempt < this.config.maxRetries) {
          await this.delay(1000 * attempt) // Exponential backoff
        }
      }
    }

    throw new Error(
      `Failed after ${this.config.maxRetries} attempts. Last error: ${lastError?.message}`,
    )
  }

  /**
   * Build the AI prompt for an exercise
   */
  private buildPrompt(exercise: ExerciseForGeneration): string {
    const primaryMuscles = exercise.muscleGroups
      .map((m) => m.alias || m.name)
      .join(', ')
    const secondaryMuscles = exercise.secondaryMuscleGroups
      .map((m) => m.alias || m.name)
      .join(', ')
    const equipmentLabel =
      EQUIPMENT_OPTIONS.find((e) => e.value === exercise.equipment)?.label ||
      'None'

    return `Generate comprehensive description, instructions, and tips for this exercise:

Exercise: ${exercise.name}
Equipment: ${equipmentLabel}
Primary Muscles: ${primaryMuscles}
${secondaryMuscles ? `Secondary Muscles: ${secondaryMuscles}` : ''}

Requirements:
- Description: Comprehensive overview including equipment, muscles worked (primary and secondary, no technical deep terms), movement pattern, and key benefits (strength, hypertrophy, mobility, etc.)
- Instructions: Exactly 2 parts - "[detailed setup and positioning]" and "[complete movement description with tempo and breathing]"
- Tips: 1-3 practical form cues, safety considerations, breathing patterns, and common mistakes to avoid

The content will help users understand the exercise's purpose, set it up correctly, and perform it safely with proper form.`
  }

  /**
   * Update exercise content in the database
   */
  private async updateExerciseContent(
    exerciseId: string,
    content: GeneratedContent,
  ): Promise<void> {
    await prisma.baseExercise.update({
      where: { id: exerciseId },
      data: {
        description: content.description,
        instructions: content.instructions,
        tips: content.tips,
      },
    })
  }

  /**
   * Utility function for delays
   */
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

  const generator = new ExerciseDescriptionGenerator(config)
  await generator.generateDescriptions()
}

// Export for use in API routes
export { ExerciseDescriptionGenerator }

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}
