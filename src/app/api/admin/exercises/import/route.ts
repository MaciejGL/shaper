import { NextRequest } from 'next/server'

import { isAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

const EXERCEMUS_URL =
  'https://raw.githubusercontent.com/exercemus/exercises/main/exercises.json'

// Equipment mapping from exercemus to our Equipment enum
const EQUIPMENT_MAPPING: Record<string, string> = {
  barbell: 'BARBELL',
  'ez curl bar': 'EZ_BAR',
  dumbbell: 'DUMBBELL',
  machine: 'MACHINE',
  cable: 'CABLE',
  none: 'BODYWEIGHT',
  bands: 'BAND',
  kettlebell: 'KETTLEBELL',
  'pull-up bar': 'PULL_UP_BAR',
  bench: 'BENCH',
  'incline bench': 'INCLINE_BENCH',
  'gym mat': 'MAT',
  'exercise ball': 'EXERCISE_BALL',
  'medicine ball': 'MEDICINE_BALL',
  'foam roll': 'FOAM_ROLLER',
  other: 'OTHER',
}

// Muscle mapping from exercemus to our muscle group names
const MUSCLE_MAPPING: Record<string, string[]> = {
  chest: ['Pectoralis Major'],
  abs: ['Rectus Abdominis'],
  obliques: ['Obliques'],
  biceps: ['Biceps Brachii'],
  triceps: ['Triceps Brachii'],
  forearms: ['Forearms'],
  brachialis: ['Brachialis'],
  shoulders: ['Deltoid Anterior', 'Deltoid Lateral', 'Deltoid Posterior'],
  quads: ['Quadriceps'],
  hamstrings: ['Hamstrings'],
  glutes: ['Gluteus Maximus'],
  calves: ['Calves'],
  lats: ['Latissimus Dorsi'],
  traps: ['Trapezius'],
  'middle back': ['Rhomboids'],
  'lower back': ['Erector Spinae'],
  neck: ['Anterior', 'Posterior'],
  adductors: ['Adductors'],
  abductors: ['Abductors'],
  'serratus anterior': ['Serratus Anterior'],
  soleus: ['Calves'],
}

interface ExercemusExercise {
  name: string
  category: string
  description?: string
  instructions: string[]
  tips?: string[]
  equipment: string[]
  primary_muscles: string[]
  secondary_muscles: string[]
  tempo?: string
  images?: string[]
  video?: string
  variations_on?: string[]
  license_author?: string
  license?: {
    full_name: string
    short_name: string
    url: string
  }
}

interface ImportStats {
  total: number
  imported: number
  skipped: number
  failed: number
}

// Difficulty classification
function classifyDifficulty(exercise: ExercemusExercise): string {
  const { category, equipment } = exercise

  if (['olympic weightlifting', 'strongman'].includes(category)) {
    return 'advanced'
  }

  if (['stretching'].includes(category)) {
    return 'beginner'
  }

  if (['plyometrics', 'crossfit'].includes(category)) {
    return 'intermediate'
  }

  if (category === 'strength') {
    const hasBodyweight = equipment.includes('none')
    const hasBarbell = equipment.includes('barbell')
    const hasMachine = equipment.includes('machine')

    if (hasBodyweight && equipment.length === 1) {
      return 'beginner'
    } else if (hasBarbell || hasMachine) {
      return 'intermediate'
    } else {
      return 'beginner'
    }
  }

  return 'beginner'
}

// Map equipment
function mapEquipment(exercemusEquipment: string[]): string | null {
  const priorityOrder = [
    'barbell',
    'ez curl bar',
    'dumbbell',
    'kettlebell',
    'machine',
    'cable',
    'pull-up bar',
    'incline bench',
    'bench',
    'medicine ball',
    'exercise ball',
    'bands',
    'foam roll',
    'gym mat',
  ]

  for (const priority of priorityOrder) {
    if (exercemusEquipment.includes(priority)) {
      return EQUIPMENT_MAPPING[priority] || null
    }
  }

  for (const eq of exercemusEquipment) {
    if (EQUIPMENT_MAPPING[eq]) {
      return EQUIPMENT_MAPPING[eq]
    }
  }

  return 'OTHER'
}

// Get muscle group IDs
async function getMuscleGroupIds(muscleNames: string[]): Promise<string[]> {
  const mappedMuscleNames: string[] = []

  for (const muscleName of muscleNames) {
    const mapped = MUSCLE_MAPPING[muscleName.toLowerCase()]
    if (mapped) {
      mappedMuscleNames.push(...mapped)
    }
  }

  if (mappedMuscleNames.length === 0) {
    return []
  }

  const muscleGroups = await prisma.muscleGroup.findMany({
    where: {
      name: {
        in: mappedMuscleNames,
      },
    },
  })

  return muscleGroups.map((mg) => mg.id)
}

// Check if exercise exists
async function exerciseExists(name: string): Promise<boolean> {
  const existing = await prisma.baseExercise.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
    },
  })

  return !!existing
}

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { type } = await request.json()
    if (!['test', 'full'].includes(type)) {
      return new Response('Invalid import type', { status: 400 })
    }

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial status
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                isRunning: true,
                type,
                progress: 0,
                currentBatch: 0,
                totalBatches: 0,
                imported: 0,
                skipped: 0,
                failed: 0,
              })}\n\n`,
            ),
          )

          // Download exercemus data
          const response = await fetch(EXERCEMUS_URL)
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const data = await response.json()

          // Limit exercises for test mode
          const exercisesToProcess =
            type === 'test' ? data.exercises.slice(0, 10) : data.exercises
          const stats: ImportStats = {
            total: exercisesToProcess.length,
            imported: 0,
            skipped: 0,
            failed: 0,
          }

          const BATCH_SIZE = type === 'test' ? 5 : 10
          const totalBatches = Math.ceil(exercisesToProcess.length / BATCH_SIZE)

          // Process in batches
          for (let i = 0; i < exercisesToProcess.length; i += BATCH_SIZE) {
            const batch = exercisesToProcess.slice(i, i + BATCH_SIZE)
            const currentBatch = Math.floor(i / BATCH_SIZE) + 1
            const progress = Math.round((i / exercisesToProcess.length) * 100)

            // Send batch progress
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  progress,
                  currentBatch,
                  totalBatches,
                  imported: stats.imported,
                  skipped: stats.skipped,
                  failed: stats.failed,
                })}\n\n`,
              ),
            )

            // Process batch
            for (const exercise of batch) {
              try {
                // Send current exercise
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      currentExercise: exercise.name,
                    })}\n\n`,
                  ),
                )

                // Check for duplicates
                if (await exerciseExists(exercise.name)) {
                  stats.skipped++
                  continue
                }

                // Map data
                const equipment = mapEquipment(exercise.equipment)
                const allMuscles = [
                  ...exercise.primary_muscles,
                  ...exercise.secondary_muscles,
                ]
                const muscleGroupIds = await getMuscleGroupIds(allMuscles)

                if (muscleGroupIds.length === 0) {
                  stats.failed++
                  continue
                }

                const difficulty = classifyDifficulty(exercise)

                // Create exercise
                await prisma.baseExercise.create({
                  data: {
                    name: exercise.name,
                    description: exercise.description || null,
                    videoUrl: exercise.video || null,
                    equipment: equipment,
                    isPublic: true,
                    version: 2,
                    dataSource: 'exercemus',
                    sourceId: exercise.name
                      .toLowerCase()
                      .replace(/[^a-z0-9]/g, '-'),
                    importedAt: new Date(),
                    difficulty: difficulty,
                    instructions: exercise.instructions
                      ? JSON.stringify(exercise.instructions)
                      : null,
                    tips: exercise.tips ? JSON.stringify(exercise.tips) : null,
                    muscleGroups: {
                      connect: muscleGroupIds.map((id) => ({ id })),
                    },
                  },
                })

                stats.imported++
              } catch (error) {
                console.error(`Failed to import ${exercise.name}:`, error)
                stats.failed++
              }
            }

            // Brief pause between batches
            await new Promise((resolve) => setTimeout(resolve, 100))
          }

          // Send final results
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                isRunning: false,
                progress: 100,
                imported: stats.imported,
                skipped: stats.skipped,
                failed: stats.failed,
                completed: true,
              })}\n\n`,
            ),
          )

          controller.close()
        } catch (error) {
          console.error('Import failed:', error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                isRunning: false,
                error: error instanceof Error ? error.message : 'Import failed',
              })}\n\n`,
            ),
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Import setup failed:', error)
    return new Response('Import setup failed', { status: 500 })
  }
}
