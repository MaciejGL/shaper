import * as fs from 'fs'
import * as path from 'path'

import { NextRequest, NextResponse } from 'next/server'

import { EQUIPMENT_OPTIONS } from '@/config/equipment'
import { MUSCLES } from '@/config/muscles'
import { isAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { openai } from '@/lib/open-ai/open-ai'

// File path for failed exercises
const FAILED_EXERCISES_FILE = path.join(
  process.cwd(),
  'muscle-analysis-failures.json',
)

// Group muscles by display group for AI context
const MUSCLES_BY_GROUP = MUSCLES.reduce(
  (acc, m) => {
    if (!acc[m.displayGroup]) acc[m.displayGroup] = []
    acc[m.displayGroup].push(`${m.name} (${m.alias}) [${m.id}]`)
    return acc
  },
  {} as Record<string, string[]>,
)

const MUSCLE_BY_ID = new Map(MUSCLES.map((m) => [m.id, m]))

const MUSCLE_SELECTION_SCHEMA = {
  type: 'object',
  properties: {
    primaryMuscleIds: {
      type: 'array',
      description: 'Array of 1-2 muscle IDs that are the PRIMARY movers',
      items: { type: 'string' },
      minItems: 1,
      maxItems: 2,
    },
    secondaryMuscleIds: {
      type: 'array',
      description: 'Array of 0-4 muscle IDs that are SECONDARY',
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

const MUSCLE_VERIFICATION_SCHEMA = {
  type: 'object',
  properties: {
    approved: {
      type: 'boolean',
      description: 'True only if the proposed muscles are correct',
    },
    reasoning: {
      type: 'string',
      description: 'Brief explanation',
    },
    correctedPrimaryMuscleIds: {
      type: 'array',
      description: 'If rejecting, provide the CORRECT primary muscle IDs',
      items: { type: 'string' },
    },
    correctedSecondaryMuscleIds: {
      type: 'array',
      description: 'If rejecting, provide the CORRECT secondary muscle IDs',
      items: { type: 'string' },
    },
  },
  required: ['approved', 'reasoning', 'correctedPrimaryMuscleIds', 'correctedSecondaryMuscleIds'],
  additionalProperties: false,
} as const

function buildPickerSystemPrompt(): string {
  const muscleList = Object.entries(MUSCLES_BY_GROUP)
    .map(([group, muscles]) => `${group}:\n  ${muscles.join('\n  ')}`)
    .join('\n\n')

  return `You are an expert exercise physiologist specializing in muscle activation patterns.

AVAILABLE MUSCLES (use exact IDs):

${muscleList}

RULES:
1. PRIMARY MUSCLES (1-2): The TARGET muscle(s) the exercise trains
2. SECONDARY MUSCLES (0-4): Assisters and stabilizers

ANTI-PATTERNS:
- Bench Press: Triceps are SECONDARY (target is CHEST)
- Shoulder Press: Triceps are SECONDARY (target is SHOULDERS)
- Rows/Pulldowns: Biceps are SECONDARY (target is BACK)

Return exact muscle IDs from the list above.`
}

function buildVerifierSystemPrompt(): string {
  const muscleList = Object.entries(MUSCLES_BY_GROUP)
    .map(([group, muscles]) => `${group}:\n  ${muscles.join('\n  ')}`)
    .join('\n\n')

  return `You are a strict verifier for exercise muscle assignments.

AVAILABLE MUSCLES (use exact IDs):

${muscleList}

RULES:
1. If proposed muscles are CORRECT: approved=true, copy the proposed IDs to corrected fields
2. If proposed muscles are WRONG: approved=false, provide YOUR corrected muscle IDs

ANTI-PATTERNS TO CATCH:
- Triceps should be SECONDARY for pressing movements (chest/shoulders are primary)
- Biceps should be SECONDARY for pulling movements (back is primary)
- Core stabilizers are usually SECONDARY

Always provide correctedPrimaryMuscleIds and correctedSecondaryMuscleIds using exact IDs from the list.`
}

interface ExerciseForAnalysis {
  id: string
  name: string
  equipment: string | null
  description: string | null
  instructions: string[]
  muscleGroups: { id: string; name: string }[]
  secondaryMuscleGroups: { id: string; name: string }[]
}

// Compact format helper
const fmt = (ids: string[]) =>
  ids.map((id) => MUSCLE_BY_ID.get(id)?.alias || id).join(', ') || '—'

// Clean log with fixed-width columns
function logExercise(
  name: string,
  primary: string[],
  secondary: string[],
  status: 'PICK' | 'VERIFIED' | 'REJECTED' | 'SAVED' | 'REVIEW',
) {
  const statusIcon = {
    PICK: '🎯',
    VERIFIED: '✅',
    REJECTED: '❌',
    SAVED: '💾',
    REVIEW: '⚠️',
  }[status]
  
  const nameCol = name.slice(0, 30).padEnd(30)
  const primaryCol = fmt(primary).slice(0, 20).padEnd(20)
  const secondaryCol = fmt(secondary).slice(0, 25).padEnd(25)
  
  console.log(`${statusIcon} ${status.padEnd(8)} | ${nameCol} | P: ${primaryCol} | S: ${secondaryCol}`)
}

async function pickMuscles(exercise: ExerciseForAnalysis) {
  const equipmentLabel =
    EQUIPMENT_OPTIONS.find((e) => e.value === exercise.equipment)?.label ||
    exercise.equipment ||
    'Bodyweight'

  const prompt = `Analyze this exercise:

EXERCISE: ${exercise.name}
EQUIPMENT: ${equipmentLabel}
${exercise.description ? `DESCRIPTION: ${exercise.description}` : ''}

Select primary and secondary muscles using exact IDs.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      { role: 'system', content: buildPickerSystemPrompt() },
      { role: 'user', content: prompt },
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
  if (!content) throw new Error('No response from AI')

  const parsed = JSON.parse(content) as {
    primaryMuscleIds: string[]
    secondaryMuscleIds: string[]
    reasoning: string
  }

  // Validate IDs
  const validIds = new Set(MUSCLES.map((m) => m.id))
  parsed.primaryMuscleIds = parsed.primaryMuscleIds.filter((id) =>
    validIds.has(id),
  )
  parsed.secondaryMuscleIds = parsed.secondaryMuscleIds.filter((id) =>
    validIds.has(id),
  )

  return parsed
}

interface VerificationResult {
  approved: boolean
  reasoning: string
  correctedPrimaryMuscleIds: string[]
  correctedSecondaryMuscleIds: string[]
}

async function verifyMuscles(
  exercise: ExerciseForAnalysis,
  muscles: { primaryMuscleIds: string[]; secondaryMuscleIds: string[] },
): Promise<VerificationResult> {
  const formatIds = (ids: string[]) =>
    ids
      .map((id) => {
        const m = MUSCLE_BY_ID.get(id)
        return m ? `${m.alias} [${id}]` : id
      })
      .join(', ') || 'None'

  const prompt = `Verify muscle selection for: ${exercise.name}

PROPOSED PRIMARY: ${formatIds(muscles.primaryMuscleIds)}
PROPOSED SECONDARY: ${formatIds(muscles.secondaryMuscleIds)}

If correct: approved=true, copy proposed IDs to corrected fields.
If wrong: approved=false, provide your corrected muscle IDs.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      { role: 'system', content: buildVerifierSystemPrompt() },
      { role: 'user', content: prompt },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'muscle_verification',
        strict: true,
        schema: MUSCLE_VERIFICATION_SCHEMA,
      },
    },
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No response from AI')

  const result = JSON.parse(content) as VerificationResult

  // Validate corrected IDs
  const validIds = new Set(MUSCLES.map((m) => m.id))
  result.correctedPrimaryMuscleIds = (result.correctedPrimaryMuscleIds || []).filter((id) =>
    validIds.has(id),
  )
  result.correctedSecondaryMuscleIds = (result.correctedSecondaryMuscleIds || []).filter((id) =>
    validIds.has(id),
  )

  return result
}

// POST: Generate suggestion for a single exercise
export async function POST(request: NextRequest) {
  try {
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { exerciseId } = body

    if (!exerciseId) {
      return NextResponse.json(
        { error: 'exerciseId required' },
        { status: 400 },
      )
    }

    const exercise = await prisma.baseExercise.findUnique({
      where: { id: exerciseId },
      select: {
        id: true,
        name: true,
        equipment: true,
        description: true,
        instructions: true,
        muscleGroups: { select: { id: true, name: true } },
        secondaryMuscleGroups: { select: { id: true, name: true } },
      },
    })

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    }

    // Pick muscles
    const suggestion = await pickMuscles(exercise)
    logExercise(exercise.name, suggestion.primaryMuscleIds, suggestion.secondaryMuscleIds, 'PICK')

    // Verify
    const verification = await verifyMuscles(exercise, suggestion)
    logExercise(
      exercise.name,
      suggestion.primaryMuscleIds,
      suggestion.secondaryMuscleIds,
      verification.approved ? 'VERIFIED' : 'REJECTED',
    )

    // Use verifier's corrected muscles (they provide corrections whether approving or rejecting)
    const finalPrimaryIds = verification.correctedPrimaryMuscleIds.length > 0
      ? verification.correctedPrimaryMuscleIds
      : suggestion.primaryMuscleIds
    const finalSecondaryIds = verification.correctedSecondaryMuscleIds

    // Log the final result if different from picker
    if (!verification.approved) {
      logExercise(exercise.name, finalPrimaryIds, finalSecondaryIds, 'VERIFIED')
    }

    // Format for response
    const formatMuscles = (ids: string[]) =>
      ids.map((id) => {
        const m = MUSCLE_BY_ID.get(id)
        return { id, name: m?.name || id, alias: m?.alias || id }
      })

    return NextResponse.json({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      currentPrimary: exercise.muscleGroups,
      currentSecondary: exercise.secondaryMuscleGroups,
      // Return the FINAL muscles to save (verifier's correction)
      suggestedPrimary: formatMuscles(finalPrimaryIds),
      suggestedSecondary: formatMuscles(finalSecondaryIds),
      pickerReasoning: suggestion.reasoning,
      verifierApproved: verification.approved,
      verifierReasoning: verification.reasoning,
      // Also include original picker suggestion for logging
      pickerPrimary: formatMuscles(suggestion.primaryMuscleIds),
      pickerSecondary: formatMuscles(suggestion.secondaryMuscleIds),
    })
  } catch (error) {
    console.error('❌ Generate failed:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestion' },
      { status: 500 },
    )
  }
}

