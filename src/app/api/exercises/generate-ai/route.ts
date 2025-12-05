import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/lib/auth/config'

import { generateExerciseContent } from './generate-content'
import { generateExerciseMuscles } from './generate-muscles'
import { generateSubstitutes } from './generate-substitutes'

export interface GenerateExerciseAIRequest {
  name: string
}

export interface GenerateExerciseAIResponse {
  suggestedName: string
  description: string
  instructions: [string, string]
  tips: string[]
  primaryMuscleIds: string[]
  secondaryMuscleIds: string[]
  equipment: string
  suggestedSubstituteIds: string[]
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user.role !== 'TRAINER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as GenerateExerciseAIRequest

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Exercise name is required' },
        { status: 400 },
      )
    }

    // Step 1: Generate muscles and equipment
    const muscles = await generateExerciseMuscles({
      name: body.name,
    })

    // Step 2: Generate content with muscle context
    const content = await generateExerciseContent({
      name: body.name,
      equipment: muscles.equipment,
      primaryMuscleIds: muscles.primaryMuscleIds,
      secondaryMuscleIds: muscles.secondaryMuscleIds,
    })

    // Step 3: Generate substitute suggestions based on muscles
    const substitutes = await generateSubstitutes({
      exerciseName: body.name,
      primaryMuscleIds: muscles.primaryMuscleIds,
      equipment: muscles.equipment,
    })

    const response: GenerateExerciseAIResponse = {
      suggestedName: muscles.suggestedName,
      description: content.description,
      instructions: content.instructions,
      tips: content.tips,
      primaryMuscleIds: muscles.primaryMuscleIds,
      secondaryMuscleIds: muscles.secondaryMuscleIds,
      equipment: muscles.equipment,
      suggestedSubstituteIds: substitutes.suggestedSubstituteIds,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to generate exercise AI content:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate exercise content',
      },
      { status: 500 },
    )
  }
}
