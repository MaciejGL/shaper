import { NextResponse } from 'next/server'
import OpenAI from 'openai'

import { isAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { getExerciseVersionWhereClause } from '@/lib/exercise-version-filter'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

async function generateAndSaveEmbeddings() {
  const exercises = await prisma.baseExercise.findMany({
    where: {
      isPublic: true,
      ...getExerciseVersionWhereClause(),
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
          displayGroup: true,
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

    await prisma.$executeRaw`
      UPDATE "BaseExercise"
      SET embedding = ${JSON.stringify(vector)}::vector
      WHERE id = ${ex.id}
    `
  }

  return exercises.length
}

// GET - Check embedding status (read-only)
export async function GET() {
  try {
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [total, withEmbedding] = await Promise.all([
      prisma.baseExercise.count({
        where: {
          isPublic: true,
          ...getExerciseVersionWhereClause(),
        },
      }),
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM "BaseExercise" 
        WHERE "isPublic" = true AND embedding IS NOT NULL
      `,
    ])

    return NextResponse.json({
      total,
      withEmbedding: Number(withEmbedding[0].count),
      missingEmbedding: total - Number(withEmbedding[0].count),
    })
  } catch (error) {
    console.error('Embedding status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check embedding status' },
      { status: 500 },
    )
  }
}

// POST - Generate embeddings (mutating operation)
export async function POST() {
  try {
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const total = await generateAndSaveEmbeddings()
    return NextResponse.json({ success: true, total })
  } catch (error) {
    console.error('Embedding generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate embeddings' },
      { status: 500 },
    )
  }
}
