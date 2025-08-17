import { createReadStream, unlinkSync, writeFileSync } from 'fs'
import { NextResponse } from 'next/server'
import { tmpdir } from 'os'
import path from 'path'

import { isAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { openai } from '@/lib/open-ai/open-ai'

// Add File polyfill for OpenAI SDK compatibility
if (typeof globalThis.File === 'undefined') {
  const { File } = await import('node:buffer')
  globalThis.File = File as typeof globalThis.File
}

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID!
const QUICK_WORKOUT_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_QUICKWORKOUT_ID!
const VECTOR_STORE_NAME = 'exercise-base' // change if you need more than one
const QUICK_WORKOUT_VECTOR_STORE_NAME = 'exercise-base-quickworkout'

// Helper function to create/update vector store for an assistant
async function createVectorStoreForAssistant(
  assistantId: string,
  storeName: string,
  exerciseData: string,
) {
  const { data: stores } = await openai.vectorStores.list({ limit: 100 })
  let vectorStore = stores.find((s) => s.name === storeName)

  if (vectorStore?.id) {
    await openai.vectorStores.delete(vectorStore.id)
  }

  vectorStore = await openai.vectorStores.create({
    name: storeName,
  })

  // Create a unique temp file for this assistant
  const tmpPath = path.join(tmpdir(), `${storeName}-exercises.json`)
  writeFileSync(tmpPath, exerciseData, 'utf-8')

  await openai.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
    files: [createReadStream(tmpPath)],
  })

  // Clean up temp file
  unlinkSync(tmpPath)

  // Associate vector store with assistant
  await openai.beta.assistants.update(assistantId, {
    tool_resources: {
      file_search: { vector_store_ids: [vectorStore.id] },
    },
  })

  return vectorStore.id
}

export async function POST() {
  await isAdminUser()
  try {
    /* ------------------------------------------------------------------ */
    /* 1. Pull public exercises from DB                                   */
    const baseExercises = await prisma.baseExercise.findMany({
      include: {
        muscleGroups: { select: { name: true } },
        createdBy: { select: { id: true } },
      },
    })

    if (baseExercises.length === 0) {
      throw new Error('No public base exercises found')
    }

    /* ------------------------------------------------------------------ */
    /* 2. Prepare exercise data for vector stores                         */
    const exerciseData = baseExercises
      .map((ex) =>
        JSON.stringify({
          id: ex.id, // we'll keep IDs as metadata
          text: `${ex.name}. Muscles: ${ex.muscleGroups
            .map((m) => m.name)
            .join(', ')}`,
          metadata: { userId: ex.createdBy?.id || 'system' },
        }),
      )
      .join('\n')

    /* ------------------------------------------------------------------ */
    /* 3. Create vector stores for both assistants                       */
    const [generalVectorStoreId, quickWorkoutVectorStoreId] = await Promise.all(
      [
        createVectorStoreForAssistant(
          ASSISTANT_ID,
          VECTOR_STORE_NAME,
          exerciseData,
        ),
        createVectorStoreForAssistant(
          QUICK_WORKOUT_ASSISTANT_ID,
          QUICK_WORKOUT_VECTOR_STORE_NAME,
          exerciseData,
        ),
      ],
    )

    console.info(
      '[EXERCISE_VECTOR_UPLOAD] Successfully updated both assistants:',
      {
        generalAssistant: {
          id: ASSISTANT_ID,
          vectorStoreId: generalVectorStoreId,
        },
        quickWorkoutAssistant: {
          id: QUICK_WORKOUT_ASSISTANT_ID,
          vectorStoreId: quickWorkoutVectorStoreId,
        },
      },
    )

    /* ------------------------------------------------------------------ */
    /* 4. Done!                                                           */
    return NextResponse.json({
      success: true,
      generalVectorStoreId,
      quickWorkoutVectorStoreId,
      exerciseCount: baseExercises.length,
    })
  } catch (err) {
    console.error('[EXERCISE_VECTOR_UPLOAD]', err)
    return NextResponse.json(
      { error: 'Failed to refresh vector store' },
      { status: 500 },
    )
  }
}
