import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/lib/auth/config'

import { generateExerciseContent } from './generate-content'
import { generateExerciseMuscles } from './generate-muscles'

export interface GenerateExerciseAIRequest {
  name: string
  equipment?: string | null
}

export interface GenerateExerciseAIResponse {
  description: string
  instructions: [string, string]
  tips: string[]
  primaryMuscleIds: string[]
  secondaryMuscleIds: string[]
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

    // Generate muscles first
    const muscles = await generateExerciseMuscles({
      name: body.name,
      equipment: body.equipment,
    })

    // Generate content with muscle context
    const content = await generateExerciseContent({
      name: body.name,
      equipment: body.equipment,
      primaryMuscleIds: muscles.primaryMuscleIds,
      secondaryMuscleIds: muscles.secondaryMuscleIds,
    })

    const response: GenerateExerciseAIResponse = {
      description: content.description,
      instructions: content.instructions,
      tips: content.tips,
      primaryMuscleIds: muscles.primaryMuscleIds,
      secondaryMuscleIds: muscles.secondaryMuscleIds,
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
