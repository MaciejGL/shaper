import { NextResponse } from 'next/server'
// Adjust path to your Prisma client
import OpenAI from 'openai'

import { prisma } from '@/lib/db'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST() {
  try {
    const exercises = await prisma.baseExercise.findMany({
      where: {
        isPublic: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        equipment: true,
        type: true,
        additionalInstructions: true,
        muscleGroups: {
          select: {
            name: true,
            alias: true,
            groupSlug: true,
          },
        },
      },
    })

    for (const ex of exercises) {
      const text = `
        ${ex.name}
        Equipment: ${ex.equipment || ''}
        Type: ${ex.type || ''}
        Muscle groups: ${JSON.stringify(ex.muscleGroups)}
        ${ex.description || ''}
        ${ex.additionalInstructions || ''}
      `.trim()

      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      })

      const vector = embeddingResponse.data[0].embedding

      // Save vector manually using raw SQL, because Prisma doesn't support vector[]
      await prisma.$executeRaw`
      UPDATE "BaseExercise"
      SET embedding = ${JSON.stringify(vector)}::vector
      WHERE id = ${ex.id}
    `
    }

    return NextResponse.json({ success: true, total: exercises.length })
  } catch (error) {
    console.error('Embedding Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate embeddings' },
      { status: 500 },
    )
  }
}
