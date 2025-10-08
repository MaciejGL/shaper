import { NextRequest, NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/admin-auth'
import {
  type UnmatchedExercise,
  saveUnmatchedExercise,
} from '@/lib/ai-training/unmatched-storage'
import { prisma } from '@/lib/db'
import { openai } from '@/lib/open-ai/open-ai'

export async function POST(request: NextRequest) {
  try {
    await isAdminUser()

    const { workoutText } = await request.json()

    if (!workoutText) {
      return NextResponse.json(
        { error: 'No workout text provided' },
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

    // Use GPT-4 to parse the workout
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a fitness expert that parses workout programs from text/Excel format.

Your task is to:
1. Extract each exercise with its sets, reps, and RPE
2. Match exercise names to the closest match from the provided database
3. Determine target muscle groups from the workout structure
4. Identify equipment used
5. Generate professional reasoning explaining the programming logic

You must respond in JSON format with the following structure:
{
  "workout": {
    "name": "Workout name (e.g., 'Push #1', 'Legs #2')",
    "exercises": [
      {
        "originalName": "Exercise name from input",
        "matchedName": "Closest match from database",
        "sets": number,
        "minReps": number,
        "maxReps": number,
        "rpe": number,
        "explanation": "Why this exercise was selected"
      }
    ],
    "targetMuscleGroups": ["Chest", "Shoulders", "Triceps"],
    "summary": "Brief workout overview",
    "reasoning": "Professional explanation of programming logic - why these exercises, this order, this rep/set scheme"
  }
}

Available exercises database:
${JSON.stringify(exerciseNames.slice(0, 100), null, 2)}

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
- RPE: if percentage given, estimate RPE (70%=7, 80%=8, 90%=9, etc)
- Reps: extract range (e.g., "8-10" = minReps: 8, maxReps: 10)
- Generate reasoning that explains: compound→isolation order, progressive overload, muscle group targeting
- Be professional and concise`,
        },
        {
          role: 'user',
          content: `Parse this workout:\n\n${workoutText}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}')

    // DEBUG: Log what AI returned
    console.info('🤖 AI Raw Response:', JSON.stringify(parsed, null, 2))

    // Helper function to find best exercise match (TEMPORARILY DISABLED FOR DEBUG)
    /* 
    const findBestMatch = (
      originalName: string,
      matchedName?: string,
    ): (typeof dbExercises)[0] | undefined => {
      const searchName = (matchedName || originalName).toLowerCase().trim()

      // 1. Try exact match first (highest priority)
      const exactMatch = dbExercises.find(
        (db) => db.name.toLowerCase() === searchName,
      )
      if (exactMatch) return exactMatch

      // 2. Find exercises that match the search term
      const partialMatches = dbExercises.filter((db) => {
        const dbLower = db.name.toLowerCase()
        return dbLower.includes(searchName) || searchName.includes(dbLower)
      })

      if (partialMatches.length === 0) return undefined
      if (partialMatches.length === 1) return partialMatches[0]

      // 3. Multiple matches - need to pick the best one
      partialMatches.sort((a, b) => {
        const aLower = a.name.toLowerCase()
        const bLower = b.name.toLowerCase()

        // Check if search term matches the ENTIRE exercise name (just case/spacing differences)
        const aIsExactMatch =
          aLower.replace(/[\s-]+/g, '') === searchName.replace(/[\s-]+/g, '')
        const bIsExactMatch =
          bLower.replace(/[\s-]+/g, '') === searchName.replace(/[\s-]+/g, '')

        if (aIsExactMatch && !bIsExactMatch) return -1
        if (!aIsExactMatch && bIsExactMatch) return 1

        // Check if the exercise name starts and ends with search term (perfect match)
        // e.g., "leg extension" matches "Leg extension" better than "Single leg extension"
        const aStartsAndEnds = aLower.trim() === searchName.trim()
        const bStartsAndEnds = bLower.trim() === searchName.trim()

        if (aStartsAndEnds && !bStartsAndEnds) return -1
        if (!aStartsAndEnds && bStartsAndEnds) return 1

        // If search contains multiple words, check for specificity
        const searchWords = searchName
          .split(/[\s-]+/)
          .filter((w) => w.length > 2)

        if (searchWords.length > 0) {
          // Count additional words in exercise name beyond search words
          const aWords = aLower.split(/[\s-]+/).filter((w) => w.length > 2)
          const bWords = bLower.split(/[\s-]+/).filter((w) => w.length > 2)
          const aExtraWords = aWords.length - searchWords.length
          const bExtraWords = bWords.length - searchWords.length

          // Prefer exercises with fewer extra words (closer to base exercise)
          // e.g., "Leg extension" (0 extra) over "Single leg extension" (1 extra)
          if (aExtraWords !== bExtraWords) {
            return aExtraWords - bExtraWords
          }
        }

        // Default: prefer shorter names (base exercises)
        return a.name.length - b.name.length
      })

      return partialMatches[0]
    }
    */

    // Match exercises to database IDs
    const matchedExercises = parsed.workout.exercises.map(
      (ex: {
        originalName: string
        matchedName?: string
        equipment?: string
        sets: number
        minReps: number
        maxReps: number
        rpe: number
        explanation: string
      }) => {
        // DEBUG: Temporarily disable findBestMatch - use AI's exact choice
        console.info(
          `🔍 AI chose: originalName="${ex.originalName}", matchedName="${ex.matchedName}"`,
        )

        const dbMatch = dbExercises.find(
          (db) =>
            db.name.toLowerCase() ===
            (ex.matchedName || ex.originalName).toLowerCase(),
        )

        console.info(
          `📊 DB Match result: ${dbMatch ? `✅ "${dbMatch.name}"` : '❌ No match'}`,
        )

        // const dbMatch = findBestMatch(ex.originalName, ex.matchedName)

        // Save unmatched exercises for later review
        if (!dbMatch) {
          const unmatchedExercise: UnmatchedExercise = {
            id: `unmatched-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: ex.originalName || ex.matchedName || 'Unknown',
            suggestedEquipment: ex.equipment,
            suggestedMuscleGroups: parsed.workout.targetMuscleGroups || [],
            parsedFrom: parsed.workout.name || 'Unknown workout',
            timestamp: new Date().toISOString(),
            sets: ex.sets,
            reps: `${ex.minReps}-${ex.maxReps}`,
            rpe: ex.rpe,
          }
          saveUnmatchedExercise(unmatchedExercise)
        }

        return {
          id: dbMatch?.id || null,
          name: dbMatch?.name || ex.originalName,
          equipment: dbMatch?.equipment || null,
          muscleGroups: dbMatch?.muscleGroups.map((m) => m.name) || [],
          sets: ex.sets || 3,
          minReps: ex.minReps || 8,
          maxReps: ex.maxReps || 12,
          rpe: ex.rpe || 7,
          explanation: ex.explanation || '',
          matched: !!dbMatch,
        }
      },
    )

    const unmatchedCount = matchedExercises.filter(
      (ex: { matched: boolean }) => !ex.matched,
    ).length

    return NextResponse.json({
      workout: {
        name: parsed.workout.name,
        exercises: matchedExercises,
        targetMuscleGroups: parsed.workout.targetMuscleGroups,
        summary: parsed.workout.summary,
        reasoning: parsed.workout.reasoning,
      },
      unmatchedCount,
    })
  } catch (error) {
    console.error('Error parsing workout:', error)
    return NextResponse.json(
      {
        error: 'Failed to parse workout',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