// PUT: Save approved muscles
export async function PUT(request: NextRequest) {
  try {
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { exerciseId, primaryMuscleIds, secondaryMuscleIds } = body

    if (!exerciseId || !primaryMuscleIds) {
      return NextResponse.json(
        { error: 'exerciseId and primaryMuscleIds required' },
        { status: 400 },
      )
    }

    const exercise = await prisma.baseExercise.update({
      where: { id: exerciseId },
      data: {
        muscleGroups: {
          set: primaryMuscleIds.map((id: string) => ({ id })),
        },
        secondaryMuscleGroups: {
          set: (secondaryMuscleIds || []).map((id: string) => ({ id })),
        },
      },
      select: { name: true },
    })

    logExercise(exercise.name, primaryMuscleIds, secondaryMuscleIds || [], 'SAVED')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Save failed:', error)
    return NextResponse.json(
      { error: 'Failed to save muscles' },
      { status: 500 },
    )
  }
}

// PATCH: Log failed exercise to file
export async function PATCH(request: NextRequest) {
  try {
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { failure } = body

    if (!failure) {
      return NextResponse.json({ error: 'failure data required' }, { status: 400 })
    }

    // Read existing failures
    let failures: unknown[] = []
    try {
      if (fs.existsSync(FAILED_EXERCISES_FILE)) {
        const content = fs.readFileSync(FAILED_EXERCISES_FILE, 'utf-8')
        failures = JSON.parse(content)
      }
    } catch {
      failures = []
    }

    // Add new failure with timestamp
    failures.push({
      ...failure,
      timestamp: new Date().toISOString(),
    })

    // Write back
    fs.writeFileSync(FAILED_EXERCISES_FILE, JSON.stringify(failures, null, 2))

    logExercise(
      failure.exerciseName,
      failure.suggestedPrimary || [],
      failure.suggestedSecondary || [],
      'REVIEW',
    )
    console.log(`   └─ ${failure.autoSaved ? 'Saved but' : 'Not saved,'} logged for review (${failures.length} total)`)

    return NextResponse.json({ success: true, totalFailures: failures.length })
  } catch (error) {
    console.error('❌ Log failure failed:', error)
    return NextResponse.json(
      { error: 'Failed to log failure' },
      { status: 500 },
    )
  }
}

