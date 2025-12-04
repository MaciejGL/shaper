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
  try {
    console.info(`[VECTOR_STORE] Creating vector store for ${assistantId}`)

    // List existing vector stores
    const { data: stores } = await openai.vectorStores.list({ limit: 100 })
    let vectorStore = stores.find((s) => s.name === storeName)

    // Delete existing vector store if found
    if (vectorStore?.id) {
      console.info(
        `[VECTOR_STORE] Deleting existing vector store: ${vectorStore.id}`,
      )
      await openai.vectorStores.delete(vectorStore.id)
    }

    // Create new vector store
    console.info(`[VECTOR_STORE] Creating new vector store: ${storeName}`)
    vectorStore = await openai.vectorStores.create({
      name: storeName,
      expires_after: {
        anchor: 'last_active_at',
        days: 30, // Keep for 30 days after last use
      },
    })

    if (!vectorStore?.id) {
      throw new Error('Failed to create vector store')
    }

    // Create a unique temp file for this assistant
    const tmpPath = path.join(
      tmpdir(),
      `${storeName}-exercises-${Date.now()}.json`,
    )
    writeFileSync(tmpPath, exerciseData, 'utf-8')

    console.info(
      `[VECTOR_STORE] Uploading file to vector store: ${vectorStore.id}`,
    )
    await openai.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
      files: [createReadStream(tmpPath)],
    })

    // Clean up temp file
    unlinkSync(tmpPath)

    // Associate vector store with assistant - clear existing first
    console.info(
      `[VECTOR_STORE] Associating vector store with assistant: ${assistantId}`,
    )
    await openai.beta.assistants.update(assistantId, {
      tool_resources: {
        file_search: { vector_store_ids: [vectorStore.id] },
      },
    })

    console.info(
      `[VECTOR_STORE] Successfully created vector store: ${vectorStore.id}`,
    )
    return vectorStore.id
  } catch (error) {
    console.error(
      `[VECTOR_STORE] Error creating vector store for ${assistantId}:`,
      error,
    )
    throw error
  }
}

export async function POST() {
  await isAdminUser()
  try {
    /* ------------------------------------------------------------------ */
    /* 1. Pull public exercises from DB with richer data                  */
    const baseExercises = await prisma.baseExercise.findMany({
      where: { isPublic: true },
      include: {
        muscleGroups: {
          select: { name: true, alias: true, displayGroup: true },
        },
        secondaryMuscleGroups: {
          select: { name: true, alias: true, displayGroup: true },
        },
        createdBy: { select: { id: true } },
        _count: { select: { substitutes: true } },
      },
    })

    if (baseExercises.length === 0) {
      throw new Error('No public base exercises found')
    }

    console.info(
      `[EXERCISE_VECTOR_UPLOAD] Found ${baseExercises.length} public exercises`,
    )

    /* ------------------------------------------------------------------ */
    /* 2. Prepare rich exercise data for vector stores                    */
    const exerciseData = baseExercises
      .map((ex) => {
        const muscleGroups = ex.muscleGroups.map((m) => m.name).join(', ')
        const secondaryMuscles = ex.secondaryMuscleGroups
          .map((m) => m.name)
          .join(', ')
        const equipment = ex.equipment || 'Bodyweight'
        const difficulty = ex.difficulty || 'Intermediate'
        const type = ex.type || 'Strength'
        const description = ex.description || ''
        const instructions = ex.instructions ? ex.instructions.join(' ') : ''

        // Create rich text content for AI context
        const exerciseText = `
Exercise: ${ex.name}
Equipment: ${equipment}
Type: ${type}
Difficulty: ${difficulty}
Primary Muscles: ${muscleGroups}
Secondary Muscles: ${secondaryMuscles}
${description ? `Description: ${description}` : ''}
${instructions ? `Instructions: ${instructions}` : ''}
Popularity: ${ex._count.substitutes > 0 ? 'High (has substitutes)' : 'Standard'}
        `.trim()

        return JSON.stringify({
          id: ex.id,
          text: exerciseText,
          metadata: {
            userId: ex.createdBy?.id || 'system',
            equipment: equipment.toLowerCase(),
            difficulty: difficulty.toLowerCase(),
            primaryMuscles: ex.muscleGroups.map(
              (m) => m.displayGroup || m.name.toLowerCase(),
            ),
            secondaryMuscles: ex.secondaryMuscleGroups.map(
              (m) => m.displayGroup || m.name.toLowerCase(),
            ),
            type: type.toLowerCase(),
          },
        })
      })
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
