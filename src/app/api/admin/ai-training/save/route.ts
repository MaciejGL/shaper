import { NextRequest, NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/admin-auth'
import {
  loadTrainingExamples,
  saveTrainingExample,
} from '@/lib/ai-training/storage'
import type { TrainingExample } from '@/lib/ai-training/types'

export async function POST(request: NextRequest) {
  try {
    await isAdminUser()

    const body = await request.json()

    // Handle both single example and array of examples
    const examples: TrainingExample[] = body.examples || [body]

    // Validate each example
    for (const example of examples) {
      if (!example.id || !example.input || !example.output) {
        return NextResponse.json(
          { error: 'Invalid training example format' },
          { status: 400 },
        )
      }
    }

    // Save each example
    for (const example of examples) {
      saveTrainingExample(example)
    }

    return NextResponse.json({ success: true, count: examples.length })
  } catch (error) {
    console.error('Error saving training example:', error)
    return NextResponse.json(
      { error: 'Failed to save training example' },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    await isAdminUser()

    const examples = loadTrainingExamples()

    return NextResponse.json({ examples })
  } catch (error) {
    console.error('Error loading training examples:', error)
    return NextResponse.json(
      { error: 'Failed to load training examples' },
      { status: 500 },
    )
  }
}
