import { createReadStream, unlinkSync, writeFileSync } from 'fs'
import { NextResponse } from 'next/server'
import { tmpdir } from 'os'
import path from 'path'

import { prisma } from '@/lib/db'
import { openai } from '@/lib/open-ai'

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID!
const VECTOR_STORE_NAME = 'exercise-base' // change if you need more than one
const TMP_FILENAME = 'exercises-list.json' // JSON-Lines ⇢ one doc per line

export async function POST() {
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
    /* 2. Flatten to JSON-Lines & save to a temp file                     */
    const tmpPath = path.join(tmpdir(), TMP_FILENAME)

    const json = baseExercises
      .map((ex) =>
        JSON.stringify({
          id: ex.id, // we’ll keep IDs as metadata
          text: `${ex.name}. Muscles: ${ex.muscleGroups
            .map((m) => m.name)
            .join(', ')}`,
          metadata: { userId: ex.createdBy?.id || 'system' },
        }),
      )
      .join('\n')

    writeFileSync(tmpPath, json, 'utf-8')

    /* ------------------------------------------------------------------ */
    /* 3. Get (or create) a vector store                                  */
    const { data: stores } = await openai.vectorStores.list({ limit: 100 })
    let vectorStore = stores.find((s) => s.name === VECTOR_STORE_NAME)

    if (!vectorStore?.id) {
      vectorStore = await openai.vectorStores.create({
        name: VECTOR_STORE_NAME,
      })
    } else {
      await openai.vectorStores.delete(vectorStore.id)
    }

    /* ------------------------------------------------------------------ */
    /* 4. Upload the new file → store & wait until chunks are ready       */
    await openai.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
      files: [createReadStream(tmpPath)],
    }) // expects `{ files: Uploadable[] }`  :contentReference[oaicite:0]{index=0}

    /* (optional) remove temp file */
    unlinkSync(tmpPath)

    /* ------------------------------------------------------------------ */
    /* 5. Tell the Assistant to use this store for `file_search`          */
    await openai.beta.assistants.update(ASSISTANT_ID, {
      tool_resources: {
        file_search: { vector_store_ids: [vectorStore.id] }, // v2 Assistants API
      },
    })

    /* ------------------------------------------------------------------ */
    /* 6. Done!                                                           */
    return NextResponse.json({
      success: true,
      vectorStoreId: vectorStore.id,
    })
  } catch (err) {
    console.error('[EXERCISE_VECTOR_UPLOAD]', err)
    return NextResponse.json(
      { error: 'Failed to refresh vector store' },
      { status: 500 },
    )
  }
}
