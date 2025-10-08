import { NextRequest, NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { openai } from '@/lib/open-ai/open-ai'

type WorkoutType =
  | 'fullbody'
  | 'upper-lower'
  | 'push-pull-legs'
  | 'split'
  | 'upper-body'
  | 'lower-body'
  | 'glute-focus'
  | 'arms-only'

type TrainingFocus = 'STRENGTH' | 'HYPERTROPHY' | 'ENDURANCE'

export async function POST(request: NextRequest) {
  try {
    await isAdminUser()

    const { workoutType, trainingFocus, customPrompt } = await request.json()

    if (!workoutType || !trainingFocus) {
      return NextResponse.json(
        { error: 'Workout type and training focus are required' },
        { status: 400 },
      )
    }

    // Get all exercises from database for matching
    const dbExercises = await prisma.baseExercise.findMany({
      where: { isPublic: true },
      select: {
        id: true,
        name: true,
        equipment: true,
        muscleGroups: {
          select: { name: true },
        },
      },
    })

    // Create a lookup map for AI
    const exerciseNames = dbExercises.map((ex) => ({
      name: ex.name,
      equipment: ex.equipment,
    }))

    // Build workout type specific prompt
    const workoutTypePrompts = {
      fullbody:
        'Create 10 different FULL BODY workouts that target all major muscle groups in each session',
      'upper-lower':
        'Create 10 different UPPER/LOWER SPLIT workouts - alternate between upper body and lower body focus',
      'push-pull-legs':
        'Create 10 different PUSH/PULL/LEGS workouts - alternate between push muscles (chest/shoulders/triceps), pull muscles (back/biceps), and legs',
      split:
        'Create 10 different BODY PART SPLIT workouts - each focusing on specific muscle groups (chest day, back day, leg day, etc.)',
      'upper-body':
        'Create 10 different UPPER BODY FOCUS workouts targeting chest, back, shoulders, and arms',
      'lower-body':
        'Create 10 different LOWER BODY FOCUS workouts targeting quads, hamstrings, glutes, and calves',
      'glute-focus':
        'Create 10 different GLUTE-FOCUSED workouts for women, emphasizing glute development with hip thrusts, squats, lunges, and glute bridges',
      'arms-only':
        'Create 10 different ARMS-ONLY workouts focusing on biceps, triceps, and forearms',
    }

    const repRanges = {
      STRENGTH: '4-10 reps',
      HYPERTROPHY: '8-15 reps',
      ENDURANCE: '12-20 reps',
    }

    const rpeRanges = {
      STRENGTH: '8-10',
      HYPERTROPHY: '7-9',
      ENDURANCE: '6-8',
    }

    // Use GPT-4 to generate 10 workout examples
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a professional fitness trainer creating workout examples for AI training data.

Your task is to create 10 different workout examples based on the specified parameters.

CRITICAL: Each workout must have a DIFFERENT number of exercises. Create this exact distribution:
- Workout 1: 4 exercises
- Workout 2: 4 exercises  
- Workout 3: 5 exercises
- Workout 4: 5 exercises
- Workout 5: 6 exercises
- Workout 6: 6 exercises
- Workout 7: 7 exercises
- Workout 8: 7 exercises
- Workout 9: 8 exercises
- Workout 10: 8 exercises

This creates realistic variety in workout complexity and duration.

You must respond in JSON format with the following structure:
{
  "workouts": [
    {
      "name": "Workout name (e.g., 'Full Body Strength #1', 'Upper Body Hypertrophy #2')",
      "exercises": [
        {
          "id": "exercise_id_from_database",
          "name": "Exercise name",
          "sets": number,
          "minReps": number,
          "maxReps": number,
          "rpe": number,
          "explanation": "Why this exercise was selected"
        }
      ],
      "summary": "Brief workout overview",
      "reasoning": "Professional explanation of programming logic"
    }
  ]
}

Available exercises database:
${JSON.stringify(exerciseNames.slice(0, 200), null, 2)}

Rules for Exercise Matching:
- EXACT MATCH: If input exactly matches a database exercise, use it
- BASE vs VARIATION: 
  * If input is generic (e.g., "Deadlift", "Press", "Leg Extension"), match to BASE exercise (shortest name, no modifiers)
  * If input is specific with modifiers (e.g., "Romanian Deadlift", "Single Leg Extension"), match to that EXACT variation
- Critical Examples:
  * "Leg Extension" → "Leg Extension" (NOT "Single Leg Extension" or "Seated Leg Extension")
  * "Single Leg Extension" → "Single Leg Extension" (variation explicitly requested)
  * "Deadlift" → "Deadlift" (NOT "Romanian Deadlift" or "Snatch-grip Deadlift")
  * "Romanian Deadlift" → "Romanian Deadlift" (variation explicitly requested)
  * "Press" → "Press" (NOT "Incline Press" or "Shoulder Press")
  * "Incline Dumbbell Press" → "Incline Dumbbell Press" (specific variation requested)
- Rule: If the input has NO modifying words (single, dumbbell, barbell, incline, etc.), choose the BASE exercise
- If no good match exists, use original name and it will be flagged for review

Other Rules:
- Use appropriate rep ranges: ${repRanges[trainingFocus as TrainingFocus]}
- For multicoumpound exercises, use the lower rep range within the target
- For isolation exercises, use the higher rep range within the target
- Use appropriate RPE ranges: ${rpeRanges[trainingFocus as TrainingFocus]}
- Follow the exact exercise count distribution specified above
- Include proper warm-up considerations in reasoning
- Generate professional, varied workouts that demonstrate different approaches
- Be creative but realistic with exercise selection
- Each workout should be distinctly different from the others
- Mix compound and isolation exercises appropriately
- Ensure proper muscle group distribution`,
        },
        {
          role: 'user',
          content: `${workoutTypePrompts[workoutType as WorkoutType]}

Training Focus: ${trainingFocus} (${repRanges[trainingFocus as TrainingFocus]}, RPE ${rpeRanges[trainingFocus as TrainingFocus]})

${customPrompt ? `Additional Instructions: ${customPrompt}` : ''}

Create 10 different workout examples that I can review and approve for training data.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7, // Higher temperature for more variety
    })

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}')

    // DEBUG: Log what AI returned
    console.info('🤖 AI Bulk Response:', JSON.stringify(parsed, null, 2))

    if (!parsed.workouts || !Array.isArray(parsed.workouts)) {
      throw new Error('Invalid response structure - missing workouts array')
    }

    // Process each workout
    const processedWorkouts = parsed.workouts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((workout: any, index: number) => {
        if (!workout.exercises || !Array.isArray(workout.exercises)) {
          console.warn(`Workout ${index + 1} missing exercises array`)
          return null
        }

        // Match exercises to database IDs
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const matchedExercises = workout.exercises.map((ex: any) => {
          console.info(`🔍 AI chose: "${ex.name}" for exercise ${index + 1}`)

          const dbMatch = dbExercises.find(
            (db) => db.name.toLowerCase() === ex.name?.toLowerCase(),
          )

          console.info(
            `📊 DB Match result: ${dbMatch ? `✅ "${dbMatch.name}"` : '❌ No match'}`,
          )

          return {
            id: dbMatch?.id || null,
            name: dbMatch?.name || ex.name,
            equipment: dbMatch?.equipment || null,
            muscleGroups: dbMatch?.muscleGroups.map((m) => m.name) || [],
            sets: ex.sets || 3,
            minReps: ex.minReps || 8,
            maxReps: ex.maxReps || 12,
            rpe: ex.rpe || 7,
            explanation: ex.explanation || '',
            matched: !!dbMatch,
          }
        })

        return {
          exercises: matchedExercises,
          summary: workout.summary || `Generated ${workoutType} workout`,
          reasoning: workout.reasoning || 'AI-generated workout example',
        }
      })
      .filter(Boolean) // Remove null entries

    return NextResponse.json({
      workouts: processedWorkouts,
      totalGenerated: processedWorkouts.length,
    })
  } catch (error) {
    console.error('Error generating bulk workouts:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate workouts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