// GET: Stats and next exercise to review
export async function GET(request: NextRequest) {
  try {
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const getNext = searchParams.get('next') === 'true'
    const skipExisting = searchParams.get('skipExisting') !== 'false'
    const skipCount = parseInt(searchParams.get('skip') || '0', 10)

    // Get stats
    const allPublicExercises = await prisma.baseExercise.findMany({
      where: { isPublic: true },
      select: {
        id: true,
        muscleGroups: { select: { id: true } },
        secondaryMuscleGroups: { select: { id: true } },
      },
    })

    const totalPublicExercises = allPublicExercises.length
    const exercisesWithoutPrimary = allPublicExercises.filter(
      (ex) => ex.muscleGroups.length === 0,
    ).length
    const exercisesWithoutSecondary = allPublicExercises.filter(
      (ex) => ex.secondaryMuscleGroups.length === 0,
    ).length
    const exercisesNeedingMuscles = allPublicExercises.filter(
      (ex) =>
        ex.muscleGroups.length === 0 || ex.secondaryMuscleGroups.length === 0,
    ).length
    const exercisesFullyAssigned = allPublicExercises.filter(
      (ex) => ex.muscleGroups.length > 0 && ex.secondaryMuscleGroups.length > 0,
    ).length

    const stats = {
      totalPublicExercises,
      exercisesWithoutPrimary,
      exercisesWithoutSecondary,
      exercisesNeedingMuscles,
      exercisesFullyAssigned,
      percentageComplete: Math.round(
        (exercisesFullyAssigned / totalPublicExercises) * 100,
      ),
    }

    if (!getNext) {
      return NextResponse.json(stats)
    }

    // Get next exercise to review
    const whereClause = skipExisting
      ? {
          isPublic: true,
          OR: [
            { muscleGroups: { none: {} } },
            { secondaryMuscleGroups: { none: {} } },
          ],
        }
      : { isPublic: true }

    const nextExercise = await prisma.baseExercise.findFirst({
      where: whereClause,
      select: {
        id: true,
        name: true,
        equipment: true,
        description: true,
        muscleGroups: { select: { id: true, name: true } },
        secondaryMuscleGroups: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
      skip: skipCount,
    })

    if (nextExercise) {
      console.log(`\n📋 QUEUE: ${nextExercise.name} (${exercisesNeedingMuscles} remaining)`)
    } else {
      console.log(`\n🎉 ALL DONE! No more exercises to process.`)
    }

    return NextResponse.json({
      ...stats,
      nextExercise: nextExercise
        ? {
            id: nextExercise.id,
            name: nextExercise.name,
            equipment: nextExercise.equipment,
            currentPrimary: nextExercise.muscleGroups,
            currentSecondary: nextExercise.secondaryMuscleGroups,
          }
        : null,
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 },
    )
  }
}
